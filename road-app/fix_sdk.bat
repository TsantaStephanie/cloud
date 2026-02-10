@echo off
echo ==========================================
echo FIXING MISSING ANDROID SDK
echo ==========================================

cd /d "C:\Users\BM\Documents\IT-U\S5\MrRojo\Project-Cloud\Mobile\Mobile\Mobile\road-app"

echo 1. Checking for Android SDK...
set "SDK_FOUND=0"

if exist "%LOCALAPPDATA%\Android\Sdk" (
    echo Found SDK at: %LOCALAPPDATA%\Android\Sdk
    set "SDK_PATH=%LOCALAPPDATA%\Android\Sdk"
    set "SDK_FOUND=1"
)

if exist "C:\Android\Sdk" (
    echo Found SDK at: C:\Android\Sdk
    set "SDK_PATH=C:\Android\Sdk"
    set "SDK_FOUND=1"
)

if "%ANDROID_HOME%" neq "" (
    if exist "%ANDROID_HOME%" (
        echo Found ANDROID_HOME at: %ANDROID_HOME%
        set "SDK_PATH=%ANDROID_HOME%"
        set "SDK_FOUND=1"
    )
)

echo.
if %SDK_FOUND% equ 0 (
    echo ERROR: No Android SDK found!
    echo.
    echo ==========================================
    echo INSTALL ANDROID SDK:
    echo ==========================================
    echo Option 1: Install Android Studio (easiest)
    echo   https://developer.android.com/studio
    echo.
    echo Option 2: Install SDK command line only:
    echo   1. Download: https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip
    echo   2. Extract to: C:\Android\Sdk\cmdline-tools\latest
    echo   3. Run this script again
    echo.
    pause
    exit /b 1
)

echo 2. Creating local.properties...
(
echo sdk.dir=%SDK_PATH:\=\\%
echo ndk.dir=%SDK_PATH:\=\\%\\ndk\\25.2.9519653
) > android\local.properties

echo 3. Setting environment variables...
setx ANDROID_HOME "%SDK_PATH%" >nul
setx ANDROID_SDK_ROOT "%SDK_PATH%" >nul

echo 4. Checking if SDK has required packages...
if exist "%SDK_PATH%\platform-tools\adb.exe" (
    echo ADB found - good!
) else (
    echo WARNING: ADB not found in SDK
)

echo 5. Installing required SDK components if needed...
if exist "%SDK_PATH%\cmdline-tools\latest\bin\sdkmanager.bat" (
    echo Installing Android SDK Platform 33...
    "%SDK_PATH%\cmdline-tools\latest\bin\sdkmanager.bat" "platforms;android-33"
    echo Installing Build Tools...
    "%SDK_PATH%\cmdline-tools\latest\bin\sdkmanager.bat" "build-tools;33.0.0"
)

echo.
echo 6. Testing build...
cd android
call gradlew.bat --version

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo SDK FIXED! Now run:
    echo ==========================================
    echo cd..
    echo npx cap build android
) else (
    echo.
    echo ERROR: Gradle still failing
    echo Try: gradlew.bat assembleDebug --stacktrace
)

pause