@echo off
echo =========================================
echo Starting DailyTrack - AI Routine Tracker
echo =========================================
echo.

cd /d "%~dp0"

REM Check if .venv exists, if not create and install dependencies
if not exist ".venv\Scripts\activate.bat" (
    echo [1/4] Creating Python virtual environment...
    python -m venv .venv
    
    echo [1/4] Installing backend dependencies...
    call .venv\Scripts\activate.bat
    pip install -r backend/requirements.txt
) else (
    echo [1/4] Virtual environment found.
)

echo [2/4] Starting FastAPI backend on port 8000...
start "DailyTrack Backend" cmd /k "call .venv\Scripts\activate.bat && uvicorn backend.main:app --reload --port 8000"

echo [3/4] Starting Frontend server on port 5500...
start "DailyTrack Frontend" cmd /k "cd frontend && python -m http.server 5500"

echo [4/4] Starting Ollama server (Local LLM)...
start "Ollama Server" cmd /c "echo If Ollama is already running, this window might show an address error, which is normal. && ollama serve"

echo.
echo Waiting a brief moment for servers to start...
timeout /t 3 >nul

echo Opening DailyTrack in your default browser...
start http://localhost:5500

echo.
echo =========================================
echo All services have been launched!
echo * Backend runs on http://localhost:8000
echo * Frontend runs on http://localhost:5500
echo * Local LLM runs on Ollama default port
echo =========================================
echo Please keep the newly opened command windows running to use the app.
echo You can close this startup window.
echo.
pause
