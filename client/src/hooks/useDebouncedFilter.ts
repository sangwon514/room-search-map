import { useEffect, useRef } from 'react';
import { useSearchStore, getSearchParams } from '@/store/useSearchStore';
import type { SearchFilter } from "@/types/search";

export function useDebouncedFilter(
  onDebouncedChange: (filters: Partial<SearchFilter>) => void,
  delay = 300
) {
  const prevFilter = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleChange = () => {
      const filters = getSearchParams(useSearchStore.getState());
      const serialized = JSON.stringify(filters);
      if (serialized !== prevFilter.current) {
        prevFilter.current = serialized;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          onDebouncedChange(filters);
        }, delay);
      }
    };
    const unsubscribe = useSearchStore.subscribe(handleChange);
    // 최초 1회 호출
    handleChange();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      unsubscribe();
    };
  }, [onDebouncedChange, delay]);
}
