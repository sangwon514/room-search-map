from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from models import SearchParams, RoomListResponse
from utils.session import get_session_from_cookies

router = APIRouter(tags=["rooms"])

@router.post("/rooms", response_model=RoomListResponse)
async def search_rooms(search_params: SearchParams, request: Request):
    """숙소 검색 API"""
    try:
        # 세션 확인
        session = get_session_from_cookies(request)
        if not session:
            raise HTTPException(status_code=401, detail="세션이 설정되지 않았습니다.")
        
        print(f" [SEARCH] 숙소 검색 요청: {search_params}")
        print(f" [SESSION] 세션: {session[:10]}..." if len(session) > 10 else session)
        
        # 실제 API 호출 로직은 여기에 구현
        # 현재는 빈 응답 반환
        return RoomListResponse(
            list=[],
            total_count=0,
            current_page=search_params.now_page or 1
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f" [ERROR] 숙소 검색 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="숙소 검색 중 오류가 발생했습니다.")

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
            
            # 기타 오류도 세션 문제로 간주
            if test_result.error_code and test_result.error_code != 200:
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
