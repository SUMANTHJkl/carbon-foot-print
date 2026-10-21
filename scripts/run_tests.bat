@echo off
echo ========================================================
echo Running CoalCarbon India Test Suites
echo ========================================================
set PYTHONPATH=.
echo Running Pytest backend suite...
python -m pytest backend/tests/
pause
