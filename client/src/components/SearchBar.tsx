import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import SliderFilter from "./SliderFilter";
import { useSearchStore } from "@/store/useSearchStore";
import type { SearchFilter } from "@/types/search";

// 상수 정의
const THEME_TYPES = [
  { label: "인기호스트 방", value: "super_host" },
  { label: "추천방", value: "33m2_md" }
] as const;

const ROOM_COUNTS = [
  { label: "1개", value: "one" },
  { label: "2개", value: "two" },
  { label: "3개 이상", value: "three_plus" }
] as const;

const PROPERTY_TYPES = ["오피스텔", "아파트", "고시원", "호텔"] as const;

interface SearchBarProps {
  onSearch: () => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [localKeyword, setLocalKeyword] = useState("");
  const { keyword } = useSearchStore();
  
  // Sync local keyword with store keyword on mount and when keyword changes
  useEffect(() => {
    setLocalKeyword(keyword || "");
  }, [keyword]);
  const {
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
    updateFilter,
    updateFilters,
  } = useSearchStore();
  
  // 가격 범위 변경 핸들러 (드래그가 끝났을 때만 호출됨)
  const handlePriceChange = (range: [number, number]) => {
    updateFilters({
      min_using_fee: range[0] * 10000,
      max_using_fee: range[1] * 10000
    });
  };
  const handleMultiToggle = (key: keyof SearchFilter, value: string) => {
    const current = useSearchStore.getState()[key];
    const arr = Array.isArray(current) ? current : [];
    const updated = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    updateFilter(key, updated);
  };

  const handleCheckToggle = (key: keyof SearchFilter, value: boolean) => {
    updateFilter(key, value);
  };

  const handleSearch = () => {
    const trimmedKeyword = localKeyword.trim();
    
    // 현재 스토어의 모든 필터 조건을 유지한 채로 검색 실행
    updateFilters({
      keyword: trimmedKeyword, // 검색어 업데이트 (빈 문자열도 허용)
      now_page: 1, // 첫 페이지로 리셋
      // 맵 경계 초기화 (전체 검색을 위해)
      south_west_lat: 0,
      south_west_lng: 0,
      north_east_lat: 0,
      north_east_lng: 0,
    });
    
    // 부모 컴포넌트의 검색 핸들러 호출 (검색어가 없어도 호출)
    onSearch();
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white items-center">
      <input
        type="text"
        name="keyword"
        value={localKeyword}
        onChange={(e) => setLocalKeyword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        placeholder="주소, 지역, 이름 등 키워드"
        className="px-3 py-2 border rounded w-60"
      />

      <Button
        onClick={handleSearch}
        className="bg-black text-white hover:bg-gray-800"
      >
        검색
      </Button>

      {/* 추천 카테고리 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {THEME_TYPES.find(t => t.value === theme_type)?.label || "추천 카테고리"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {THEME_TYPES.map(({ label, value }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => updateFilter('theme_type', theme_type === value ? "" : value)}
              className={theme_type === value ? "bg-muted font-semibold cursor-pointer" : "cursor-pointer"}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 할인 필터 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {[longterm_discount && "장기계약 할인", early_discount && "빠른입주 할인"]
              .filter(Boolean)
              .join(", ") || "할인"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={longterm_discount}
              onCheckedChange={(val) => handleCheckToggle("longterm_discount" as keyof SearchFilter, val === true)}
            />
            <Label>장기계약 할인</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={early_discount}
              onCheckedChange={(val) => handleCheckToggle("early_discount" as keyof SearchFilter, val === true)}
            />
            <Label>빠른입주 할인</Label>
          </div>
        </PopoverContent>
      </Popover>

      {/* 방 개수 필터 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {ROOM_COUNTS
              .filter(({ value }) => room_cnt.includes(value))
              .map(({ label }) => label)
              .join(", ") || "방 개수"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 space-y-2">
          {ROOM_COUNTS.map(({ label, value }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                checked={room_cnt.includes(value)}
                onCheckedChange={() => handleMultiToggle("room_cnt", value)}
              />
              <Label>{label}</Label>
            </div>
          ))}
        </PopoverContent>
      </Popover>

      {/* 임대료 슬라이더 */}
      <SliderFilter 
        minValue={0} 
        maxValue={100} 
        value={[min_using_fee / 10000, max_using_fee / 10000]}
        onChange={handlePriceChange} 
      />

      {/* 건물 유형 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {property_type.length > 0
              ? property_type.join(", ")
              : "건물유형"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 space-y-2">
          {PROPERTY_TYPES.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                checked={property_type.includes(type)}
                onCheckedChange={() => handleMultiToggle("property_type", type)}
              />
              <Label>{type}</Label>
            </div>
          ))}
        </PopoverContent>
      </Popover>

      {/* 기타 옵션 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {[animal && "애완동물", subway && "역세권", parking_place && "주차가능"]
              .filter(Boolean)
              .join(", ") || "기타 옵션"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 space-y-2">
          {["animal", "subway", "parking_place"].map((key) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                checked={key === 'animal' ? animal : key === 'subway' ? subway : parking_place}
                onCheckedChange={(val) => handleCheckToggle(key as keyof SearchFilter, val === true)}
              />
              <Label>
                {key === "animal"
                  ? "애완동물"
                  : key === "subway"
                  ? "역세권"
                  : "주차가능"}
              </Label>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
