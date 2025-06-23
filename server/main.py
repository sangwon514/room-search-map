import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from routers import rooms, reservations

# 환경 변수 로드
load_dotenv()

# FastAPI 앱 생성
app = FastAPI(
    title="Room Crawler API",
    description="숙소 검색 및 예약률 관리 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # React 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(rooms.router, prefix="/api")
app.include_router(reservations.router)

# 기본 엔드포인트
@app.get("/")
async def root():
    """API 상태 확인"""
    return {"message": "Room Crawler API가 정상적으로 실행 중입니다."}

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "message": "API 서버가 정상 작동 중입니다."}

# 예외 처리
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
