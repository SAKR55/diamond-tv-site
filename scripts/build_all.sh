#!/bin/sh
# يعيد بناء كل الموقع بالترتيب الصحيح ثم تمريرات SEO. تشغيل: sh scripts/build_all.sh
cd "$(dirname "$0")/.." || exit 1
for b in home studio business library accounting claude_academy cv ecommerce extras map account wa quiz tools_hub; do
  python3 scripts/build_$b.py >/dev/null 2>&1 || echo "FAILED: build_$b"
done
python3 scripts/update_sitemap.py
python3 scripts/seo_boost.py >/dev/null
python3 scripts/seo_pass.py
