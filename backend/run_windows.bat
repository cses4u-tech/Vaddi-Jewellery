@echo off
echo ===================================================
echo Starting VADDI Jewellery Python Backend on Windows
echo ===================================================

cd /d "%~dp0"
python -m pip install -r ../requirements.txt
python database.py
python seed.py
python app.py
pause
