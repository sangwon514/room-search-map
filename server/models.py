from pydantic import BaseModel
from typing import List, Optional

class RoomInfo(BaseModel):
    rid: int
    rname: str

class ReservationRequest(BaseModel):
    room_list: List[RoomInfo]
    start_year: int
    start_month: int
    end_year: int
    end_month: int

class ScheduleItem(BaseModel):
    date: str
    status: str

class ScheduleResponse(BaseModel):
    schedule_list: List[ScheduleItem]

class ReservationData(BaseModel):
    rid: int
    year: int
    month: int
    schedule_list: List[ScheduleItem] = []
    error_code: Optional[int] = 0
    raw_response: Optional[dict] = None

class ReservationBatchResponse(BaseModel):
    success: bool
    total_requests: int
    completed_requests: int
    failed_requests: int
    data: List[ReservationData]
    errors: List[str]
