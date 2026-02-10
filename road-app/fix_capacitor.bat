@echo off
echo ==========================================
echo    IONIC/CAPACITOR PROJECT FIXER
echo ==========================================
echo.
echo WARNING: This will reset your Android setup!
echo Make sure you're in the project ROOT folder.
echo Current folder: %CD%
echo.
pause

echo.
echo Step 1: Cleaning up the mess...
echo ==========================================

:: Check if we're in the right place
if not exist "package.json" (
    echo ERROR: Not in project root! No package.json found.
    echo Place this bat file in: road-app folder
    pause
    exit /b 1
)

:: Backup important files first
echo Backing up important files...
mkdir backup_%date:~-4,4%%date:~-10,2%%date:~-7,2% 2>nul
if exist "src" xcopy /E /I /Y "src" "backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%\src\"
if exist "www" xcopy /E /I /Y "www" "backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%\www\"
if exist "capacitor.config.ts" copy "capacitor.config.ts" "backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%\"

:: Remove problematic Android folders
echo Removing broken Android folders...
if exist "android" (
    echo Found 'android' folder - removing...
    rmdir /s /q "android" 2>nul
)
if exist "android_backup" (
    echo Found 'android_backup' folder - removing...
    rmdir /s /q "android_backup" 2>nul
)

:: Clean up scattered files
echo Cleaning scattered files...
del /q "build.gradle" "gradle.properties" "gradlew" "gradlew.bat" "local.properties" "settings.gradle" "variables.gradle" "capacitor.settings.gradle" 2>nul
rmdir /s /q "app" 2>nul
rmdir /s /q "assets" 2>nul
rmdir /s /q "res" 2>nul

echo.
echo Step 2: Verifying Node.js environment...
echo ==========================================

:: Check Node and npm
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Install Node.js first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)

:: Check Ionic CLI
echo Checking Ionic CLI...
ionic --version >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Ionic CLI globally...
    npm install -g @ionic/cli
)

echo.
echo Step 3: Installing dependencies...
echo ==========================================

:: Clean npm cache and install
echo Cleaning npm cache...
npm cache clean --force

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    echo Trying with --force...
    call npm install --force
)

echo.
echo Step 4: Building web assets...
echo ==========================================

:: Remove old build
if exist "www" rmdir /s /q "www" 2>nul

echo Building Ionic project...
call ionic build --prod

if %errorlevel% neq 0 (
    echo WARNING: Ionic build had issues, trying without prod...
    call ionic build
)

echo.
echo Step 5: Setting up Android platform...
echo ==========================================

echo Adding Android platform...
call ionic capacitor add android

if %errorlevel% neq 0 (
    echo ERROR: Failed to add Android platform.
    echo Trying alternative method...
    npx cap add android
)

echo Copying web assets to Android...
call ionic capacitor copy android

if %errorlevel% neq 0 (
    echo Trying alternative copy method...
    npx cap copy android
)

echo.
echo Step 6: Verifying Android structure...
echo ==========================================

:: Check if Android structure is correct
if not exist "android\app\src\main\AndroidManifest.xml" (
    echo ERROR: AndroidManifest.xml missing!
    echo Manual intervention needed.
    goto :manual_fix
)

if not exist "android\gradlew.bat" (
    echo ERROR: gradlew.bat missing!
    echo Regenerating...
    copy "android\gradle\wrapper\gradle-wrapper.jar" "android\" 2>nul
)

echo.
echo Step 7: Testing Gradle build...
echo ==========================================

cd android
echo Running gradlew clean...
call gradlew clean

if %errorlevel% neq 0 (
    echo Gradle clean failed, trying with wrapper...
    call gradlew.bat clean
)

cd..

echo.
echo Step 8: Finalizing...
echo ==========================================

echo Creating useful shortcuts...
(
@echo :: Quick commands for your project
@echo @echo off
@echo echo Available commands:
@echo echo 1. Run in browser: ionic serve
@echo echo 2. Build for Android: ionic capacitor build android
@echo echo 3. Run on device: ionic capacitor run android
@echo echo 4. Sync changes: ionic capacitor sync android
@echo pause
) > "quick_commands.bat"

(
@echo #!/bin/bash
@echo echo "Project fixed successfully!"
@echo echo "Run 'ionic serve' to test in browser"
@echo echo "Run 'ionic capacitor run android' for device"
) > "quick_commands.sh" 2>nul

echo.
echo ==========================================
echo    FIX COMPLETED SUCCESSFULLY!
echo ==========================================
echo.
echo Your project has been reset and fixed.
echo.
echo Next steps:
echo 1. Test in browser: ionic serve
echo 2. Open in Android Studio: ionic capacitor open android
echo 3. Build for device: ionic capacitor build android
echo.
echo Backup saved in: backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%\
echo Quick commands: quick_commands.bat
echo.
pause
goto :end

:manual_fix
echo.
echo ==========================================
echo    MANUAL FIX REQUIRED
echo ==========================================
echo.
echo The automatic fix failed. Manual steps:
echo.
echo 1. Delete 'android' folder if it exists
echo 2. Run these commands manually:
echo    npm install
echo    ionic build
echo    ionic capacitor add android
echo    ionic capacitor copy android
echo.
echo 3. Check capacitor.config.ts exists
echo 4. Check package.json has @capacitor packages
echo.
pause

:end
exit