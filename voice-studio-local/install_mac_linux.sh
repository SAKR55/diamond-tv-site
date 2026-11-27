#!/bin/sh
set -e
python3.11 -m venv venv || { echo "يلزم Python 3.11"; exit 1; }
. venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
echo "تم التثبيت. شغّل: sh run_mac_linux.sh"
