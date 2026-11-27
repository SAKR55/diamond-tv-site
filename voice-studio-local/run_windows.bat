@echo off
title DIAMOND Voice Studio
cd /d "%~dp0"
if not exist venv\Scripts\activate.bat (
  echo Not installed yet. Run install_windows.bat first.
  pause
  exit /b 1
)
call venv\Scripts\activate.bat
python app.py
echo.
echo The app stopped. If there is an error above, send a screenshot.
pause
