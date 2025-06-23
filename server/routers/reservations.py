from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from models import ReservationRequest, ReservationBatchResponse
from services.reservation_service import ReservationService
from services.excel_service import ExcelService
from utils.session import get_session_from_cookies

router = APIRouter(prefix="/api", tags=["reservations"])

# 서비스 인스턴스
reservation_service = ReservationService()
excel_service = ExcelService()

@router.post("/reservations", response_model=ReservationBatchResponse)
async def get_reservations(reservation_request: ReservationRequest, request: Request):
    """예약률 데이터 가져오기 API"""
    try:
        # 세션 확인
        session = get_session_from_cookies(request)
        if not session:
            raise HTTPException(status_code=401, detail="세션이 설정되지 않았습니다.")
        
        # 예약률 데이터 수집
        result = await reservation_service.get_reservations(reservation_request, session)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [ERROR] 예약률 데이터 수집 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="예약률 데이터 수집 중 오류가 발생했습니다.")

@router.post("/download_excel")
async def download_excel(reservation_request: ReservationRequest, request: Request):
    """예약률 데이터를 엑셀 파일로 다운로드"""
    try:
        # 세션 확인
        session = get_session_from_cookies(request)
        if not session:
            raise HTTPException(status_code=401, detail="세션이 설정되지 않았습니다.")
        
        print(f"📥 [DOWNLOAD] 엑셀 다운로드 요청: {reservation_request}")
        
        # 예약률 데이터 수집
        data = await reservation_service.get_reservations(reservation_request, session)
        
        # 403 오류 시 즉시 중단
        for reservation_data in data.data:
            if reservation_data.error_code == 403:
                print(f"🚫 [ERROR] 세션 만료로 인한 다운로드 중단")
                raise HTTPException(status_code=403, detail="세션이 만료되었습니다. 다시 로그인해주세요.")
        
        # 엑셀 파일 생성
        buffer = excel_service.create_excel_file(data, reservation_request)
        
        # 파일명 생성
        filename = excel_service.generate_filename(reservation_request)
        from urllib.parse import quote
        encoded_filename = quote(filename)
        
        print(f"✅ [DEBUG] 엑셀 파일 생성 완료: {filename}")
        
        # 파일 다운로드 응답
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [ERROR] 엑셀 다운로드 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="엑셀 다운로드 중 오류가 발생했습니다.")
