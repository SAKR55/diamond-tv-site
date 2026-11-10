#!/usr/bin/env python3
"""Read only public, robots-allowed product metadata from an authorized product page.

The importer does not log in, bypass bot checks, download product images, or store page HTML.
Alibaba and AliExpress marketplace pages are intentionally routed to their official feeds/APIs.
"""
from __future__ import annotations

import html
import ipaddress
import json
import os
import re
import socket
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from urllib.robotparser import RobotFileParser

USER_AGENT = "DIAMOND-TV-ProductMetadataImporter/1.0"
MAX_PAGE_BYTES = 3 * 1024 * 1024
MAX_ROBOTS_BYTES = 256 * 1024
MAX_IMAGES = 8
MAX_VIDEOS = 6
MARKETPLACE_MESSAGE = (
    "هذا الرابط من Alibaba أو AliExpress. الاستيراد الآلي من صفحات السوق غير مفعّل؛ "
    "استخدم تغذية/API رسمية معتمدة تتيح إعادة استخدام بيانات المنتج والصور."
)


class ImportProblem(Exception):
    pass


def is_marketplace_host(host: str) -> bool:
    labels = host.lower().rstrip(".").split(".")
    return "alibaba" in labels or "aliexpress" in labels


def matching_host(left: str, right: str) -> bool:
    left = left.lower().removeprefix("www.").rstrip(".")
    right = right.lower().removeprefix("www.").rstrip(".")
    return left == right


def validate_url(raw: str, expected_host: str | None = None) -> str:
    value = str(raw or "").strip()
    if len(value) > 2048:
        raise ImportProblem("الرابط طويل أكثر من اللازم.")
    parts = urlsplit(value)
    if parts.scheme.lower() != "https" or not parts.hostname:
        raise ImportProblem("استخدم رابط HTTPS عامًّا.")
    if parts.username or parts.password:
        raise ImportProblem("لا تقبل الروابط التي تحتوي على اسم مستخدم أو كلمة مرور.")
    try:
        port = parts.port
    except ValueError as exc:
        raise ImportProblem("رقم المنفذ في الرابط غير صالح.") from exc
    if port not in (None, 443):
        raise ImportProblem("يُقبل اتصال HTTPS على المنفذ الافتراضي فقط.")
    try:
        host = parts.hostname.encode("idna").decode("ascii").lower().rstrip(".")
    except UnicodeError as exc:
        raise ImportProblem("اسم النطاق في الرابط غير صالح.") from exc
    if not host or len(host) > 253 or any(not label or len(label) > 63 for label in host.split(".")):
        raise ImportProblem("اسم النطاق في الرابط غير صالح.")
    if is_marketplace_host(host):
        raise ImportProblem(MARKETPLACE_MESSAGE)
    if expected_host and not matching_host(host, expected_host):
        raise ImportProblem("أوقفت القراءة لأن صفحة المنتج حوّلت إلى نطاق آخر.")
    try:
        ipaddress.ip_address(host.strip("[]"))
        raise ImportProblem("لا تُقبل عناوين IP مباشرة.")
    except ValueError:
        pass
    try:
        records = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    except OSError as exc:
        raise ImportProblem("تعذّر العثور على خادم صفحة المنتج.") from exc
    addresses = set()
    for record in records:
        try:
            address = ipaddress.ip_address(record[4][0].split("%", 1)[0])
        except ValueError:
            raise ImportProblem("عنوان خادم صفحة المنتج غير صالح.")
        if not address.is_global:
            raise ImportProblem("رفضت القراءة لأن النطاق لا يشير إلى خادم عام.")
        addresses.add(address)
    if not addresses:
        raise ImportProblem("تعذّر العثور على خادم صفحة المنتج.")
    path = parts.path or "/"
    return urlunsplit(("https", host, path, parts.query, ""))


class SameHostRedirect(HTTPRedirectHandler):
    def __init__(self, allowed_host: str):
        super().__init__()
        self.allowed_host = allowed_host

    def redirect_request(self, request, fp, code, msg, headers, newurl):
        validate_url(newurl, expected_host=self.allowed_host)
        return super().redirect_request(request, fp, code, msg, headers, newurl)


def fetch_public(url: str, expected_host: str, limit: int) -> tuple[bytes, str, str]:
    safe = validate_url(url, expected_host=expected_host)
    request = Request(
        safe,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/ld+json;q=0.9,*/*;q=0.1",
            "Accept-Encoding": "identity",
        },
    )
    opener = build_opener(SameHostRedirect(expected_host))
    try:
        with opener.open(request, timeout=15) as response:
            final_url = validate_url(response.geturl(), expected_host=expected_host)
            content_type = str(response.headers.get("Content-Type", "")).lower()
            if response.status < 200 or response.status >= 300:
                raise ImportProblem("لم يفتح الموقع صفحة المنتج.")
            data = response.read(limit + 1)
            if len(data) > limit:
                raise ImportProblem("صفحة المنتج أكبر من حد القراءة الآمن.")
            return data, content_type, final_url
    except HTTPError as exc:
        if exc.code in (401, 403, 429):
            raise ImportProblem("رفض الموقع القراءة العامة أو طلب تحققًا إضافيًا؛ لم يتم تجاوز الحماية.") from exc
        if exc.code == 404:
            raise ImportProblem("لم يتم العثور على صفحة المنتج.") from exc
        raise ImportProblem("رفض الموقع إرسال صفحة المنتج.") from exc
    except URLError as exc:
        raise ImportProblem("تعذّر الاتصال بصفحة المنتج.") from exc
    except TimeoutError as exc:
        raise ImportProblem("انتهت مهلة الاتصال بصفحة المنتج.") from exc


def robots_allows(url: str, host: str) -> bool:
    robots_url = f"https://{host}/robots.txt"
    try:
        data, _, _ = fetch_public(robots_url, host, MAX_ROBOTS_BYTES)
    except ImportProblem as exc:
        message = str(exc)
        if "لم يتم العثور" in message:
            return True
        return False
    text = data.decode("utf-8", errors="replace")
    parser = RobotFileParser()
    parser.set_url(robots_url)
    parser.parse(text.splitlines())
    return parser.can_fetch(USER_AGENT, url)


class ProductPageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.metadata: dict[str, str] = {}
        self.jsonld: list[str] = []
        self._in_jsonld = False
        self._script_depth = 0
        self._script_chunks: list[str] = []

    def handle_starttag(self, tag, attrs):
        attrs = {str(k).lower(): str(v) for k, v in attrs if k and v is not None}
        if tag.lower() == "meta":
            key = (attrs.get("property") or attrs.get("name") or attrs.get("itemprop") or "").strip().lower()
            value = attrs.get("content", "").strip()
            if key and value and key not in self.metadata:
                self.metadata[key] = value
        if tag.lower() == "script":
            self._script_depth += 1
            self._in_jsonld = "ld+json" in attrs.get("type", "").lower()
            self._script_chunks = []

    def handle_data(self, data):
        if self._in_jsonld:
            self._script_chunks.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "script" and self._script_depth:
            if self._in_jsonld:
                raw = "".join(self._script_chunks).strip()
                if raw:
                    self.jsonld.append(raw[:1_500_000])
            self._script_depth = max(0, self._script_depth - 1)
            self._in_jsonld = False
            self._script_chunks = []


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data):
        self.parts.append(data)


def clean_text(value, limit: int = 1200) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return ""
    raw = html.unescape(str(value))
    parser = TextExtractor()
    try:
        parser.feed(raw)
        raw = " ".join(parser.parts)
    except Exception:
        raw = re.sub(r"<[^>]*>", " ", raw)
    raw = re.sub(r"\s+", " ", raw).strip()
    return raw[:limit]


def as_list(value) -> list:
    return value if isinstance(value, list) else ([] if value is None else [value])


def get_text(value) -> str:
    if isinstance(value, dict):
        return clean_text(value.get("name") or value.get("value") or value.get("text") or value.get("@id"))
    return clean_text(value)


def is_type(value, names: tuple[str, ...]) -> bool:
    types = as_list(value.get("@type")) if isinstance(value, dict) else []
    return any(str(item).lower().rsplit("/", 1)[-1].rsplit("#", 1)[-1] in names for item in types)


def walk_products(value, found: list[dict]):
    if isinstance(value, list):
        for item in value:
            walk_products(item, found)
        return
    if not isinstance(value, dict):
        return
    if is_type(value, ("product", "productgroup", "individualproduct", "someproducts")):
        found.append(value)
    for key, item in value.items():
        if key in ("@context",):
            continue
        if isinstance(item, (dict, list)):
            walk_products(item, found)


def parse_jsonld(parser: ProductPageParser) -> list[dict]:
    found: list[dict] = []
    for raw in parser.jsonld:
        try:
            walk_products(json.loads(raw), found)
        except (json.JSONDecodeError, TypeError, RecursionError):
            continue
    unique: list[dict] = []
    seen = set()
    for item in found:
        name = get_text(item.get("name")).casefold()
        sku = get_text(item.get("sku")).casefold()
        key = (name, sku)
        if name and key not in seen:
            seen.add(key)
            unique.append(item)
    return unique


def asset_url(value, page_url: str) -> str:
    raw = get_text(value)
    if not raw:
        return ""
    absolute = urljoin(page_url, raw)
    parts = urlsplit(absolute)
    if parts.scheme.lower() != "https" or not parts.hostname or parts.username or parts.password:
        return ""
    host = parts.hostname.lower().rstrip(".")
    if is_marketplace_host(host):
        return ""
    try:
        ipaddress.ip_address(host.strip("[]"))
        return ""
    except ValueError:
        pass
    try:
        records = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
        if not records or any(not ipaddress.ip_address(record[4][0].split("%", 1)[0]).is_global for record in records):
            return ""
    except (OSError, ValueError):
        return ""
    return urlunsplit(("https", parts.netloc, parts.path, parts.query, ""))


def collect_image_values(value, page_url: str) -> list[str]:
    images: list[str] = []
    for item in as_list(value):
        if isinstance(item, dict):
            item = item.get("url") or item.get("contentUrl") or item.get("@id")
        url = asset_url(item, page_url)
        if url and url not in images:
            images.append(url)
        if len(images) >= MAX_IMAGES:
            break
    return images


def collect_video_values(value, page_url: str) -> list[str]:
    videos: list[str] = []
    for item in as_list(value):
        if isinstance(item, dict):
            item = item.get("contentUrl") or item.get("embedUrl") or item.get("url")
        url = asset_url(item, page_url)
        if url and url not in videos:
            videos.append(url)
        if len(videos) >= MAX_VIDEOS:
            break
    return videos


def get_offer(product: dict) -> dict:
    offers = as_list(product.get("offers"))
    for offer in offers:
        if isinstance(offer, dict):
            return offer
    return {}


def flatten_highlights(value) -> list[str]:
    out: list[str] = []
    for item in as_list(value):
        if isinstance(item, dict):
            item = item.get("itemListElement") or item.get("name") or item.get("text")
        text = get_text(item)
        if text and text not in out:
            out.append(text[:180])
    return out[:16]


def extract_product(product: dict, metadata: dict[str, str], final_url: str) -> tuple[dict, list[str]]:
    offer = get_offer(product)
    title = get_text(product.get("name")) or clean_text(metadata.get("og:title") or metadata.get("twitter:title"), 140)
    description = clean_text(product.get("description")) or clean_text(metadata.get("og:description") or metadata.get("description"), 1200)
    brand = get_text(product.get("brand")) or get_text(product.get("manufacturer"))
    sku = get_text(product.get("sku")) or get_text(product.get("mpn"))
    category = get_text(product.get("category"))
    price = get_text(offer.get("price") or offer.get("lowPrice"))
    currency = get_text(offer.get("priceCurrency"))
    old_price = ""
    availability_raw = get_text(offer.get("availability")).lower()
    availability = ""
    if "preorder" in availability_raw:
        availability = "preorder"
    elif "outofstock" in availability_raw or "soldout" in availability_raw:
        availability = "unavailable"
    images = collect_image_values(product.get("image"), final_url)
    meta_image = asset_url(metadata.get("og:image") or metadata.get("twitter:image"), final_url)
    if meta_image and meta_image not in images:
        images.insert(0, meta_image)
    images = images[:MAX_IMAGES]
    videos = collect_video_values(product.get("video") or product.get("hasVideo"), final_url)

    specifications: list[dict[str, str]] = []
    additional = product.get("additionalProperty") or product.get("specification")
    for entry in as_list(additional):
        if not isinstance(entry, dict):
            continue
        name = get_text(entry.get("name"))
        value = get_text(entry.get("value"))
        if name and value:
            specifications.append({"name": name[:80], "value": value[:160]})
    for key, label in (
        ("color", "اللون"),
        ("size", "المقاس"),
        ("material", "الخامة"),
        ("model", "الموديل"),
        ("weight", "الوزن"),
        ("pattern", "النقشة"),
    ):
        value = get_text(product.get(key))
        if value and not any(item["name"].lower() == label.lower() for item in specifications):
            specifications.append({"name": label, "value": value[:160]})
    variants = []
    for variant in as_list(product.get("hasVariant")):
        if isinstance(variant, dict):
            detail = get_text(variant.get("name")) or get_text(variant.get("sku"))
            if detail:
                variants.append(detail)
    if variants:
        specifications.append({"name": "الخيارات المتاحة", "value": "، ".join(variants[:8])[:160]})
    specifications = specifications[:24]

    highlights = flatten_highlights(product.get("positiveNotes") or product.get("featureList"))
    if not highlights:
        highlights = [item["name"] + ": " + item["value"] for item in specifications[:8]]
    found = []
    for label, value in (
        ("الاسم", title),
        ("الوصف", description),
        ("السعر", price),
        ("العملة", currency),
        ("الصور", images),
        ("المواصفات", specifications),
        ("الفيديو", videos),
        ("العلامة التجارية", brand),
        ("رمز المنتج", sku),
        ("القسم", category),
    ):
        if value:
            found.append(label)
    payload = {
        "title": title,
        "description": description,
        "brand": brand,
        "sku": sku,
        "category": category,
        "price": price,
        "oldPrice": old_price,
        "currency": currency,
        "availability": availability,
        "stock": None,
        "images": images,
        "videos": videos,
        "highlights": highlights,
        "specifications": specifications,
        "sourceUrl": final_url,
    }
    return payload, found


def parse_page(data: bytes, content_type: str, final_url: str) -> dict:
    if content_type and not any(kind in content_type for kind in ("text/html", "application/xhtml+xml", "application/ld+json", "text/plain")):
        raise ImportProblem("نوع الصفحة ليس صفحة منتج HTML عامة.")
    text = data.decode("utf-8", errors="replace")
    lower = text[:300_000].lower()
    if any(marker in lower for marker in ("verify you are human", "complete the captcha", "captcha challenge", "sign in to continue", "please log in to continue", "just a moment...")):
        raise ImportProblem("الصفحة تطلب تسجيل الدخول أو تحققًا إضافيًا؛ لم يتم تجاوزه.")
    parser = ProductPageParser()
    parser.feed(text)
    products = parse_jsonld(parser)
    metadata = parser.metadata
    if products:
        # Prefer a Product whose structured URL matches the page, then one with offers/images.
        products.sort(key=lambda item: (
            str(item.get("url", "")).rstrip("/") == final_url.rstrip("/"),
            bool(item.get("offers")),
            bool(item.get("image")),
            bool(item.get("name")),
        ), reverse=True)
        payload, found = extract_product(products[0], metadata, final_url)
    else:
        payload, found = extract_product({}, metadata, final_url)
    if not payload["title"]:
        raise ImportProblem("لم أجد اسم منتج أو بيانات Product منظمة في الصفحة.")
    if not payload["images"] and metadata.get("og:image"):
        image = asset_url(metadata.get("og:image"), final_url)
        if image:
            payload["images"] = [image]
            found.append("الصورة")
    warnings = []
    if not payload["images"]:
        warnings.append("لم تتضمن الصفحة رابط صورة عامة.")
    if not payload["price"]:
        warnings.append("لم تتضمن الصفحة سعرًا واضحًا.")
    if not products:
        warnings.append("اُستخدمت بيانات Open Graph العامة فقط؛ راجع المواصفات يدويًا.")
    return {"ok": True, "finalUrl": final_url, "product": payload, "found": list(dict.fromkeys(found)), "warnings": warnings}


def write_result(request_id: str, result: dict):
    if not re.fullmatch(r"[A-Za-z0-9-]{8,90}", request_id):
        raise ImportProblem("رقم طلب الاستيراد غير صالح.")
    result["requestId"] = request_id
    out_dir = Path(".github/product-imports")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{request_id}.json"
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=out_dir, delete=False) as handle:
        json.dump(result, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
        temporary = Path(handle.name)
    temporary.replace(out_path)


def main():
    request_id = str(os.environ.get("REQUEST_ID", ""))
    source_url = str(os.environ.get("PRODUCT_URL", ""))
    try:
        safe = validate_url(source_url)
        host = urlsplit(safe).hostname or ""
        if not robots_allows(safe, host):
            raise ImportProblem("ملف robots.txt في هذا الموقع لا يسمح بقراءة صفحة المنتج.")
        data, content_type, final_url = fetch_public(safe, host, MAX_PAGE_BYTES)
        final_host = urlsplit(final_url).hostname or host
        if not robots_allows(final_url, final_host):
            raise ImportProblem("ملف robots.txt لا يسمح بقراءة عنوان صفحة المنتج النهائي.")
        result = parse_page(data, content_type, final_url)
    except ImportProblem as exc:
        result = {"ok": False, "error": str(exc)}
    except Exception:
        result = {"ok": False, "error": "تعذّر استيراد الصفحة. تأكد من الرابط أو استخدم مصدر بيانات رسميًا."}
    write_result(request_id, result)


if __name__ == "__main__":
    main()
