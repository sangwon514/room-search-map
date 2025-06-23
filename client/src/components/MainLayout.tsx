import { useState, useRef, useCallback, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import RoomList from "@/components/RoomList";
import KakaoMapView from "@/components/KakaoMapView";
import ActionButtons from "@/components/ActionButtons";
import { useSearchStore, getSearchParams } from "@/store/useSearchStore";
import { fetchRooms } from "@/api/fetchRooms";
import { useDebounce } from "@/utils/debounce";
import type { Room } from "@/types/Room";
import type { SearchFilter } from "@/types/search";

const INITIAL_BOUNDS = {
  // 신촌 지역 좌표 (연세대학교 주변)
  north_east_lng: 126.9465,
  north_east_lat: 37.5665,
  south_west_lng: 126.9365,
  south_west_lat: 37.5565,
  map_level: 3, // 초기 zoom level
};

type MapBounds = {
  north_east_lng: number;
  north_east_lat: number;
  south_west_lng: number;
  south_west_lat: number;
  map_level: number;
};

export default function MainLayout() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomGroup, setSelectedRoomGroup] = useState<Room[] | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds>(INITIAL_BOUNDS);
  const [leftWidth, setLeftWidth] = useState(420);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const loadRooms = useCallback(
    async (filters: Partial<SearchFilter>, bounds: MapBounds) => {
      try {
        const apiParams = { ...filters, ...bounds };
        const data = await fetchRooms(apiParams);
        setRooms(prevRooms => {
          // 이전 상태와 동일한 경우 업데이트 방지
          if (JSON.stringify(prevRooms) === JSON.stringify(data.list || [])) {
            return prevRooms;
          }
          return data.list || [];
        });
      } catch {
        setRooms([]);
      }
    },
    [] // mapBounds 의존성 제거
  );

  // 지도 경계 변경 핸들러 - 검색 자동 실행 방지
  const handleMapBoundsChange = useCallback((newBounds: MapBounds) => {
    setMapBounds(prevBounds => {
      // 이전 경계와 동일한 경우 업데이트 방지
      if (JSON.stringify(prevBounds) === JSON.stringify(newBounds)) {
        return prevBounds;
      }
      return newBounds;
    });
    // 여기서 자동으로 loadRooms를 호출하지 않음
  }, []);

  const debouncedHandleMapBoundsChange = useDebounce(handleMapBoundsChange, 300);

  // 초기 마운트 시 한 번만 검색 실행
  useEffect(() => {
    const filters = getSearchParams(useSearchStore.getState());
    loadRooms(filters, INITIAL_BOUNDS);
  }, []); // loadRooms는 useCallback으로 메모이제이션되어 있으므로 의존성에서 제외

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !containerRef.current) return;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const newLeftWidth = e.clientX - containerLeft;
      const min = 280;
      const max = 700;
      setLeftWidth(Math.min(Math.max(newLeftWidth, min), max));
    };

    const stopResizing = () => {
      isResizingRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, []);

  // 필터 상태를 개별적으로 가져와서 무한 루프 방지
  const keyword = useSearchStore(state => state.keyword);
  const theme_type = useSearchStore(state => state.theme_type);
  const room_cnt = useSearchStore(state => state.room_cnt);
  const property_type = useSearchStore(state => state.property_type);
  const animal = useSearchStore(state => state.animal);
  const subway = useSearchStore(state => state.subway);
  const longterm_discount = useSearchStore(state => state.longterm_discount);
  const early_discount = useSearchStore(state => state.early_discount);
  const parking_place = useSearchStore(state => state.parking_place);
  const min_using_fee = useSearchStore(state => state.min_using_fee);
  const max_using_fee = useSearchStore(state => state.max_using_fee);
  const updateFilter = useSearchStore(state => state.updateFilter);

  // 필터 또는 지도 경계가 변경될 때만 검색 실행 (초기 로드 제외)
  useEffect(() => {
    const filterParams = getSearchParams({
      keyword,
      theme_type,
      room_cnt,
      property_type,
      animal,
      subway,
      longterm_discount,
      early_discount,
      parking_place,
      min_using_fee,
      max_using_fee,
      sort: "popular",
      now_page: 1,
      itemcount: 1000,
      by_location: true,
      north_east_lat: 0,
      north_east_lng: 0,
      south_west_lat: 0,
      south_west_lng: 0,
      map_level: 4,
    });
    loadRooms(filterParams, mapBounds);
  }, [
    keyword,
    theme_type,
    room_cnt,
    property_type,
    animal,
    subway,
    longterm_discount,
    early_discount,
    parking_place,
    min_using_fee,
    max_using_fee,
    mapBounds,
    loadRooms
  ]);

  // 2. 명시적 검색 (검색 버튼 클릭시, 좌표/레벨 오버라이드)
  const manualSearch = useCallback(async () => {
    const currentFilters = getSearchParams(useSearchStore.getState());
    
    // 검색 시 좌표를 0으로 초기화 (전체 지역 검색)
    await loadRooms({ ...currentFilters }, {
      north_east_lng: 0,
      north_east_lat: 0,
      south_west_lng: 0,
      south_west_lat: 0,
      map_level: 4,
    });
    
    // 검색 후 키워드 초기화 (지도 드래그 시 키워드 검색이 계속되는 것을 방지)
    updateFilter('keyword', '');
    setSearchTriggered(true);
  }, [loadRooms, updateFilter]);

  // handleSearch는 manualSearch를 그대로 사용
  const handleSearch = manualSearch;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-2 pr-12 bg-white">
        <SearchBar onSearch={handleSearch} />
        <ActionButtons rooms={rooms} />
      </div>
      <div className="flex flex-1 min-h-0">
        <div
          className="bg-white border-r flex flex-col min-w-[320px] max-w-[600px] h-full z-20 overflow-y-auto"
          style={{ width: leftWidth }}
          ref={containerRef}
        >
          <RoomList
            rooms={rooms}
            selectedRooms={selectedRoomGroup}
            onClearSelection={() => setSelectedRoomGroup(null)}
          />
        </div>
        <div className="flex-1 h-full relative">
          <KakaoMapView
            rooms={rooms}
            onBoundsChanged={debouncedHandleMapBoundsChange}
            onMarkerClick={(roomGroup) => setSelectedRoomGroup(roomGroup)}
            searchTriggered={searchTriggered}
            setSearchTriggered={setSearchTriggered}
            selectedRoomGroup={selectedRoomGroup}
          />
        </div>
      </div>
    </div>
  );
}