#!/usr/bin/env python3
"""Refresh a small, niche-filtered Google Trends RSS snapshot for the admin writer."""

from __future__ import annotations

import json
import re
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "google-trends.json"
FEED = "https://trends.google.com/trending/rss?geo=SA&hl=ar"
SOURCE = "https://trends.google.com/trending?geo=SA&hl=ar"

SPORTS = re.compile(
    r"كرة|كوره|دوري|مباراة|مباريات|منتخب|بطولة|الهلال|النصر|الاتحاد|الاهلي|الأهلي|"
    r"برشلونة|ريال مدريد|ليفربول|ارسنال|مانشستر|يوفنتوس|بايرن|باريس سان|"
    r"world cup|football|soccer|league|match|fc |f\.c\.|vs\.?|champions league|"
    r"barcelona|real madrid|liverpool|arsenal|manchester|juventus|bayern|chelsea|"
    r"al hilal|al nassr|al ittihad|al ahly|afcon|afc|uefa|fifa",
    re.IGNORECASE,
)
ENTERTAINMENT = re.compile(
    r"مسلسل|مسلسلات|فيلم|أفلام|افلام|سينما|دراما|ممثل|ممثلة|برنامج|حلقة|رمضان|"
    r"نتفلكس|شاهد|mbc|osn|نتفليكس|series|movie|film|actor|actress|episode|season|"
    r"netflix|shahid|disney|prime video|hbo|tv show|television",
    re.IGNORECASE,
)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def child_text(node: ET.Element, wanted: str) -> str:
    for child in node.iter():
        if local_name(child.tag) == wanted.lower() and child.text:
            return child.text.strip()
    return ""


def classify(title: str, news: list[dict]) -> str | None:
    evidence = " ".join([title] + [str(item.get("title", "")) for item in news])
    if SPORTS.search(evidence):
        return "sports"
    if ENTERTAINMENT.search(evidence):
        return "entertainment"
    return None


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
                news.append(entry)
            if len(news) >= 3:
                break
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
    main()

