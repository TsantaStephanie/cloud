@echo off
echo Fixing Ionic/Android project...

:: 1. Delete problematic folders
if exist "android" rmdir /s /q android
if exist "android_backup" rmdir /s /q android_backup

:: 2. Remove scattered files
del /q build.gradle gradle.properties gradlew gradlew.bat 2>nul
del /q local.properties settings.gradle variables.gradle 2>nul
del /q capacitor.settings.gradle 2>nul

:: 3. Clean and rebuild
call npm install
call ionic build
call ionic capacitor add android
call ionic capacitor copy android

echo Done! Run: ionic capacitor open android
pause