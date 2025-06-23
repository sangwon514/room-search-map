/**
 * 검색 필터 타입 정의
 */
export interface SearchFilter {
  // 검색어
  keyword: string;
  
  // 테마 타입
  theme_type: string;
  
  // 방 개수
  room_cnt: string[];
  
  // 부동산 유형
  property_type: string[];
  
  // 옵션
  animal: boolean;
  subway: boolean;
  longterm_discount: boolean;
  early_discount: boolean;
  parking_place: boolean;
  
  // 가격 범위
  min_using_fee: number;
  max_using_fee: number;
  
  // 정렬
  sort: string;
  
  // 페이징
  now_page: number;
  itemcount: number;
  
  // 지도 관련
  by_location: boolean;
  north_east_lat: number;
  north_east_lng: number;
  south_west_lat: number;
  south_west_lng: number;
  map_level: number;
}

/**
 * 검색 스토어 상태 타입
 */
export interface SearchStore extends SearchFilter {
  // 상태 업데이트 메서드들
  updateFilter: <K extends keyof SearchFilter>(
    key: K, 
    value: SearchFilter[K]
  ) => void;
  
  updateFilters: (filters: Partial<SearchFilter>) => void;
  
  resetFilters: () => void;
}

/**
 * API 요청 파라미터 타입 (메서드 제외)
 */
export type SearchParams = Omit<SearchFilter, keyof {
  updateFilter: never;
  updateFilters: never;
  resetFilters: never;
}>;
