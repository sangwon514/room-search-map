#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$SCRIPT_DIR/client"
SERVER_DIR="$SCRIPT_DIR/server"

log_info "프로젝트 루트 디렉토리: $SCRIPT_DIR"

# Node.js 설치 확인
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js가 설치되지 않았습니다. Node.js를 설치해주세요."
        log_info "설치 방법: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    log_success "Node.js 버전: $NODE_VERSION"
}

# Python 설치 확인
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        log_error "Python이 설치되지 않았습니다. Python을 설치해주세요."
        log_info "설치 방법: https://python.org/"
        exit 1
    fi
    
    PYTHON_VERSION=$($PYTHON_CMD --version)
    log_success "Python 버전: $PYTHON_VERSION"
}

# 프론트엔드 의존성 설치
setup_frontend() {
    log_info "프론트엔드 의존성 확인 중..."
    
    if [ ! -d "$CLIENT_DIR" ]; then
        log_error "클라이언트 디렉토리가 존재하지 않습니다: $CLIENT_DIR"
        exit 1
    fi
    
    cd "$CLIENT_DIR"
    
    # package.json 존재 확인
    if [ ! -f "package.json" ]; then
        log_error "package.json이 존재하지 않습니다."
        exit 1
    fi
    
    # node_modules 확인
    if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
        log_warning "node_modules가 없습니다. npm install을 실행합니다..."
        npm install
        if [ $? -ne 0 ]; then
            log_error "npm install 실패"
            exit 1
        fi
        log_success "프론트엔드 의존성 설치 완료"
    else
        log_success "프론트엔드 의존성이 이미 설치되어 있습니다."
    fi
}

# 백엔드 의존성 설치
setup_backend() {
    log_info "백엔드 의존성 확인 중..."
    
    if [ ! -d "$SERVER_DIR" ]; then
        log_error "서버 디렉토리가 존재하지 않습니다: $SERVER_DIR"
        exit 1
    fi
    
    cd "$SERVER_DIR"
    
    # requirements.txt 존재 확인
    if [ ! -f "requirements.txt" ]; then
        log_error "requirements.txt가 존재하지 않습니다."
        exit 1
    fi
    
    # 가상환경 확인 및 생성
    if [ ! -d "venv" ]; then
        log_warning "가상환경이 없습니다. 가상환경을 생성합니다..."
        $PYTHON_CMD -m venv venv
        if [ $? -ne 0 ]; then
            log_error "가상환경 생성 실패"
            exit 1
        fi
        log_success "가상환경 생성 완료"
    fi
    
    # 가상환경 활성화 및 의존성 설치
    source venv/bin/activate
    
    # pip 패키지 확인 (간단한 방법으로 fastapi 확인)
    if ! python -c "import fastapi" 2>/dev/null; then
        log_warning "Python 패키지가 설치되지 않았습니다. pip install을 실행합니다..."
        pip install -r requirements.txt
        if [ $? -ne 0 ]; then
            log_error "pip install 실패"
            exit 1
        fi
        log_success "백엔드 의존성 설치 완료"
    else
        log_success "백엔드 의존성이 이미 설치되어 있습니다."
    fi
}

# 프로세스 종료 함수
cleanup() {
    log_warning "프로세스를 종료합니다..."
    
    # 백그라운드 프로세스 종료
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        log_info "프론트엔드 서버 종료 (PID: $FRONTEND_PID)"
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        log_info "백엔드 서버 종료 (PID: $BACKEND_PID)"
    fi
    
    # 포트 8000, 5173에서 실행 중인 프로세스 강제 종료
    pkill -f "uvicorn.*main:app" 2>/dev/null
    pkill -f "vite.*--port 5173" 2>/dev/null
    
    log_success "모든 서버가 종료되었습니다."
    exit 0
}

# 신호 처리
trap cleanup SIGINT SIGTERM

# 메인 실행 함수
main() {
    log_info "=== 33m2 프로젝트 시작 ==="
    
    # 시스템 요구사항 확인
    check_node
    check_python
    
    # 의존성 설치
    setup_frontend
    setup_backend
    
    log_info "=== 서버 시작 ==="
    
    # 백엔드 서버 시작
    log_info "백엔드 서버를 시작합니다... (포트: 8000)"
    cd "$SERVER_DIR"
    source venv/bin/activate
    python main.py &
    BACKEND_PID=$!
    
    # 백엔드 서버 시작 대기
    sleep 3
    
    # 백엔드 서버 상태 확인
    if curl -s http://localhost:8000/health > /dev/null; then
        log_success "백엔드 서버가 성공적으로 시작되었습니다. (PID: $BACKEND_PID)"
        log_info "백엔드 API: http://localhost:8000"
        log_info "API 문서: http://localhost:8000/docs"
    else
        log_error "백엔드 서버 시작 실패"
        cleanup
        exit 1
    fi
    
    # 프론트엔드 서버 시작
    log_info "프론트엔드 서버를 시작합니다... (포트: 5173)"
    cd "$CLIENT_DIR"
    npm run dev &
    FRONTEND_PID=$!
    
    # 프론트엔드 서버 시작 대기
    sleep 5
    
    # 프론트엔드 서버 상태 확인
    if curl -s http://localhost:5173 > /dev/null; then
        log_success "프론트엔드 서버가 성공적으로 시작되었습니다. (PID: $FRONTEND_PID)"
        log_info "프론트엔드: http://localhost:5173"
    else
        log_warning "프론트엔드 서버 상태를 확인할 수 없습니다. 브라우저에서 직접 확인해주세요."
    fi
    
    log_success "=== 모든 서버가 시작되었습니다! ==="
    log_info "프론트엔드: http://localhost:5173"
    log_info "백엔드 API: http://localhost:8000"
    log_info "API 문서: http://localhost:8000/docs"
    log_info ""
    log_info "백엔드와 프론트엔드 로그가 실시간으로 출력됩니다."
    log_info "종료하려면 Ctrl+C를 누르세요."
    log_info ""
    
    # 무한 대기 (사용자가 Ctrl+C로 종료할 때까지)
    while true; do
        sleep 1
    done
}

# 스크립트 실행
main
