@echo off
echo ========================================
echo  Reliable Gradle Build Script
echo ========================================

REM Set Java home to your JDK path
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.6.7-hotspot"
echo Using Java Home: %JAVA_HOME%

REM Set Gradle options
set "GRADLE_OPTS=-Xmx4096m -XX:MaxMetaspaceSize=512m"
echo Setting Gradle memory options: %GRADLE_OPTS%

REM Determine build type
set BUILD_TYPE=assembleRelease
if /i "%1"=="bundle" (
    set BUILD_TYPE=bundleRelease
    echo Building Android App Bundle (AAB)...
) else (
    echo Building APK...
)

REM Change to android directory
cd android

REM Clean build directories
echo Cleaning previous build artifacts...
call .\gradlew clean --quiet

REM Run the Gradle build with extended timeout
echo Building with Gradle (this may take a few minutes)...
call .\gradlew %BUILD_TYPE% --info

REM Check build result
if %ERRORLEVEL% NEQ 0 (
    echo Build failed with error code: %ERRORLEVEL%
    echo Try running with: gradle-build.bat debug
    cd ..
    exit /b %ERRORLEVEL%
) else (
    echo Build completed successfully!
    
    if /i "%BUILD_TYPE%"=="bundleRelease" (
        echo AAB file location: app\build\outputs\bundle\release\app-release.aab
    ) else (
        echo APK file location: app\build\outputs\apk\release\app-release.apk
    )
    
    cd ..
)

echo ========================================
echo Build process completed.
echo ========================================
