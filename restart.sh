#!/bin/bash

# 33m2 프로젝트 재시작 스크립트
# 기존 서버를 안전하게 종료하고 새로 시작합니다

set -e  # 오류 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔄 33m2 프로젝트 재시작 중...${NC}"
echo "=================================================="

# 1. 기존 서버 종료
echo -e "${YELLOW}📛 기존 서버 종료 중...${NC}"
if [ -f "./stop.sh" ]; then
    chmod +x ./stop.sh
    ./stop.sh
else
    echo -e "${RED}❌ stop.sh 파일을 찾을 수 없습니다.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}⏳ 서버 종료 완료, 3초 대기 중...${NC}"
sleep 3

# 2. 새 서버 시작
echo -e "${GREEN}🚀 새 서버 시작 중...${NC}"
if [ -f "./start.sh" ]; then
    chmod +x ./start.sh
    ./start.sh
else
    echo -e "${RED}❌ start.sh 파일을 찾을 수 없습니다.${NC}"
    exit 1
fi
