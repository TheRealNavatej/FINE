@echo off
echo ========================================
echo FINE - Finance Intelligent Ecosystem
echo Quick Setup Script
echo ========================================
echo.

echo [1/4] Checking MongoDB...
net start MongoDB >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ MongoDB is running
) else (
    echo ⚠ MongoDB might not be running. Please start it manually.
    echo   Run: net start MongoDB
)
echo.

echo [2/4] Checking Ollama...
where ollama >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Ollama is installed
    echo   Checking for llama2 model...
    ollama list | findstr llama2 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✓ llama2 model is available
    ) else (
        echo ⚠ llama2 model not found. Installing...
        ollama pull llama2
    )
) else (
    echo ⚠ Ollama not found. AI features will not work.
    echo   Install from: https://ollama.ai/download
)
echo.

echo [3/4] Setting up Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing Python dependencies...
pip install -r requirements.txt --quiet
echo ✓ Backend setup complete
cd ..
echo.

echo [4/4] Setting up Frontend...
cd frontend
if not exist node_modules (
    echo Installing Node dependencies (this may take a while)...
    call npm install --silent
    echo ✓ Frontend setup complete
) else (
    echo ✓ Frontend dependencies already installed
)
cd ..
echo.

echo ========================================
echo ✨ Setup Complete!
echo ========================================
echo.
echo To run the application:
echo.
echo 1. Start Backend:
echo    cd backend
echo    venv\Scripts\activate
echo    uvicorn server:app --reload --host 0.0.0.0 --port 8000
echo.
echo 2. Start Frontend (in a new terminal):
echo    cd frontend
echo    npm start
echo.
echo Then open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see SETUP_GUIDE.md
echo ========================================
pause
