@echo off
title FINE Backend Server
cd backend
call venv\Scripts\activate
echo Starting FINE Backend Server...
echo API: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo.
uvicorn server:app --reload --host 0.0.0.0 --port 8000
