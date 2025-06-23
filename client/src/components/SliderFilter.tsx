import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";

interface SliderFilterProps {
  minValue: number;
  maxValue: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
}

export default function SliderFilter({ minValue, maxValue, value, onChange }: SliderFilterProps) {
  // 로컬 상태 대신 ref 사용
  const valueRef = useRef<[number, number]>(value);
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const isDraggingRef = useRef(false);
  
  // 부모로부터 받은 value가 변경되고 드래그 중이 아닐 때만 로컬 상태 업데이트
  useEffect(() => {
    if (!isDraggingRef.current) {
      valueRef.current = value;
      setLocalValue(value);
    }
  }, [value]);

  // 슬라이더 값 변경 핸들러
  const handleValueChange = (newValue: number[]) => {
    if (!Array.isArray(newValue) || newValue.length !== 2) return;
    
    const newRange: [number, number] = [newValue[0], newValue[1]];
    valueRef.current = newRange;
    
    // 드래그 중일 때만 로컬 상태 업데이트
    if (isDraggingRef.current) {
      setLocalValue(newRange);
    }
  };

  // 드래그 시작 핸들러
  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  // 드래그 종료 핸들러
  const handleDragEnd = () => {
    isDraggingRef.current = false;
    
    // 값이 변경되었을 때만 부모에게 알림
    if (valueRef.current[0] !== value[0] || valueRef.current[1] !== value[1]) {
      onChange(valueRef.current);
    }
  };

  return (
    <div className="w-[300px] p-2">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-sm">1주 임대료</span>
        <span className="text-violet-600 font-medium text-sm">
          {localValue[0]}만 ~ {localValue[1] === 100 ? "100만+" : `${localValue[1]}만`}
        </span>
      </div>
      <Slider
        min={minValue}
        max={maxValue}
        step={1}
        value={localValue}
        onValueChange={handleValueChange}
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleDragEnd();
          }
        }}
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>0만</span>
        <span>100만+</span>
      </div>
    </div>
  );
}