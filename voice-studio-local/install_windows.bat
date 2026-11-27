@echo off
chcp 65001 >nul
echo ===== تثبيت DIAMOND Voice Studio =====
where py >nul 2>nul || (echo ثبّت Python 3.11 من python.org ثم أعد التشغيل & pause & exit /b 1)
py -3.11 -m venv venv || (echo يلزم Python 3.11 & pause & exit /b 1)
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
echo -- إن كان لديك كرت NVIDIA ثبّت PyTorch مع CUDA أولًا (انظر README) --
pip install -r requirements.txt
echo تم التثبيت. شغّل run_windows.bat
pause
