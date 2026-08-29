@echo off
pushd "%~dp0"
echo Iniciando el sitio web AllPetCR...
echo El navegador se abre solo en unos segundos.
echo NO cierres esta ventana mientras uses el sitio.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep 5; Start-Process http://localhost:3000"
npm run dev
popd
pause
