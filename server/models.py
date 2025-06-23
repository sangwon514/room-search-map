from pydantic import BaseModel
from typing import List, Optional

class Room(BaseModel):
    rid: int
    room_name: str
    state: str
    province: str
    town: str
    pic_main: str
    addr_lot: str
    addr_street: str
    using_fee: int
    pyeong_size: float
    room_cnt: int
    bathroom_cnt: int
    cookroom_cnt: int
    sittingroom_cnt: int
    reco_type_1: bool
    reco_type_2: bool
    longterm_discount_per: int
    early_discount_per: int
    is_new: bool
    is_super_host: bool
    lat: float
    lng: float

class SearchParams(BaseModel):
    keyword: Optional[str] = ""
    theme_type: Optional[str] = ""
    room_cnt: Optional[List[str]] = []
    property_type: Optional[List[str]] = []
    animal: Optional[bool] = False
    subway: Optional[bool] = False
    longterm_discount: Optional[bool] = False
    early_discount: Optional[bool] = False
    parking_place: Optional[bool] = False
    min_using_fee: Optional[int] = 0
    max_using_fee: Optional[int] = 1000000
    sort: Optional[str] = "latest"
    now_page: Optional[int] = 1
    itemcount: Optional[int] = 20
    by_location: Optional[bool] = False
    north_east_lat: Optional[float] = 0
    north_east_lng: Optional[float] = 0
    south_west_lat: Optional[float] = 0
    south_west_lng: Optional[float] = 0
    map_level: Optional[int] = 3

class RoomListResponse(BaseModel):
    list: List[Room]
    total_count: int
    current_page: int

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
