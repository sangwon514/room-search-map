export interface Room {
  rid: number;
  room_name: string;
  state: string;
  province: string;
  town: string;
  pic_main: string;
  addr_lot: string;
  addr_street: string;
  using_fee: number;
  pyeong_size: number;
  room_cnt: number;
  bathroom_cnt: number;
  cookroom_cnt: number;
  sittingroom_cnt: number;
  reco_type_1: boolean;
  reco_type_2: boolean;
  longterm_discount_per: number;
  early_discount_per: number;
  is_new: boolean;
  is_super_host: boolean;
  lat: number;
  lng: number;
}

export interface RoomResponse {
  error_code: number;
  aws_cloudfront_url: string;
  list: Room[];
}