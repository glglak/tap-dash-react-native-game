@echo off
echo Starting Expo prebuild process...

REM Clean up any previous build artifacts
if exist android\app\build rmdir /s /q android\app\build
if exist android\build rmdir /s /q android\build

REM Completely regenerate the Android folder
if exist android rmdir /s /q android

REM Run Expo prebuild to generate fresh native code
echo Running Expo prebuild to generate fresh Android code...
call npx expo prebuild --platform android --clean

REM Check if prebuild was successful
if not exist android (
  echo Prebuild failed to create Android directory
  exit /b 1
)

REM Add Java compatibility flags to gradle.properties
echo.
echo Adding Java compatibility flags to gradle.properties...
set GRADLE_PROPS=android\gradle.properties
echo org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m --add-opens=java.base/java.io=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED>> %GRADLE_PROPS%

REM Create an empty keystore for signing if it doesn't exist
if not exist android\app\debug.keystore (
  echo Creating debug keystore...
  
  REM Try to find Java
  set FOUND_JAVA=0
  if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\keytool.exe" (
      set FOUND_JAVA=1
      echo Using existing JAVA_HOME: %JAVA_HOME%
    )
  )
  
  if %FOUND_JAVA% EQU 0 (
    REM Check common Java locations
    for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk*") do (
      if exist "%%i\bin\keytool.exe" (
        set "JAVA_HOME=%%i"
        set FOUND_JAVA=1
        echo Found Java at: %%i
      )
    )
    
    for /d %%i in ("C:\Program Files\Eclipse Temurin\jdk*") do (
      if exist "%%i\bin\keytool.exe" (
        set "JAVA_HOME=%%i"
        set FOUND_JAVA=1
        echo Found Java at: %%i
      )
    )
  )
  
  if %FOUND_JAVA% EQU 0 (
    echo Warning: Could not find Java to create keystore
  ) else (
    cd android\app
    "%JAVA_HOME%\bin\keytool" -genkeypair -v -storetype PKCS12 -keystore debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
    cd ..\..
  )
)

REM Build the APK or AAB file
echo.
echo Building Android app...
cd android

set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=bundleRelease

if "%BUILD_TYPE%"=="apk" (
  echo Building APK file...
  call gradlew.bat assembleRelease --no-daemon
  set OUTPUT_FILE=app\build\outputs\apk\release\app-release.apk
) else (
  echo Building AAB file for Google Play...
  call gradlew.bat bundleRelease --no-daemon
  set OUTPUT_FILE=app\build\outputs\bundle\release\app-release.aab
)

set BUILD_RESULT=%ERRORLEVEL%
cd ..

REM Check if the build was successful
if %BUILD_RESULT% NEQ 0 (
  echo.
  echo ❌ Build failed with error code %BUILD_RESULT%
  exit /b 1
) else (
  if exist android\%OUTPUT_FILE% (
    echo.
    echo ✅ Build completed successfully!
    echo.
    echo Your app is available at:
    echo %CD%\android\%OUTPUT_FILE%
    exit /b 0
  ) else (
    echo.
    echo ⚠️ Build reported success but no output file was found at:
    echo %CD%\android\%OUTPUT_FILE%
    exit /b 1
  )
)
