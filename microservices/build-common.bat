@echo off
REM Build common package script for Windows

echo Building @project-pc/common package...

cd packages\common

echo Installing dependencies...
call npm install

echo Building package...
call npm run build

if %ERRORLEVEL% EQU 0 (
  echo Build successful!
  echo.
  echo Output: packages\common\dist\
  dir dist /b
) else (
  echo Build failed!
  exit /b 1
)
