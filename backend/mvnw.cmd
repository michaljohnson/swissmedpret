@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper for Windows (mvnw.cmd)
@REM ----------------------------------------------------------------------------

@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=%~dp0"
set "BASE_DIR=%BASE_DIR:~0,-1%"

set "WRAPPER_JAR=%BASE_DIR%\.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_PROPERTIES=%BASE_DIR%\.mvn\wrapper\maven-wrapper.properties"

if not exist "%WRAPPER_JAR%" (
    set "WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
    for /f "tokens=2 delims==" %%a in ('findstr "^wrapperUrl=" "%WRAPPER_PROPERTIES%"') do set "WRAPPER_URL=%%a"
    echo Downloading Maven wrapper from !WRAPPER_URL!
    powershell -Command "& {Invoke-WebRequest -Uri '!WRAPPER_URL!' -OutFile '%WRAPPER_JAR%'}"
)

if not defined JAVA_HOME (
    set "JAVACMD=java"
) else (
    set "JAVACMD=%JAVA_HOME%\bin\java.exe"
)

"%JAVACMD%" %MAVEN_OPTS% ^
  -classpath "%WRAPPER_JAR%" ^
  "-Dmaven.multiModuleProjectDirectory=%BASE_DIR%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*
