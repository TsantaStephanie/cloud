@echo off
echo ===================================
echo     GRADLE CORRUPTION FIX
echo ===================================
echo.

echo 1. Killing Java processes...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM javaw.exe 2>nul
taskkill /F /IM gradle.exe 2>nul

echo 2. Cleaning caches...
rmdir /s /q "%USERPROFILE%\.gradle\caches" 2>nul
rmdir /s /q "%USERPROFILE%\.gradle\wrapper" 2>nul
rmdir /s /q "%USERPROFILE%\.gradle\daemon" 2>nul

echo 3. Fixing Gradle version...
echo distributionUrl=https\://services.gradle.org/distributions/gradle-8.0-bin.zip > gradle\wrapper\gradle-wrapper.properties
echo distributionBase=GRADLE_USER_HOME >> gradle\wrapper\gradle-wrapper.properties
echo distributionPath=wrapper/dists >> gradle\wrapper\gradle-wrapper.properties
echo zipStoreBase=GRADLE_USER_HOME >> gradle\wrapper\gradle-wrapper.properties
echo zipStorePath=wrapper/dists >> gradle\wrapper\gradle-wrapper.properties

echo 4. Updating build.gradle...
powershell -Command "(Get-Content build.gradle) -replace 'gradle:.*', 'gradle:8.2.0\"' -replace 'kotlin_version.*', 'kotlin_version = ''1.9.20''' | Set-Content build.gradle"

echo 5. Cleaning project...
rmdir /s /q .gradle 2>nul
rmdir /s /q build 2>nul
rmdir /s /q app\build 2>nul

echo.
echo ===================================
echo PLEASE:
echo 1. CLOSE Android Studio completely
echo 2. Reopen it
echo 3. Click "Sync Project with Gradle Files"
echo ===================================
pause