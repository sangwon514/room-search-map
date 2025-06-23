// 카카오맵 타입 문제 현실적 해결: any 허용, 미사용 변수 제거, 문법 오류 수정

declare const kakao: any;

import { useEffect, useRef, useCallback } from "react";
import type { Room } from "@/types/Room";
import { loadKakaoMap } from "@/lib/loadKakaoMap";

interface Props {
  rooms: Room[];
  onBoundsChanged: (bounds: {
    north_east_lng: number;
    north_east_lat: number;
    south_west_lng: number;
    south_west_lat: number;
    map_level: number;
  }) => void;
  onMarkerClick?: (rooms: Room[]) => void;
  searchTriggered: boolean;
  setSearchTriggered: (v: boolean) => void;
  selectedRoomGroup?: Room[] | null; // 선택된 방 그룹 추가
}

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

function groupByCoordinate(rooms: Room[]): Record<string, Room[]> {
  const groups: Record<string, Room[]> = {};
  for (const room of rooms) {
    const key = coordKey(room.lat, room.lng);
    if (!groups[key]) groups[key] = [];
    groups[key].push(room);
  }
  return groups;
}

export default function KakaoMapView({ rooms, onBoundsChanged, onMarkerClick, searchTriggered, setSearchTriggered, selectedRoomGroup }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null); // any 허용
  const clustererInstance = useRef<any>(null); // any 허용
  const searchIdRef = useRef(0);
  const prevRoomsKeyRef = useRef('');
  const prevSelectedGroupRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);
  const markersRef = useRef<any[]>([]);

  // 마커 클릭 핸들러를 메모이제이션
  const handleMarkerClick = useCallback((group: Room[]) => {
    if (onMarkerClick) onMarkerClick(group);
  }, [onMarkerClick]);

  useEffect(() => {
    loadKakaoMap().then(() => {
      if (!window.kakao?.maps || !mapRef.current || mapInstance.current) return;
      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(37.5615, 126.9415), // 신촌 연세대학교 주변
        level: 3,
      });
      mapInstance.current = map;
      
      try {
        const clusterer = new kakao.maps.plugins.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 5,
        });
        clustererInstance.current = clusterer;
      } catch (error) {
        console.error("MarkerClusterer 초기화 오류:", error);
      }
      
      // 지도 초기 로드 시 한 번만 bounds 이벤트 발생하도록 타이머 설정
      let idleTimeout: number | null = null;
      
      const handleIdle = () => {
        // 이전 타이머가 있으면 취소
        if (idleTimeout) {
          window.clearTimeout(idleTimeout);
        }
        
        // 300ms 후에 실행하여 연속된 이벤트 방지
        idleTimeout = window.setTimeout(() => {
          const bounds = map.getBounds();
          const level = map.getLevel();
          onBoundsChanged({
            north_east_lng: bounds.getNorthEast().getLng(),
            north_east_lat: bounds.getNorthEast().getLat(),
            south_west_lng: bounds.getSouthWest().getLng(),
            south_west_lat: bounds.getSouthWest().getLat(),
            map_level: level,
          });
        }, 300);
      };
      
      // 초기 로드 시에는 이벤트 발생하지 않도록 약간 지연
      setTimeout(() => {
        kakao.maps.event.addListener(map, "idle", handleIdle);
      }, 500);
      
      return () => {
        // 마커 정리
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        
        if (clustererInstance.current) {
          clustererInstance.current.clear();
        }
        
        if (mapRef.current) mapRef.current.innerHTML = "";
        mapInstance.current = null;
        clustererInstance.current = null;
        
        if (window.kakao?.maps && map) {
          window.kakao.maps.event.removeListener(map, "idle", handleIdle);
        }
        
        if (idleTimeout) {
          window.clearTimeout(idleTimeout);
        }
      };
    });
  }, [onBoundsChanged]);

  // 마커 업데이트 함수
  const updateMarkers = useCallback(() => {
    if (!window.kakao?.maps || !mapInstance.current) return;
    
    // 현재 표시할 방 목록 결정 (선택된 그룹이 있으면 해당 그룹 사용, 아니면 전체 방 목록 사용)
    const displayRooms = rooms;
    
    // 선택된 그룹의 키 생성 (변경 감지용)
    const selectedGroupKey = selectedRoomGroup ? 
      selectedRoomGroup.map(r => r.rid).sort().join(',') : null;
    
    // 방 목록의 키 생성 (변경 감지용)
    const roomsKey = displayRooms.map(r => `${r.rid}-${r.lat}-${r.lng}`).join('|');
    
    // 이전과 동일한 방 목록이고 선택 상태도 동일하면 마커 업데이트 건너뛰기
    if (roomsKey === prevRoomsKeyRef.current && 
        selectedGroupKey === prevSelectedGroupRef.current && 
        roomsKey !== '') {
      return;
    }
    
    // 상태 업데이트
    prevRoomsKeyRef.current = roomsKey;
    prevSelectedGroupRef.current = selectedGroupKey;
    
    // 기존 마커 모두 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    if (clustererInstance.current) {
      clustererInstance.current.clear();
    }
    
    // 방이 없으면 처리하지 않음
    if (!displayRooms.length) return;
    
    console.log("마커 렌더링:", displayRooms.length, "개의 방");
    
    const bounds = new kakao.maps.LatLngBounds();
    const markers: any[] = [];
    const grouped = groupByCoordinate(displayRooms);
    
    // 선택된 그룹의 좌표 키 찾기
    let selectedCoordKey: string | null = null;
    if (selectedRoomGroup && selectedRoomGroup.length > 0) {
      const firstRoom = selectedRoomGroup[0];
      selectedCoordKey = coordKey(firstRoom.lat, firstRoom.lng);
    }
    
    Object.entries(grouped).forEach(([key, group]) => {
      const room = group[0];
      
      // 유효한 좌표인지 확인
      if (!room.lat || !room.lng) return;
      
      const position = new kakao.maps.LatLng(room.lat, room.lng);
      bounds.extend(position);
      const isGroup = group.length > 1;
      const isSelected = key === selectedCoordKey;
      
      const el = document.createElement("div");
      el.className = `
        text-sm font-medium px-3 py-1 rounded-full shadow border transition cursor-pointer
        ${isSelected 
          ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600' 
          : 'bg-white text-black border-gray-300 hover:bg-blue-50'}
      `;
      el.innerHTML = `
        <div class="flex flex-col items-center justify-center text-center">
          ${isGroup
            ? `<span class="${isSelected ? 'text-white font-bold' : 'text-blue-600 font-bold'}">${room.using_fee.toLocaleString()}원 외 ${group.length - 1}개</span>`
            : `<span>${room.room_name}</span>\n<span class="${isSelected ? 'text-white font-bold' : 'text-blue-600 font-bold'}">${room.using_fee.toLocaleString()}원</span>`}
        </div>
      `;
      
      const marker = new kakao.maps.CustomOverlay({
        position,
        content: el,
        yAnchor: 1.1,
      });
      
      markers.push(marker);
      marker.setMap(mapInstance.current);
      markersRef.current.push(marker);
      
      // 클릭 이벤트 추가
      el.onclick = (e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        handleMarkerClick(group);
      };
    });
    
    // 마커가 있을 경우에만 클러스터러에 추가
    if (markers.length > 0 && clustererInstance.current) {
      try {
        clustererInstance.current.addMarkers(markers);
      } catch (error) {
        console.error("클러스터러 마커 추가 오류:", error);
      }
      
      // 최초 로드 시에만 영역에 맞게 지도 이동 (이후에는 사용자가 수동으로 조정)
      if (initialLoadRef.current && markers.length > 0 && !bounds.isEmpty()) {
        mapInstance.current.setBounds(bounds);
        initialLoadRef.current = false;
      }
      
      // 선택된 그룹이 있으면 해당 위치로 지도 중심 이동
      if (selectedRoomGroup && selectedRoomGroup.length > 0 && selectedCoordKey) {
        const room = selectedRoomGroup[0];
        if (room.lat && room.lng) {
          const position = new kakao.maps.LatLng(room.lat, room.lng);
          mapInstance.current.setCenter(position);
          
          // 줌 레벨 조정 (더 가깝게 보기)
          const currentLevel = mapInstance.current.getLevel();
          if (currentLevel > 3) {
            mapInstance.current.setLevel(3);
          }
        }
      }
    }
  }, [rooms, handleMarkerClick, selectedRoomGroup]);

  // rooms 또는 selectedRoomGroup이 변경될 때마다 마커 업데이트
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers, rooms, selectedRoomGroup]);

  // 주소 검색 및 지도 중심 조정을 위한 효과
  useEffect(() => {
    // searchTriggered가 false면 실행하지 않음
    if (!searchTriggered) return;
    
    let cancelled = false;
    const searchId = Date.now(); // 현재 검색 식별자
    searchIdRef.current = searchId;
    
    async function run() {
      // 카카오맵이 로드되지 않았으면 중단
      if (!window.kakao?.maps?.services) {
        if (!cancelled) setSearchTriggered(false);
        return;
      }
      
      // 유효한 마커가 있거나 방이 없으면 중단
      const hasValidMarker = rooms.some(r => r.lat !== 0 && r.lng !== 0);
      if (hasValidMarker || rooms.length === 0) {
        if (!cancelled && searchIdRef.current === searchId) setSearchTriggered(false);
        return;
      }
      
      // 주소가 있는 첫 번째 방 찾기
      const target = rooms.find(r => r.addr_street || r.addr_lot);
      const address = target?.addr_street || target?.addr_lot;
      
      if (!address) {
        if (!cancelled && searchIdRef.current === searchId) setSearchTriggered(false);
        return;
      }
      
      const geocoder = new kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, (result: any, status: any) => {
        if (cancelled || searchIdRef.current !== searchId) return;
        
        if (status === kakao.maps.services.Status.OK && result?.[0]) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          
          // 유효한 좌표인 경우에만 지도 중심 이동
          if (!isNaN(lat) && !isNaN(lng)) {
            mapInstance.current?.setCenter(new kakao.maps.LatLng(lat, lng));
          }
        }
        
        // 검색 완료 후 트리거 해제 (한 번만 실행되도록)
        if (!cancelled && searchIdRef.current === searchId) {
          setSearchTriggered(false);
        }
      });
    }
    
    // 카카오맵이 로드되었는지 확인
    if (window.kakao?.maps?.services) {
      run();
    } else {
      const timer = setInterval(() => {
        if (window.kakao?.maps?.services) {
          clearInterval(timer);
          run();
        }
      }, 100);
      
      return () => {
        clearInterval(timer);
        cancelled = true;
      };
    }
    
    return () => {
      cancelled = true;
    };
  }, [searchTriggered, setSearchTriggered, rooms]);

  return <div ref={mapRef} className="w-full h-full" />;
}