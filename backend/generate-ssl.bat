@echo off
REM Generate self-signed SSL certificate for HTTPS local development
REM Use this script to create server.key and server.crt for HTTPS
REM Requires: OpenSSL (comes with Git for Windows, WSL, or standalone installation)

echo Generating SSL certificates...
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -days 365 -nodes -subj "/CN=localhost/O=KANS/C=ID"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SSL certificates generated successfully:
    echo    - server.key
    echo    - server.crt
    echo.
    echo These files are valid for 365 days.
    echo WARNING: Browser will show security warning (self-signed cert) - this is normal for development
    echo.
    echo To enable HTTPS:
    echo    1. Set: USE_HTTPS=true [in .env or as environment variable]
    echo    2. Run: npm start
    echo    3. Access: https://localhost:3000
) else (
    echo.
    echo ERROR: OpenSSL not found. Please install OpenSSL:
    echo    - Windows: Git for Windows includes OpenSSL
    echo    - WSL: sudo apt install openssl
    echo    - Standalone: https://slproweb.com/products/Win32OpenSSL.html
)

pause
