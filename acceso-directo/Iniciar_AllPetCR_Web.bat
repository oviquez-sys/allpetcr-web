@echo off
title AllPetCR Web - Servidor de desarrollo
cd /d "C:\Users\oviqu\OneDrive\Desktop\GRUPO VAYRU\AllPet\CLAUDE\allpetcr-web"

echo ============================================================
echo   ALLPETCR WEB - servidor de desarrollo
echo ============================================================
echo.

echo Verificando que Node este instalado...
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo   [FALTA NODE]
    echo.
    echo   Node.js no esta instalado, y sin el este sitio no puede
    echo   levantarse.
    echo.
    echo   Para instalarlo, abri una terminal y corre:
    echo       winget install OpenJS.NodeJS.LTS
    echo.
    echo   O bajalo de nodejs.org ^(version LTS^).
    echo.
    echo   IMPORTANTE: despues de instalarlo, cerra TODAS las
    echo   terminales y volve a intentar con este acceso directo.
    echo   Las ventanas ya abiertas no ven el Node recien instalado.
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node --version') do set NODEVER=%%v
echo   OK: Node %NODEVER%
echo.

if not exist "node_modules\" (
    echo Primera vez: instalando dependencias.
    echo Esto tarda unos minutos, solo pasa la primera vez.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo   ERROR al instalar las dependencias.
        echo   Copia el mensaje de arriba y pasaselo a Claude.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo   Dependencias instaladas.
    echo.
)

echo Abriendo el navegador en unos segundos...
start "" cmd /c "timeout /t 12 >nul && start http://localhost:3000"

echo.
echo ============================================================
echo   Iniciando servidor. Espera a ver la linea "Ready".
echo.
echo   DEJA ESTA VENTANA ABIERTA mientras uses el sitio.
echo   Si la cerras, el sitio deja de funcionar.
echo.
echo   Para detenerlo: Ctrl+C, o cerra esta ventana.
echo ============================================================
echo.

call npm run dev

echo.
echo El servidor se detuvo.
pause
