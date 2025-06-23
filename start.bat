@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 색상 정의 (Windows에서는 제한적)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

:: 현재 디렉토리 설정
set "SCRIPT_DIR=%~dp0"
set "CLIENT_DIR=%SCRIPT_DIR%client"
set "SERVER_DIR=%SCRIPT_DIR%server"

echo %INFO% 프로젝트 루트 디렉토리: %SCRIPT_DIR%

:: Node.js 설치 확인
echo %INFO% Node.js 설치 확인 중...
node --version >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Node.js가 설치되지 않았습니다. Node.js를 설치해주세요.
    echo %INFO% 설치 방법: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %SUCCESS% Node.js 버전: %NODE_VERSION%

:: Python 설치 확인
echo %INFO% Python 설치 확인 중...
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo %ERROR% Python이 설치되지 않았습니다. Python을 설치해주세요.
        echo %INFO% 설치 방법: https://python.org/
        pause
        exit /b 1
    ) else (
        set "PYTHON_CMD=python3"
    )
) else (
    set "PYTHON_CMD=python"
)
for /f "tokens=*" %%i in ('%PYTHON_CMD% --version') do set PYTHON_VERSION=%%i
echo %SUCCESS% Python 버전: %PYTHON_VERSION%

:: 프론트엔드 의존성 설치
echo %INFO% 프론트엔드 의존성 확인 중...
if not exist "%CLIENT_DIR%" (
    echo %ERROR% 클라이언트 디렉토리가 존재하지 않습니다: %CLIENT_DIR%
    pause
    exit /b 1
)

cd /d "%CLIENT_DIR%"
if not exist "package.json" (
    echo %ERROR% package.json이 존재하지 않습니다.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo %WARNING% node_modules가 없습니다. npm install을 실행합니다...
    npm install
    if errorlevel 1 (
        echo %ERROR% npm install 실패
        pause
        exit /b 1
    )
    echo %SUCCESS% 프론트엔드 의존성 설치 완료
) else (
    echo %SUCCESS% 프론트엔드 의존성이 이미 설치되어 있습니다.
)

:: 백엔드 의존성 설치
echo %INFO% 백엔드 의존성 확인 중...
if not exist "%SERVER_DIR%" (
    echo %ERROR% 서버 디렉토리가 존재하지 않습니다: %SERVER_DIR%
    pause
    exit /b 1
)

cd /d "%SERVER_DIR%"
if not exist "requirements.txt" (
    echo %ERROR% requirements.txt가 존재하지 않습니다.
    pause
    exit /b 1
)

if not exist "venv" (
    echo %WARNING% 가상환경이 없습니다. 가상환경을 생성합니다...
    %PYTHON_CMD% -m venv venv
    if errorlevel 1 (
        echo %ERROR% 가상환경 생성 실패
        pause
        exit /b 1
    )
    echo %SUCCESS% 가상환경 생성 완료
)

:: 가상환경 활성화 및 의존성 설치
call venv\Scripts\activate.bat
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo %WARNING% Python 패키지가 설치되지 않았습니다. pip install을 실행합니다...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo %ERROR% pip install 실패
        pause
        exit /b 1
    )
    echo %SUCCESS% 백엔드 의존성 설치 완료
) else (
    echo %SUCCESS% 백엔드 의존성이 이미 설치되어 있습니다.
)

:: 서버 시작
echo %INFO% === 서버 시작 ===

:: 백엔드 서버 시작
echo %INFO% 백엔드 서버를 시작합니다... (포트: 8000)
cd /d "%SERVER_DIR%"
call venv\Scripts\activate.bat
start /b python main.py > backend.log 2>&1

:: 백엔드 서버 시작 대기
timeout /t 3 /nobreak >nul

:: 프론트엔드 서버 시작
echo %INFO% 프론트엔드 서버를 시작합니다... (포트: 5173)
cd /d "%CLIENT_DIR%"
start /b npm run dev > frontend.log 2>&1

:: 서버 시작 대기
timeout /t 5 /nobreak >nul

echo %SUCCESS% === 모든 서버가 시작되었습니다! ===
echo %INFO% 프론트엔드: http://localhost:5173
echo %INFO% 백엔드 API: http://localhost:8000
echo %INFO% API 문서: http://localhost:8000/docs
echo.
echo %INFO% 브라우저에서 http://localhost:5173 을 열어주세요.
echo %INFO% 종료하려면 아무 키나 누르세요.
pause >nul

:: 프로세스 종료
echo %WARNING% 서버를 종료합니다...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo %SUCCESS% 모든 서버가 종료되었습니다.
pause
