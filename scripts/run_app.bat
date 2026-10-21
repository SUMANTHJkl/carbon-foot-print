@echo off
echo ========================================================
echo Launching CoalCarbon India - Climate Analytics Platform
echo ========================================================
set PYTHONPATH=.
echo Starting Unified Server at http://localhost:8000 ...
python -m backend.app.main
pause
