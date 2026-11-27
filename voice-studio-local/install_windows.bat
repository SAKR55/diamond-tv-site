@echo off
title DIAMOND Voice Studio - Install
cd /d "%~dp0"
echo ===== DIAMOND Voice Studio: install =====
set PYCMD=
py -3.11 --version >nul 2>nul
if %errorlevel%==0 set PYCMD=py -3.11
if "%PYCMD%"=="" (
  python --version 2>nul | findstr /b /c:"Python 3.11" >nul
  if not errorlevel 1 set PYCMD=python
)
if "%PYCMD%"=="" goto nopy
echo Using: %PYCMD%
%PYCMD% -m venv venv
if errorlevel 1 goto fail
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 goto fail
echo.
echo DONE. Now run run_windows.bat
pause
exit /b 0
:nopy
echo Python 3.11 was not found.
echo Install Python 3.11 from https://www.python.org/downloads/windows/
echo and tick "Add python.exe to PATH", then run this file again.
pause
exit /b 1
:fail
echo.
echo INSTALL FAILED. Send a screenshot of the red ERROR lines above.
pause
exit /b 1
