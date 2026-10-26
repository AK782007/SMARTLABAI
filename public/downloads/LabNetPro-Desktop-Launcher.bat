@echo off
:: =========================================================================
:: LabNet Pro - Windows Desktop Application Launcher
:: Metro State University - College Computer Lab Management System
:: =========================================================================
title LabNet Pro Smart Lab Console
echo =========================================================================
echo   Launching LabNet Pro Smart Computer Lab Management Console...
echo =========================================================================

set APP_URL=https://ais-dev-fq7zjtonca6s6nmcilhif6-781608242872.asia-northeast1.run.app

:: Check if Microsoft Edge is installed
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%"
    goto :Done
)

:: Check if Google Chrome is installed
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%APP_URL%"
    goto :Done
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%APP_URL%"
    goto :Done
)

:: Fallback to default browser
start "" "%APP_URL%"

:Done
exit
