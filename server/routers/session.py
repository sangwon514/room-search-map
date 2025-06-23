from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from utils.session import get_session_from_cookies
from services.reservation_service import ReservationService

router = APIRouter(prefix="/api", tags=["session"])

@router.get("/session")
async def get_session_info(request: Request):
    """현재 세션 정보 조회"""
    session = get_session_from_cookies(request)
    
    if not session:
        return JSONResponse(
            status_code=401,
            content={"message": "세션이 설정되지 않았습니다.", "session": None}
        )
    
    return JSONResponse(content={
        "message": "세션이 설정되어 있습니다.",
        "session": session[:10] + "..." if len(session) > 10 else session
    })

@router.post("/validate_session")
async def validate_session(request: Request):
    """세션 유효성을 실제 외부 API 호출로 검증"""
    from services.reservation_service import ReservationService
    import httpx
    
    session = get_session_from_cookies(request)
    if not session:
        return JSONResponse(
            status_code=401,
            content={"valid": False, "message": "세션이 설정되지 않았습니다."}
        )
    
    # 테스트용 더미 데이터로 외부 API 호출
    reservation_service = ReservationService()
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 임의의 RID와 현재 년월로 테스트 호출
            from datetime import datetime
            now = datetime.now()
            test_result = await reservation_service.fetch_schedule_data(
                client=client,
                url="https://33m2.co.kr/app/room/schedule",
                session=session,
                rid=1,  # 테스트용 RID
                year=now.year,
                month=now.month
            )
            
            # 403 오류면 세션 무효
            if test_result.error_code == 403:
                return JSONResponse(content={
                    "valid": False, 
                    "message": "세션이 만료되었거나 유효하지 않습니다."
                })
            
            # error_code가 10인 경우도 세션 무효 처리
            if test_result.error_code == 10 or (test_result.raw_response and test_result.raw_response.get("error_code") == 10):
                return JSONResponse(content={
                    "valid": False, 
                    "message": "세션이 유효하지 않습니다. (error_code: 10)"
                })
            
            # 기타 오류도 세션 문제로 간주
            if test_result.error_code and test_result.error_code != 200 and test_result.error_code != 0:
                return JSONResponse(content={
                    "valid": False, 
                    "message": f"세션 검증 중 오류 발생 (코드: {test_result.error_code})"
                })
            
            return JSONResponse(content={
                "valid": True, 
                "message": "세션이 유효합니다."
            })
            
    except Exception as e:
        return JSONResponse(content={
            "valid": False, 
            "message": f"세션 검증 중 오류 발생: {str(e)}"
        })
