import { useRef, useEffect, useCallback } from 'react';

/**
 * 디바운스 유틸리티 함수
 * @param func 실행할 함수
 * @param delay 지연 시간(ms)
 * @returns 디바운스가 적용된 함수
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  delay: number
) => {
  let timer: NodeJS.Timeout | null = null;
  
  return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * 리액트 컴포넌트에서 사용하기 위한 useDebounce 훅
 * @param callback 디바운스를 적용할 콜백 함수
 * @param delay 지연 시간(ms)
 * @returns 디바운스가 적용된 콜백 함수
 */
export const useDebounce = <F extends (...args: any[]) => any>(
  callback: F,
  delay: number
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 컴포넌트 언마운트 시 타이머 클린업
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<F>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};
