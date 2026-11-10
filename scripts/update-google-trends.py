#!/usr/bin/env python3
"""Refresh a small, niche-filtered Google Trends RSS snapshot for the admin writer."""

from __future__ import annotations

import json
import re
import sys
import tempfile
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlencode, urlsplit
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from html import unescape
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "google-trends.json"
FEED = "https://trends.google.com/trending/rss?geo=SA&hl=ar"
SOURCE = "https://trends.google.com/trending?geo=SA&hl=ar"

SPORTS = re.compile(
    r"كرة|كوره|دوري|مباراة|مباريات|منتخب|بطولة|كأس|الهلال|النصر|الاتحاد|الاهلي|الأهلي|"
    r"ابو\s*تريكة|ابو\s*تريكه|أبو\s*تريكة|أبو\s*تريكه|"
    r"برشلونة|ريال مدريد|ليفربول|ارسنال|مانشستر|يوفنتوس|بايرن|باريس سان|"
    r"world cup|football|soccer|league|match|cricket|basketball|champions league|asia cup|"
    r"\b(?:u1[789]|under-?19|nba|nfl|afc|uefa|fifa)\b|"
    r"\b(?:score|standings|tournament|premier league)\b|"
    r"barcelona|real madrid|liverpool|arsenal|manchester|juventus|bayern|chelsea|"
    r"al hilal|al nassr|al ittihad|al ahly|afcon|warriors|pelicans|lakers|celtics",
    re.IGNORECASE,
)
OFFICIAL_DOMAINS = {
    "fifa.com", "uefa.com", "the-afc.com", "cafonline.com", "icc-cricket.com",
    "nba.com", "nfl.com", "premierleague.com", "saudiproleague.com", "spl.com.sa",
    "spa.gov.sa", "mbc.net", "shahid.mbc.net", "netflix.com", "primevideo.com", "disneyplus.com",
}
RECOGNIZED_DOMAINS = {
    "reuters.com", "apnews.com", "afp.com", "bbc.com", "bbc.co.uk", "aljazeera.net",
    "aljazeera.com", "dawn.com", "ndtv.com", "ndtvprofit.com", "minutemirror.com.pk",
    "espn.com", "espncricinfo.com", "cricbuzz.com", "skysports.com", "arabnews.com",
    "alarabiya.net", "asharq.com", "theguardian.com", "goal.com", "kooora.com",
    "thehindu.com", "indiatoday.in", "indianexpress.com", "hindustantimes.com", "timesofindia.indiatimes.com",
    "variety.com", "hollywoodreporter.com", "deadline.com", "yahoo.com", "yahoo.net",
}

ENTERTAINMENT = re.compile(
    r"مسلسل|مسلسلات|فيلم|أفلام|افلام|سينما|دراما|ممثل|ممثلة|حلقة|رمضان|"
    r"برنامج\s*(?:تلفزيوني|حواري|فني|ترفيهي)|نتفلكس|شاهد|mbc|osn|نتفليكس|"
    r"tv\s+series|television\s+series|movie|film|actor|actress|episode|season|netflix|shahid|disney|prime video|hbo|tv show|television",
    re.IGNORECASE,
)
STOPWORDS = {"الذي", "التي", "هذا", "هذه", "بعد", "قبل", "عبر", "حول", "ضمن", "أبرز", "اكثر", "أكثر", "اليوم", "أمس"}


class MetaDescriptionParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.description = ""
        self.title = ""
        self.title_parts: list[str] = []
        self.in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        lowered_tag = tag.lower()
        if lowered_tag == "title":
            self.in_title = True
            return
        if lowered_tag != "meta":
            return
        values = {key.lower(): (value or "") for key, value in attrs}
        key = (values.get("property") or values.get("name") or "").lower()
        content = re.sub(r"\s+", " ", unescape(values.get("content", ""))).strip()
        if key in {"og:title", "twitter:title"} and content and not self.title:
            self.title = content[:300]
        if key in {"og:description", "description", "twitter:description"} and content and not self.description:
            self.description = content[:700]

    def handle_data(self, data: str) -> None:
        if self.in_title and data.strip():
            self.title_parts.append(data.strip())

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self.in_title = False
            if not self.title:
                self.title = re.sub(r"\s+", " ", " ".join(self.title_parts)).strip()[:300]


class PlainTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        text = re.sub(r"\s+", " ", unescape(data)).strip()
        if text:
            self.parts.append(text)


def plain_text(value: str, limit: int = 700) -> str:
    parser = PlainTextParser()
    parser.feed(value or "")
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip()[:limit]


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def child_text(node: ET.Element, wanted: str) -> str:
    for child in node.iter():
        if local_name(child.tag) == wanted.lower() and child.text:
            return child.text.strip()
    return ""


def topic_terms(title: str) -> list[str]:
    normalized = re.sub(r"[أإآٱ]", "ا", title.lower())
    normalized = normalized.replace("ى", "ي").replace("ة", "ه")
    terms = re.findall(r"[a-z0-9\u0600-\u06ff]+", normalized)
    return [term for term in terms if len(term) >= 4 and term not in STOPWORDS]


def relevant_news(topic: str, news: list[dict]) -> list[dict]:
    terms = topic_terms(topic)
    if not terms:
        return news
    accepted = []
    for entry in news:
        text = " ".join((str(entry.get("title", "")), str(entry.get("source", ""))))
        normalized = re.sub(r"[أإآٱ]", "ا", text.lower()).replace("ى", "ي").replace("ة", "ه")
        compact = re.sub(r"[^a-z0-9\u0600-\u06ff]", "", normalized)
        if any(term in normalized or term in compact for term in terms):
            accepted.append(entry)
    return accepted


def publisher_details(url: str) -> tuple[str, str]:
    try:
        host = (urlsplit(url).hostname or "").lower().removeprefix("www.")
        if host in OFFICIAL_DOMAINS or any(host.endswith("." + item) for item in OFFICIAL_DOMAINS):
            return host, "official"
        if host in RECOGNIZED_DOMAINS or any(host.endswith("." + item) for item in RECOGNIZED_DOMAINS):
            return host, "recognized"
        return host, "unlisted"
    except Exception:
        return "", "unlisted"


PUBLISHER_NAME_DOMAINS = {
    "reuters": "reuters.com", "associated press": "apnews.com", "ap news": "apnews.com",
    "afp": "afp.com", "bbc": "bbc.com", "al jazeera": "aljazeera.net", "dawn": "dawn.com",
    "the hindu": "thehindu.com", "india today": "indiatoday.in", "indian express": "indianexpress.com",
    "hindustan times": "hindustantimes.com", "times of india": "timesofindia.indiatimes.com",
    "ndtv": "ndtv.com", "espn": "espn.com", "espncricinfo": "espncricinfo.com",
    "cricbuzz": "cricbuzz.com", "sky sports": "skysports.com", "arab news": "arabnews.com",
    "al arabiya": "alarabiya.net", "asharq": "asharq.com", "the guardian": "theguardian.com",
    "goal": "goal.com", "kooora": "kooora.com", "variety": "variety.com",
    "hollywood reporter": "hollywoodreporter.com", "deadline": "deadline.com", "yahoo": "yahoo.com",
}


def trusted_publisher_from_name(name: str) -> tuple[str, str]:
    normalized = re.sub(r"[^a-z0-9]+", " ", (name or "").lower()).strip()
    for label, domain in PUBLISHER_NAME_DOMAINS.items():
        if label in normalized:
            return publisher_details("https://" + domain)
    return "", "unlisted"


def google_news_entries(topic: str) -> list[dict]:
    entries: list[dict] = []
    seen: set[str] = set()
    variants = [("ar", "SA", "SA:ar")]
    if not re.search(r"[\u0600-\u06ff]", topic) or len(entries) < 3:
        variants.append(("en", "US", "US:en"))
    for language, region, edition in variants:
        query = urlencode({"q": topic, "hl": language, "gl": region, "ceid": edition})
        url = "https://news.google.com/rss/search?" + query
        request = urllib.request.Request(url, headers={"User-Agent": "DIAMOND-TV-Trends/1.4 (+https://diamond-tv.shop/)"})
        try:
            with urllib.request.urlopen(request, timeout=12) as response:
                root = ET.fromstring(response.read())
        except Exception as error:
            print(f"Google News RSS unavailable for {topic} ({language}): {type(error).__name__}")
            continue
        for item in root.iter():
            if local_name(item.tag) != "item":
                continue
            title = child_text(item, "title")
            link = child_text(item, "link")
            source_node = next((node for node in item.iter() if local_name(node.tag) == "source"), None)
            source_name = (source_node.text or "").strip() if source_node is not None and source_node.text else ""
            publisher_url = (source_node.attrib.get("url", "") if source_node is not None else "")
            domain, tier = publisher_details(publisher_url)
            if tier == "unlisted":
                domain, tier = trusted_publisher_from_name(source_name)
            if not title or not link.startswith("https://") or tier == "unlisted" or link in seen:
                continue
            seen.add(link)
            entries.append({
                "title": title,
                "source": source_name or domain,
                "url": link,
                "domain": domain,
                "publisherTier": tier,
                "description": plain_text(child_text(item, "description")),
                "publishedAt": child_text(item, "pubDate"),
                "feed": "Google News RSS",
            })
            if len(entries) >= 12:
                break
        if len(entries) >= 8:
            break
    return entries

def bing_news_entries(topic: str) -> list[dict]:
    query = urlencode({"q": topic, "format": "rss", "mkt": "en-US"})
    url = "https://www.bing.com/news/search?" + query
    request = urllib.request.Request(url, headers={"User-Agent": "DIAMOND-TV-Trends/1.3 (+https://diamond-tv.shop/)"})
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            root = ET.fromstring(response.read())
    except Exception as error:
        print(f"Bing News RSS unavailable for {topic}: {type(error).__name__}")
        return []

    entries: list[dict] = []
    for item in root.iter():
        if local_name(item.tag) != "item":
            continue
        title = child_text(item, "title")
        link = child_text(item, "link")
        source_node = next((node for node in item.iter() if local_name(node.tag) == "source"), None)
        source_name = (source_node.text or "").strip() if source_node is not None and source_node.text else ""
        publisher_url = (source_node.attrib.get("url", "") if source_node is not None else "") or child_text(item, "url")
        domain, tier = publisher_details(publisher_url)
        if tier == "unlisted":
            domain, tier = trusted_publisher_from_name(source_name)
        if not title or not link.startswith("https://") or tier == "unlisted":
            continue
        direct_url = child_text(item, "url")
        if direct_url.startswith("https://") and publisher_details(direct_url)[1] != "unlisted":
            link = direct_url
        entries.append({
            "title": title,
            "source": source_name or domain,
            "url": link,
            "domain": domain,
            "publisherTier": tier,
            "description": plain_text(child_text(item, "description")),
            "publishedAt": child_text(item, "pubDate"),
            "feed": "Bing News RSS",
        })
        if len(entries) >= 12:
            break
    return entries


class TrustedPublisherRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        try:
            parts = urlsplit(newurl)
            if parts.scheme != "https" or parts.username or parts.password:
                return None
            _, tier = publisher_details(newurl)
            if tier == "unlisted":
                return None
        except Exception:
            return None
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch_source_metadata(url: str, trusted_only: bool = False) -> dict:
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    result = {"description": "", "pageTitle": "", "reachable": False, "httpStatus": None, "checkedAt": now, "finalUrl": ""}
    try:
        parts = urlsplit(url)
        if parts.scheme != "https" or not parts.hostname or parts.username or parts.password:
            return result
        if trusted_only and publisher_details(url)[1] == "unlisted":
            return result
    except Exception:
        return result
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "DIAMOND-TV-LinkReview/1.0 (+https://diamond-tv.shop/)", "Accept": "text/html"},
    )
    try:
        opener = urllib.request.build_opener(TrustedPublisherRedirectHandler()) if trusted_only else None
        response_context = opener.open(request, timeout=8) if opener else urllib.request.urlopen(request, timeout=8)
        with response_context as response:
            status = int(response.status)
            final_url = response.geturl()
            result["finalUrl"] = final_url
            result["httpStatus"] = status
            result["reachable"] = 200 <= status < 400 and final_url.startswith("https://")
            if trusted_only and publisher_details(final_url)[1] == "unlisted":
                result["reachable"] = False
                return result
            if not result["reachable"] or "text/html" not in response.headers.get("Content-Type", "").lower():
                return result
            raw = response.read(192_000)
            charset = response.headers.get_content_charset() or "utf-8"
        parser = MetaDescriptionParser()
        parser.feed(raw.decode(charset, errors="replace"))
        result["description"] = parser.description
        result["pageTitle"] = parser.title
    except Exception:
        pass
    return result


def inspect_source_link(raw_url: str) -> dict:
    url = str(raw_url or "").strip()
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    result = {
        "inputUrl": url[:2048], "finalUrl": "", "domain": "", "publisherTier": "unlisted",
        "pageTitle": "", "description": "", "reachable": False, "httpStatus": None,
        "checkedAt": now, "reason": "",
    }
    try:
        parts = urlsplit(url)
        if len(url) > 2048 or parts.scheme != "https" or not parts.hostname or parts.username or parts.password:
            result["reason"] = "يجب أن يكون الرابط HTTPS صالحًا ومن دون بيانات دخول."
            return result
        domain, tier = publisher_details(url)
        result["domain"] = domain
        result["publisherTier"] = tier
        if tier == "unlisted":
            result["reason"] = "النطاق غير موجود في قائمة الناشرين والجهات المعروفة؛ لم يُفتح الرابط."
            return result
    except Exception:
        result["reason"] = "تعذر قراءة صيغة الرابط."
        return result

    metadata = fetch_source_metadata(url, trusted_only=True)
    result.update({
        "finalUrl": metadata.get("finalUrl", ""),
        "pageTitle": metadata.get("pageTitle", ""),
        "description": metadata.get("description", ""),
        "reachable": bool(metadata.get("reachable")),
        "httpStatus": metadata.get("httpStatus"),
        "checkedAt": metadata.get("checkedAt", now),
    })
    if result["finalUrl"]:
        final_domain, final_tier = publisher_details(result["finalUrl"])
        result["domain"] = final_domain
        result["publisherTier"] = final_tier
    if result["reachable"]:
        result["reason"] = "استجاب الرابط عبر HTTPS، والتحويل النهائي بقي ضمن نطاق ناشر معروف."
    else:
        result["reason"] = "لم تُسترجع صفحة HTTPS قابلة للقراءة. راجع الرابط يدويًا أو استخدم رابطًا أصليًا آخر."
    return result


def check_source_links(urls: list[str]) -> list[dict]:
    normalized = []
    seen = set()
    for value in urls[:12]:
        url = str(value or "").strip()
        if not url or url in seen:
            continue
        seen.add(url)
        normalized.append(url)

    results: list[dict | None] = [None] * len(normalized)
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(inspect_source_link, url): index for index, url in enumerate(normalized)}
        for future in as_completed(futures):
            index = futures[future]
            try:
                results[index] = future.result()
            except Exception:
                results[index] = {"inputUrl": normalized[index], "finalUrl": "", "domain": "", "publisherTier": "unlisted",
                                  "pageTitle": "", "description": "", "reachable": False, "httpStatus": None,
                                  "checkedAt": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
                                  "reason": "تعذر فحص الرابط بسبب استجابة الشبكة."}
    return [item for item in results if item is not None]


def write_link_check(request_id: str, links_json: str) -> None:
    if not re.fullmatch(r"[a-z0-9-]{12,80}", request_id or ""):
        raise ValueError("Invalid request identifier")
    try:
        links = json.loads(links_json or "[]")
    except json.JSONDecodeError as error:
        raise ValueError("Invalid link list") from error
    if not isinstance(links, list):
        raise ValueError("Link list must be an array")
    results = check_source_links(links)
    updated_at = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    payload = {
        "requestId": request_id, "mode": "link-check", "updatedAt": updated_at,
        "sourceCount": len(results), "accessibleCount": sum(bool(item.get("reachable")) for item in results),
        "links": results,
    }
    output_dir = ROOT / ".github" / "article-research"
    output_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / (request_id + ".json")
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=output_dir, delete=False) as temp:
        json.dump(payload, temp, ensure_ascii=False, indent=2)
        temp.write("\n")
        temp_path = Path(temp.name)
    temp_path.replace(output)
    print(f"Link review complete: {payload['accessibleCount']} of {payload['sourceCount']} links are reachable")


def classify(title: str, news: list[dict]) -> str | None:
    evidence = " ".join([title] + [str(item.get("title", "")) for item in news])
    if SPORTS.search(evidence):
        return "sports"
    if ENTERTAINMENT.search(evidence):
        return "entertainment"
    return None


def collect_topic_research(topic: str) -> list[dict]:
    stories = google_news_entries(topic) + bing_news_entries(topic)
    stories = relevant_news(topic, stories)
    unique_by_url: dict[str, dict] = {}
    for story in stories:
        url = str(story.get("url", ""))
        if url.startswith("https://"):
            unique_by_url.setdefault(url, story)
    stories = list(unique_by_url.values())

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {
            pool.submit(fetch_source_metadata, story["url"]): story
            for story in stories
            if story.get("publisherTier") != "unlisted"
        }
        for future in as_completed(futures):
            story = futures[future]
            try:
                metadata = future.result()
                final_url = metadata.pop("finalUrl", "")
                if final_url.startswith("https://"):
                    final_domain, final_tier = publisher_details(final_url)
                    if final_tier != "unlisted":
                        story["url"] = final_url
                        story["domain"] = final_domain
                        story["publisherTier"] = final_tier
                if metadata.get("description"):
                    story["description"] = metadata["description"]
                story.update({key: value for key, value in metadata.items() if key != "description"})
            except Exception:
                story.update({"reachable": False, "httpStatus": None})

    stories.sort(key=lambda story: (
        story.get("publisherTier") == "unlisted",
        story.get("publisherTier") != "official",
        not story.get("reachable", False),
        not bool(story.get("description")),
    ))
    selected: list[dict] = []
    seen_domains: set[str] = set()
    seen_urls: set[str] = set()
    for story in stories:
        if story.get("publisherTier") == "unlisted":
            continue
        domain = story.get("domain") or publisher_details(story.get("url", ""))[0]
        if not domain or domain in seen_domains or story["url"] in seen_urls:
            continue
        seen_domains.add(domain)
        seen_urls.add(story["url"])
        selected.append(story)
        if len(selected) >= 8:
            break
    return selected


def write_topic_research(topic: str, request_id: str) -> None:
    topic = re.sub(r"\s+", " ", (topic or "")).strip()
    if not topic or len(topic) > 180:
        raise ValueError("Topic must contain 1 to 180 characters")
    if not re.fullmatch(r"[a-z0-9-]{12,80}", request_id or ""):
        raise ValueError("Invalid request identifier")

    sources = collect_topic_research(topic)
    updated_at = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    payload = {
        "requestId": request_id,
        "topic": topic,
        "updatedAt": updated_at,
        "sourceCount": len(sources),
        "publisherCount": len({story.get("domain") for story in sources if story.get("domain")}),
        "summaryCount": sum(bool(str(story.get("description", "")).strip()) for story in sources),
        "sources": sources,
    }
    output_dir = ROOT / ".github" / "article-research"
    output_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / (request_id + ".json")
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=output_dir, delete=False) as temp:
        json.dump(payload, temp, ensure_ascii=False, indent=2)
        temp.write("\n")
        temp_path = Path(temp.name)
    temp_path.replace(output)
    print(f"On-demand research complete: {payload['sourceCount']} sources, {payload['summaryCount']} descriptions")


def main() -> None:
    request = urllib.request.Request(FEED, headers={"User-Agent": "DIAMOND-TV-Trends/1.0 (+https://diamond-tv.shop/)"})
    with urllib.request.urlopen(request, timeout=30) as response:
        root = ET.fromstring(response.read())

    trends: list[dict] = []
    for item in root.iter():
        if local_name(item.tag) != "item":
            continue
        title = child_text(item, "title")
        if not title:
            continue
        news: list[dict] = []
        for node in item.iter():
            if local_name(node.tag) != "news_item":
                continue
            entry = {
                "title": child_text(node, "news_item_title"),
                "source": child_text(node, "news_item_source"),
                "url": child_text(node, "news_item_url"),
            }
            if entry["title"] and entry["url"].startswith("https://"):
                host, tier = publisher_details(entry["url"])
                entry["domain"] = host
                entry["publisherTier"] = tier
                news.append(entry)
            if len(news) >= 10:
                break
        if len(trends) < 15:
            google_entries = google_news_entries(title)
            print(f"Google News RSS for {title}: {len(google_entries)} trusted entries")
            news.extend(google_entries)
            if len(news) < 5:
                bing_entries = bing_news_entries(title)
                print(f"Bing News RSS for {title}: {len(bing_entries)} trusted entries")
                news.extend(bing_entries)
        news = relevant_news(title, news)
        unique: dict[str, dict] = {}
        for story in news:
            if not story.get("url", "").startswith("https://"):
                continue
            unique.setdefault(story["url"], story)
        news = list(unique.values())
        with ThreadPoolExecutor(max_workers=6) as pool:
            futures = {pool.submit(fetch_source_metadata, story["url"]): story for story in news if story.get("publisherTier") != "unlisted"}
            for future in as_completed(futures):
                story = futures[future]
                try:
                    metadata = future.result()
                    final_url = metadata.pop("finalUrl", "")
                    if final_url.startswith("https://"):
                        final_domain, final_tier = publisher_details(final_url)
                        if final_tier != "unlisted":
                            story["url"] = final_url
                            story["domain"] = final_domain
                            story["publisherTier"] = final_tier
                    if metadata.get("description"):
                        story["description"] = metadata["description"]
                    story.update({key: value for key, value in metadata.items() if key != "description"})
                except Exception:
                    story.update({"reachable": False, "httpStatus": None})
        news.sort(key=lambda story: (
            story.get("publisherTier") == "unlisted",
            story.get("publisherTier") != "official",
            not story.get("reachable", False),
            not bool(story.get("description")),
        ))
        diverse: list[dict] = []
        seen_domains: set[str] = set()
        seen_urls: set[str] = set()
        for story in news:
            if story.get("publisherTier") == "unlisted":
                continue
            domain = story.get("domain") or publisher_details(story.get("url", ""))[0]
            if not domain or domain in seen_domains or story["url"] in seen_urls:
                continue
            seen_domains.add(domain)
            seen_urls.add(story["url"])
            diverse.append(story)
            if len(diverse) >= 8:
                break
        news = diverse
        category = classify(title, news)
        if not category:
            continue
        trends.append({
            "title": title,
            "category": category,
            "traffic": child_text(item, "approx_traffic"),
            "publishedAt": child_text(item, "pubDate"),
            "news": news,
        })
        print(f"Research sources for {title}: {len(news)} publishers, {sum(bool(story.get('description')) for story in news)} descriptions")
        if len(trends) >= 30:
            break

    payload = {
        "country": "SA",
        "source": SOURCE,
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "trends": trends,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=OUT.parent, delete=False) as temp:
        json.dump(payload, temp, ensure_ascii=False, indent=2)
        temp.write("\n")
        temp_path = Path(temp.name)
    temp_path.replace(OUT)


if __name__ == "__main__":
    if len(sys.argv) == 4 and sys.argv[1] == "research-topic":
        write_topic_research(sys.argv[2], sys.argv[3])
    elif len(sys.argv) == 3 and sys.argv[1] == "check-links":
        write_link_check(sys.argv[2], __import__("os").environ.get("LINKS_JSON", "[]"))
    else:
        main()

