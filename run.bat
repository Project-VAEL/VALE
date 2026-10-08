@echo off
REM -- VALE: Awakening -- Run Script

REM 1. Generate audio assets if not already present
if not exist "assets\vael_1.mp3" (
    echo Generating audio assets...
    python generate_audio.py
    if errorlevel 1 (
        echo ERROR: Audio generation failed. Make sure Python and edge-tts are installed.
        pause
        exit /b 1
    )
) else (
    echo Audio assets already present, skipping generation.
)

REM 2. Start local HTTP server in background on port 8080
echo Starting local server at http://localhost:8080 ...
start /b python -m http.server 8080

REM 3. Brief delay to let server start
timeout /t 2 /nobreak >nul

REM 4. Open in default browser
echo Opening VALE: Awakening...
start http://localhost:8080/index.html

echo.
echo Server is running. Close this window to stop it.
pause
