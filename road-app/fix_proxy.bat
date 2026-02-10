@echo off
echo Fixing University Proxy Issues...
echo.

:: 1. Set direct Gradle properties (no proxy)
(
echo # Direct connection - no proxy
echo systemProp.http.nonProxyHosts=localhost|127.*|[::1]
echo systemProp.https.nonProxyHosts=localhost|127.*|[::1]
echo org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
) > "%USERPROFILE%\.gradle\gradle.properties"

:: 2. Configure Android Studio proxy
echo Setting Android Studio proxy...
(
echo idea.https.proxyHost=
echo idea.https.proxyPort=
echo idea.https.proxyType=HTTP
) > "%APPDATA%\Google\AndroidStudio2023.2\options\proxy.settings.xml"

:: 3. Use mobile data DNS
echo Setting Google DNS...
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2

:: 4. Test connection
echo Testing connection to dl.google.com...
ping dl.google.com -n 2

if errorlevel 1 (
    echo.
    echo ==================================
    echo USE MOBILE HOTSPOT!
    echo ==================================
    echo 1. Turn on phone hotspot
    echo 2. Connect laptop to it
    echo 3. Try building again
)

echo.
echo Now try: Build → Clean Project → Rebuild Project
pause