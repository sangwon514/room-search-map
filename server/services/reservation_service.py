import asyncio
import httpx
from typing import List
from datetime import datetime

from models import ReservationRequest, ReservationData, ReservationBatchResponse, ScheduleItem

class ReservationService:
    def __init__(self):
        self.base_url = "https://33m2.co.kr/app/room/schedule"
        
    async def get_reservations(self, reservation_request: ReservationRequest, session: str) -> ReservationBatchResponse:
        """예약 데이터 배치 조회"""
        print(f"🔍 [RESERVATION] 예약 데이터 조회 시작")
        print(f"🔍 [RESERVATION] 방 목록: {[f'{room.rid}({room.rname})' for room in reservation_request.room_list]}")
        print(f"🔍 [RESERVATION] 기간: {reservation_request.start_year}-{reservation_request.start_month:02d} ~ {reservation_request.end_year}-{reservation_request.end_month:02d}")
        
        # 요청 목록 생성 (RID, 년, 월 조합)
        requests = []
        for room in reservation_request.room_list:
            for year in range(reservation_request.start_year, reservation_request.end_year + 1):
                start_month = reservation_request.start_month if year == reservation_request.start_year else 1
                end_month = reservation_request.end_month if year == reservation_request.end_year else 12
                
                for month in range(start_month, end_month + 1):
                    requests.append((room.rid, year, month))
        
        print(f"📋 [INFO] 총 {len(requests)}개의 요청 생성됨")
        
        # 배치 처리 (10개씩)
        batch_size = 10
        batches = [requests[i:i + batch_size] for i in range(0, len(requests), batch_size)]
        
        all_data = []
        errors = []
        completed_requests = 0
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            for batch_idx, batch in enumerate(batches):
                print(f"🔄 [BATCH {batch_idx + 1}/{len(batches)}] {len(batch)}개 요청 처리 중...")
                
                # 배치 내 병렬 처리
                tasks = [
                    self.fetch_schedule_data(client, self.base_url, session, rid, year, month)
                    for rid, year, month in batch
                ]
                
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for result in batch_results:
                    if isinstance(result, Exception):
                        errors.append(f"요청 처리 중 오류: {str(result)}")
                    else:
                        all_data.append(result)
                        completed_requests += 1
                
                # 배치 간 대기 (마지막 배치 제외)
                if batch_idx < len(batches) - 1:
                    print(f"⏳ [BATCH {batch_idx + 1}] 완료, 1초 대기 중...")
                    await asyncio.sleep(1)
        
        failed_requests = len(requests) - completed_requests
        success = failed_requests == 0
        
        print(f"✅ [COMPLETE] 총 {len(requests)}개 요청 중 {completed_requests}개 성공, {failed_requests}개 실패")
        
        return ReservationBatchResponse(
            success=success,
            total_requests=len(requests),
            completed_requests=completed_requests,
            failed_requests=failed_requests,
            data=all_data,
            errors=errors
        )
    
    async def fetch_schedule_data(self, client: httpx.AsyncClient, url: str, session: str, rid: int, year: int, month: int) -> ReservationData:
        """외부 API에서 스케줄 데이터 가져오기"""
        try:
            headers = {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
                "Referer": f"https://33m2.co.kr/room/detail/{rid}",
                "Origin": "https://33m2.co.kr",
                "x-requested-with": "XMLHttpRequest",
                "Cookie": f"SESSION={session}"
            }
            
            payload = {
                "rid": rid,
                "year": year,
                "month": month
            }
            
            print(f"📡 [API] RID {rid}, {year}년 {month}월 요청 중...")
            
            response = await client.post(url, data=payload, headers=headers)
            
            if response.status_code == 403:
                print(f"🚫 [ERROR] RID {rid}, {year}년 {month}월 - 세션 만료 (403)")
                return ReservationData(
                    rid=rid,
                    year=year,
                    month=month,
                    schedule_list=[],
                    error_code=403,
                    raw_response={"error": "세션 만료"}
                )
            
            if response.status_code != 200:
                print(f"❌ [ERROR] RID {rid}, {year}년 {month}월 - HTTP {response.status_code}")
                return ReservationData(
                    rid=rid,
                    year=year,
                    month=month,
                    schedule_list=[],
                    error_code=response.status_code,
                    raw_response={"error": f"HTTP {response.status_code}"}
                )
            
            data = response.json()
            
            # 스케줄 데이터 파싱
            schedule_list = []
            if "schedule_list" in data and data["schedule_list"]:
                for item in data["schedule_list"]:
                    schedule_list.append(ScheduleItem(
                        date=item.get("date", ""),
                        status=item.get("status", "")
                    ))
            
            print(f"✅ [SUCCESS] RID {rid}, {year}년 {month}월 - {len(schedule_list)}개 일정 수집")
            
            return ReservationData(
                rid=rid,
                year=year,
                month=month,
                schedule_list=schedule_list,
                error_code=0,
                raw_response=data
            )
            
        except Exception as e:
            print(f"💥 [EXCEPTION] RID {rid}, {year}년 {month}월 - {str(e)}")
            return ReservationData(
                rid=rid,
                year=year,
                month=month,
                schedule_list=[],
                error_code=-1,
                raw_response={"error": str(e)}
            )
