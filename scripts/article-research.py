#!/usr/bin/env python3
"""Fetch source metadata for the DIAMOND admin article writer.

Only short publisher metadata is saved. Full publisher page text is analyzed in
memory and discarded; every request is bounded and restricted to public HTTPS.
"""
from __future__ import annotations

import html
import ipaddress
import json
import os
import re
import socket
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESULT_DIR = ROOT / ".github" / "article-research"
USER_AGENT = "DIAMOND-TV-Editorial-Research/1.0 (+https://diamond-tv.shop/)"
MAX_BODY = 1_500_000
TIMEOUT = 8
TRUSTED = {
    "reuters.com", "apnews.com", "afp.com", "bbc.com", "bbc.co.uk", "aljazeera.net",
    "aljazeera.com", "dawn.com", "ndtv.com", "ndtvprofit.com", "minutemirror.com.pk",
    "espn.com", "espncricinfo.com", "cricbuzz.com", "skysports.com", "arabnews.com",
    "alarabiya.net", "asharq.com", "aawsat.com", "theguardian.com", "goal.com", "kooora.com",
    "thehindu.com", "indiatoday.in", "indianexpress.com", "hindustantimes.com",
    "timesofindia.indiatimes.com", "variety.com", "hollywoodreporter.com", "deadline.com",
    "indiewire.com", "screenrant.com", "yahoo.com", "yahoo.net", "cnn.com", "npr.org",
    "cbsnews.com", "dw.com", "france24.com", "skynewsarabia.com", "alaraby.co.uk",
    "al-monitor.com", "al-ain.com", "almasryalyoum.com", "ahram.org.eg", "youm7.com",
    "masrawy.com", "elwatannews.com", "alriyadh.com", "okaz.com.sa", "sabq.org",
    "saudigazette.com.sa", "arriyadiyah.com", "nytimes.com", "washingtonpost.com",
    "theathletic.com", "axios.com", "nme.com", "empireonline.com", "independentarabia.com",
    "akhbaar24.com", "al-madina.com", "albilad.com", "alyaum.com", "aleqt.com", "rt.com",
    "fifa.com", "uefa.com", "the-afc.com", "cafonline.com", "icc-cricket.com", "nba.com",
    "nfl.com", "premierleague.com", "saudiproleague.com", "spl.com.sa", "laliga.com",
    "bundesliga.com", "legaseriea.it", "ligue1.com", "conmebol.com", "fiba.basketball",
    "saff.com.sa", "egyptianproleague.com", "spa.gov.sa", "mbc.net", "shahid.mbc.net",
    "netflix.com", "primevideo.com", "disneyplus.com", "osn.com", "osnplus.com",
    "starzplay.com", "jawwy.tv",
}
STOP = set("""
الذي التي هذا هذه ذلك تلك على عن إلى الي في من ما ماذا كيف متى أين هل مع بعد قبل
كانت كان يكون تم قد سوف بين لدى لدى عبر ضمن أكثر اقل اليوم أمس غدا الآن إلى هنا هناك
the and for with from that this have has are was were your about news latest says said
""".split())
DIMENSIONS = [
    ("الموعد أو الجدول", r"موعد|توقيت|جدول|schedule|when|kick.?off|fixture"),
    ("النتيجة أو الأداء", r"نتيجة|فاز|خسر|score|result|innings|\\b\\d{1,3}\\s*[-–/:]\\s*\\d{1,3}\\b"),
    ("البث والمتابعة", r"بث|قناة|شاهد|stream|watch|broadcast|live"),
    ("المنصة أو الإتاحة", r"منصة|نتفليكس|شاهد|netflix|prime video|streaming|watch"),
    ("الأسماء أو فريق العمل", r"ممثل|بطولة|أبطال|cast|actor|actress|starring|director"),
    ("الجهة المنظمة أو الرسمية", r"fifa|uefa|the-afc|cafonline|icc-cricket|nba\\.com|premierleague|رسمي|وزارة|هيئة"),
]
ARABIC_WORDS = re.compile(r"[a-z0-9\\u0600-\\u06ff]{3,}", re.I)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def safe_public_https(raw_url: str) -> str:
    parsed = urllib.parse.urlsplit(str(raw_url or "").strip())
    if parsed.scheme.lower() != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("الرابط يجب أن يستخدم HTTPS عامًا.")
    if parsed.port not in (None, 443):
        raise ValueError("المنافذ غير القياسية غير مسموحة.")
    host = parsed.hostname.rstrip(".").lower()
    if host in {"localhost", "localhost.localdomain"} or host.endswith(".local"):
        raise ValueError("العنوان المحلي غير مسموح.")
    try:
        literal = ipaddress.ip_address(host)
        addresses = [literal]
    except ValueError:
        try:
            records = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
            addresses = [ipaddress.ip_address(row[4][0].split("%", 1)[0]) for row in records]
        except Exception as exc:
            raise ValueError("تعذر التحقق من عنوان الناشر.") from exc
    if not addresses or any(not address.is_global for address in addresses):
        raise ValueError("عنوان الشبكة غير عام.")
    return urllib.parse.urlunsplit(parsed)


class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        safe_public_https(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


OPENER = urllib.request.build_opener(SafeRedirect())


def fetch(raw_url: str, accept: str = "text/html,application/rss+xml,application/atom+xml,application/xml;q=0.9,*/*;q=0.5"):
    url = safe_public_https(raw_url)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": accept})
    with OPENER.open(req, timeout=TIMEOUT) as response:
        content_type = response.headers.get("Content-Type", "")
        data = response.read(MAX_BODY + 1)
        if len(data) > MAX_BODY:
            data = data[:MAX_BODY]
        charset = response.headers.get_content_charset() or "utf-8"
        final_url = safe_public_https(response.geturl())
        return data.decode(charset, errors="replace"), response.status, content_type, final_url


class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def plain_html(value: str) -> str:
    parser = TextOnly()
    try:
        parser.feed(value or "")
    except Exception:
        pass
    return re.sub(r"\\s+", " ", html.unescape(" ".join(parser.parts))).strip()


class PageParser(HTMLParser):
    BLOCK = {"script", "style", "noscript", "svg", "nav", "footer", "header", "aside", "form"}
    CAPTURE = {"p", "h1", "h2", "h3", "li"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.description = ""
        self.in_title = False
        self.blocked = 0
        self.current_tag = ""
        self.current = []
        self.blocks = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        values = {key.lower(): (value or "") for key, value in attrs}
        if tag == "meta" and not self.description:
            key = (values.get("property") or values.get("name") or "").lower()
            if key in {"description", "og:description", "twitter:description"}:
                self.description = re.sub(r"\\s+", " ", values.get("content", "")).strip()[:700]
        if tag in self.BLOCK:
            self.blocked += 1
        if tag == "title":
            self.in_title = True
        if not self.blocked and tag in self.CAPTURE:
            self._flush()
            self.current_tag = tag
            self.current = []

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in self.CAPTURE and self.current_tag == tag:
            self._flush()
        if tag == "title":
            self.in_title = False
        if tag in self.BLOCK:
            self.blocked = max(0, self.blocked - 1)

    def handle_data(self, data):
        if self.in_title:
            self.title += " " + data
        if not self.blocked and self.current_tag:
            self.current.append(data)

    def _flush(self):
        value = re.sub(r"\\s+", " ", " ".join(self.current)).strip()
        if len(value) >= 35:
            self.blocks.append(value[:1000])
        self.current_tag = ""
        self.current = []


def article_metadata(url: str):
    result = {"url": url, "finalUrl": url, "reachable": False, "httpStatus": 0,
              "title": "", "description": "", "articleRead": False, "articleWordCount": 0,
              "analysisTerms": [], "coverageDimensions": [], "articleTextMethod": ""}
    try:
        raw, status, content_type, final_url = fetch(url)
        result.update({"finalUrl": final_url, "reachable": 200 <= status < 400, "httpStatus": status})
        if "html" not in content_type.lower():
            result["reason"] = "استجاب الرابط لكنه لا يعرض صفحة HTML."
            return result
        parser = PageParser()
        parser.feed(raw)
        result["title"] = re.sub(r"\\s+", " ", parser.title).strip()[:240]
        result["description"] = parser.description[:700]
        body = " ".join(parser.blocks)
        words = ARABIC_WORDS.findall(body)
        result["articleWordCount"] = len(words)
        result["articleRead"] = len(words) >= 120
        result["articleTextMethod"] = "استخراج محلي للعناوين والفقرات؛ لم يُحفظ النص الكامل"
        counts = {}
        for word in words:
            normalized = word.lower()
            if len(normalized) >= 4 and normalized not in STOP:
                counts[normalized] = counts.get(normalized, 0) + 1
        result["analysisTerms"] = [word for word, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:8]]
        evidence = (result["title"] + " " + result["description"] + " " + body[:12000]).lower()
        result["coverageDimensions"] = [label for label, pattern in DIMENSIONS if re.search(pattern, evidence, re.I)]
        if not result["description"] and parser.blocks:
            # Keep only page metadata in the result, never the body text.
            result["description"] = re.sub(r"\\s+", " ", parser.blocks[0]).strip()[:260]
        if not result["title"]:
            result["title"] = urllib.parse.urlsplit(final_url).hostname or ""
        return result
    except Exception as exc:
        result["reason"] = str(exc)[:220]
        return result


def domain_of(url: str) -> str:
    host = (urllib.parse.urlsplit(url).hostname or "").lower()
    return host[4:] if host.startswith("www.") else host


def is_trusted(domain: str) -> bool:
    return any(domain == item or domain.endswith("." + item) for item in TRUSTED)


def child_text(node: ET.Element, wanted: str) -> str:
    for child in node.iter():
        if local_name(child.tag) == wanted:
            if child.text and child.text.strip():
                return child.text.strip()
            href = child.attrib.get("href", "")
            if href:
                return href
    return ""


def parse_feed(raw: str, feed_name: str) -> list[dict]:
    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        return []
    rows = []
    for node in root.iter():
        if local_name(node.tag) not in {"item", "entry"}:
            continue
        title = plain_html(child_text(node, "title"))
        link = child_text(node, "link")
        if not link:
            for item in node.iter():
                if local_name(item.tag) == "link" and item.attrib.get("href"):
                    link = item.attrib["href"]
                    break
        source = ""
        for item in node.iter():
            if local_name(item.tag) == "source":
                source = plain_html(item.text or item.attrib.get("url", ""))
                break
        description = ""
        for name in ("description", "summary", "content"):
            description = child_text(node, name)
            if description:
                description = plain_html(description)[:700]
                break
        published = child_text(node, "pubdate") or child_text(node, "published") or child_text(node, "updated")
        if title and link.startswith("https://"):
            rows.append({"title": title[:300], "url": link, "source": source or feed_name,
                         "description": description, "publishedAt": published[:100]})
    return rows


def normalized(value: str) -> str:
    value = value.lower().translate(str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ى": "ي", "ة": "ه"}))
    return re.sub(r"[^a-z0-9\\u0600-\\u06ff]+", " ", value).strip()


def topic_terms(topic: str) -> list[str]:
    return [term for term in normalized(topic).split() if len(term) > 2 and term not in STOP]


def relevant(topic: str, title: str, description: str) -> bool:
    terms = topic_terms(topic)
    if not terms:
        return True
    haystack = normalized(title + " " + description)
    return sum(1 for term in terms if term in haystack) >= min(1, len(terms))


def gather(topic: str) -> list[dict]:
    query = urllib.parse.quote(topic)
    feeds = [
        ("Google News", "https://news.google.com/rss/search?q=" + query + "&hl=ar&gl=SA&ceid=SA:ar"),
        ("Bing News", "https://www.bing.com/news/search?q=" + query + "&format=RSS&setlang=ar-sa"),
    ]
    candidates = []
    feed_errors = []
    for name, url in feeds:
        try:
            raw, _, _, _ = fetch(url, "application/rss+xml,application/atom+xml,application/xml,text/xml")
            candidates.extend(parse_feed(raw, name))
        except Exception as exc:
            feed_errors.append(name + ": " + str(exc)[:140])
    ranked = []
    seen_urls = set()
    for row in candidates:
        if not relevant(topic, row["title"], row["description"]):
            continue
        try:
            row["url"] = safe_public_https(row["url"])
        except Exception:
            continue
        key = row["url"].split("#", 1)[0]
        if key not in seen_urls:
            seen_urls.add(key)
            ranked.append(row)
    result = []
    publishers = set()
    for row in ranked:
        page = article_metadata(row["url"])
        final_url = page.get("finalUrl") or row["url"]
        domain = domain_of(final_url)
        if domain in {"news.google.com", "bing.com", "www.bing.com"}:
            domain = domain_of(row["url"])
        publisher = domain
        if not domain or publisher in publishers:
            continue
        publishers.add(publisher)
        summary = page.get("description") or row["description"]
        result.append({
            "title": page.get("title") or row["title"],
            "source": row["source"] or domain,
            "url": final_url,
            "finalUrl": final_url,
            "domain": domain,
            "description": summary[:700],
            "publishedAt": row["publishedAt"],
            "reachable": page.get("reachable", False),
            "httpStatus": page.get("httpStatus", 0),
            "articleRead": page.get("articleRead", False),
            "articleWordCount": page.get("articleWordCount", 0),
            "analysisTerms": page.get("analysisTerms", []),
            "coverageDimensions": page.get("coverageDimensions", []),
            "articleTextMethod": page.get("articleTextMethod", ""),
            "publisherTier": "trusted" if is_trusted(domain) else "unlisted",
            "reason": page.get("reason", ""),
        })
        if len(result) >= 12:
            break
    return result, feed_errors


def link_check(payload: dict) -> list[dict]:
    rows = []
    for raw_url in payload.get("urls", [])[:12]:
        url = str(raw_url or "").strip()
        page = article_metadata(url)
        final_url = page.get("finalUrl") or url
        domain = domain_of(final_url)
        rows.append({
            "inputUrl": url, "finalUrl": final_url, "domain": domain,
            "pageTitle": page.get("title", ""), "description": page.get("description", ""),
            "reachable": page.get("reachable", False), "httpStatus": page.get("httpStatus", 0),
            "checkedAt": now_iso(), "publisherTier": "trusted" if is_trusted(domain) else "unlisted",
            "articleRead": page.get("articleRead", False), "articleWordCount": page.get("articleWordCount", 0),
            "analysisTerms": page.get("analysisTerms", []), "coverageDimensions": page.get("coverageDimensions", []),
            "articleTextMethod": page.get("articleTextMethod", ""), "reason": page.get("reason", ""),
        })
    return rows


def main():
    event_file = Path(os.environ.get("GITHUB_EVENT_PATH", ""))
    if not event_file.is_file():
        raise SystemExit("لم يصل ملف طلب البحث.")
    event = json.loads(event_file.read_text(encoding="utf-8"))
    payload = event.get("client_payload") or {}
    request_id = str(payload.get("request_id", ""))
    if not re.fullmatch(r"[a-zA-Z0-9-]{1,90}", request_id):
        raise SystemExit("معرّف الطلب غير صالح.")
    mode = str(event.get("action", ""))
    topic = re.sub(r"\\s+", " ", str(payload.get("topic", ""))).strip()[:180]
    if mode == "article-research":
        if len(topic) < 2:
            raise SystemExit("اكتب موضوعًا واضحًا للبحث.")
        sources, errors = gather(topic)
        result = {"requestId": request_id, "mode": "article-research", "topic": topic,
                  "updatedAt": now_iso(), "sources": sources, "feedErrors": errors,
                  "sourceCount": len(sources)}
    elif mode == "article-link-check":
        result = {"requestId": request_id, "mode": "link-check",
                  "topic": topic, "updatedAt": now_iso(), "links": link_check(payload)}
    else:
        raise SystemExit("نوع طلب غير مدعوم.")
    RESULT_DIR.mkdir(parents=True, exist_ok=True)
    output = RESULT_DIR / (request_id + ".json")
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\\n", encoding="utf-8")
    print("Saved", output.relative_to(ROOT), "sources=", len(result.get("sources", result.get("links", []))))


if __name__ == "__main__":
    main()
