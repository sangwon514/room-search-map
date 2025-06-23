import axios from 'axios';
import type { RoomResponse } from '@/types/Room';
import type { SearchParams } from '@/types/search';

/**
 * 방 목록을 조회하는 API 함수
 * @param params 검색 파라미터
 * @returns 방 목록 데이터
 */
export const fetchRooms = async (params: Partial<SearchParams> = {}): Promise<RoomResponse> => {
  // 기본값 설정
  const defaultParams: Partial<SearchParams> = {
    sort: 'popular',
    now_page: 1,
    itemcount: 1000,
    by_location: true,
    map_level: 7,
    min_using_fee: 0,
    max_using_fee: 1000000,
  };

  // 파라미터 병합 (undefined인 값은 제외)
  const payload = { ...defaultParams };
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      (payload as Record<string, string | number | boolean | string[]>)[key] = value;
    }
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const formBody = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // 배열인 경우 쉼표로 구분된 문자열로 변환
      formBody.append(key, value.join(','));
    } else if (typeof value === 'boolean') {
      // 불리언인 경우 문자열로 변환
      formBody.append(key, String(value));
    } else if (value !== undefined && value !== null) {
      // 그 외의 경우 문자열로 변환 (undefined, null 제외)
      formBody.append(key, String(value));
    }
  });

  try {
    const response = await axios.post<RoomResponse>('/room-search-api/app/room/search', formBody, { headers });
    if (response.data.error_code === 0) return response.data;
    return { error_code: response.data.error_code, aws_cloudfront_url: '', list: [] };
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return { error_code: -1, aws_cloudfront_url: '', list: [] };
  }
};
