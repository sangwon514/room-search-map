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

echo ""
log_info "=== 33m2 프로젝트 서버 종료 ==="

# 포트 사용 중인 프로세스 확인 및 종료
check_and_kill_port() {
    local port=$1
    local service_name=$2
    
    log_info "${service_name} 서버 종료 중... (포트: ${port})"
    
    # 포트를 사용하는 프로세스 찾기
    local pids=$(lsof -ti :${port} 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "$pids" | while read pid; do
            if [ -n "$pid" ]; then
                log_info "PID ${pid} 종료 중..."
                kill -TERM "$pid" 2>/dev/null
                
                # 3초 대기 후 강제 종료 확인
                sleep 3
                if kill -0 "$pid" 2>/dev/null; then
                    log_warning "PID ${pid} 강제 종료 중..."
                    kill -KILL "$pid" 2>/dev/null
                fi
            fi
        done
        log_success "${service_name} 서버가 종료되었습니다."
    else
        log_info "${service_name} 서버가 실행 중이지 않습니다."
    fi
}

# 프로세스 이름으로 종료
kill_by_process_name() {
    local process_pattern=$1
    local service_name=$2
    
    log_info "${service_name} 프로세스 종료 중..."
    
    local pids=$(pgrep -f "$process_pattern" 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "$pids" | while read pid; do
            if [ -n "$pid" ]; then
                log_info "PID ${pid} (${service_name}) 종료 중..."
                kill -TERM "$pid" 2>/dev/null
                
                # 3초 대기 후 강제 종료 확인
                sleep 3
                if kill -0 "$pid" 2>/dev/null; then
                    log_warning "PID ${pid} 강제 종료 중..."
                    kill -KILL "$pid" 2>/dev/null
                fi
            fi
        done
        log_success "${service_name} 프로세스가 종료되었습니다."
    else
        log_info "${service_name} 프로세스가 실행 중이지 않습니다."
    fi
}

# 백엔드 서버 종료 (포트 8000)
check_and_kill_port 8000 "백엔드"

# 프론트엔드 서버 종료 (포트 5173)
check_and_kill_port 5173 "프론트엔드"

# 추가로 프로세스 이름으로 종료
kill_by_process_name "uvicorn.*main:app" "Uvicorn 백엔드"
kill_by_process_name "vite" "Vite 프론트엔드"
kill_by_process_name "start.sh" "Start 스크립트"

# Node.js 개발 서버 프로세스 종료 (프로젝트 디렉토리 기준)
PROJECT_DIR="/Users/sangwonlee/project/crawler/33m2"
log_info "프로젝트 관련 Node.js 프로세스 종료 중..."

node_pids=$(ps aux | grep -E "node.*${PROJECT_DIR}" | grep -v grep | awk '{print $2}')
if [ -n "$node_pids" ]; then
    echo "$node_pids" | while read pid; do
        if [ -n "$pid" ]; then
            log_info "Node.js PID ${pid} 종료 중..."
            kill -TERM "$pid" 2>/dev/null
        fi
    done
    sleep 2
    log_success "프로젝트 관련 Node.js 프로세스가 종료되었습니다."
else
    log_info "프로젝트 관련 Node.js 프로세스가 실행 중이지 않습니다."
fi

echo ""
log_info "=== 최종 상태 확인 ==="

# 최종 포트 상태 확인
ports_in_use=$(lsof -i :8000 -i :5173 2>/dev/null)
if [ -n "$ports_in_use" ]; then
    log_warning "일부 포트가 여전히 사용 중입니다:"
    echo "$ports_in_use"
else
    log_success "모든 포트(8000, 5173)가 해제되었습니다."
fi

echo ""
log_success "=== 서버 종료 완료! ==="
log_info "다시 시작하려면: ./start.sh"
echo ""
