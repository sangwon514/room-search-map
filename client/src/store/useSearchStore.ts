import { create } from 'zustand';
import type { SearchFilter, SearchStore, SearchParams } from '@/types/search';

/**
 * 검색 스토어의 초기 상태
 */
const initialState: SearchFilter = {
  // 검색 관련
  theme_type: "",
  keyword: "",
  sort: "popular",
  now_page: 1,
  itemcount: 1000,
  by_location: true,
  
  // 방 정보
  room_cnt: [],
  property_type: [],
  
  // 옵션
  animal: false,
  subway: false,
  longterm_discount: false,
  early_discount: false,
  parking_place: false,
  
  // 가격
  min_using_fee: 0,
  max_using_fee: 1000000,
  
  // 지도
  map_level: 4,
  north_east_lng: 0,
  north_east_lat: 0,
  south_west_lng: 0,
  south_west_lat: 0,
};

/**
 * 검색 상태를 관리하는 스토어
 */
export const useSearchStore = create<SearchStore>((set) => ({
  ...initialState,
  
  /**
   * 단일 필터 업데이트
   * @param key 업데이트할 필터 키
   * @param value 새로운 값
   */
  updateFilter: (key, value) => set((state) => ({
    ...state,
    [key]: value,
    // 페이지네이션 초기화 (필터 변경 시)
    ...(key !== 'now_page' && { now_page: 1 }),
  })),
  
  /**
   * 여러 필터 한 번에 업데이트
   * @param filters 업데이트할 필터 객체
   */
  updateFilters: (filters) => set((state) => ({
    ...state,
    ...filters,
    // 페이지네이션 초기화 (필터 변경 시)
    ...(!('now_page' in filters) && { now_page: 1 }),
  })),
  
  /**
   * 모든 필터를 초기 상태로 리셋
   */
  resetFilters: () => set(initialState),
}));

/**
 * API 호출에 사용할 파라미터만 추출하는 헬퍼 함수
 * @param state 검색 스토어 상태
 * @returns API 파라미터 객체
 */
export const getSearchParams = (state: SearchFilter): SearchParams => {
  // 메서드 제외하고 필요한 필드만 추출
  const { 
    updateFilter, 
    updateFilters, 
    resetFilters, 
    ...params 
  } = state as unknown as SearchStore;
  
  return params;
};
