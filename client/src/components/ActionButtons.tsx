import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Room } from "@/types/Room";

interface ActionButtonsProps {
  rooms: Room[];
}

export default function ActionButtons({ rooms }: ActionButtonsProps) {
  // 현재 날짜 기준으로 초기 기간 설정
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  // 날짜 상태
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1); // 현재 달의 1일
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1); // 다음 달의 1일로 초기화
  });

  // 현재 날짜 기준으로 최대 선택 가능한 날짜 (현재 달)
  const maxDate = new Date();
  maxDate.setDate(1); // 현재 달의 1일

  // 시작 날짜 변경 핸들러
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      // 종료 날짜가 시작 날짜보다 이전이면 시작 날짜와 같게 설정
      if (endDate < date) {
        setEndDate(date);
      }
    }
  };

  // 종료 날짜 변경 핸들러
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      // 종료 날짜가 시작 날짜보다 이전일 수 없음
      if (date >= startDate) {
        setEndDate(date);
      }
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'none' | 'active' | 'checking'>('checking');

  // 세션 초기화 함수
  const clearSession = useCallback(() => {
    document.cookie = 'session=; path=/; max-age=0'; // 쿠키 삭제
    setSessionStatus('none');
  }, []);

  // 백엔드에서 세션 유효성 검증
  const validateSessionWithBackend = useCallback(async (sessionValue: string) => {
    if (!sessionValue || sessionValue.trim() === '') {
      setSessionStatus('none');
      return false;
    }

    setSessionStatus('checking');
    
    try {
      const response = await fetch('/api/validate_session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.valid) {
        setSessionStatus('active');
        return true;
      } else {
        setSessionStatus('none');
        console.log(`세션 검증 실패: ${result.message}`);
        return false;
      }
    } catch (error) {
      console.error('세션 검증 오류:', error);
      setSessionStatus('none');
      return false;
    }
  }, []);

  // 기존 세션 값 가져오기 함수
  const getCurrentSession = useCallback(() => {
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session='));
    
    return sessionCookie ? sessionCookie.split('=')[1] : '';
  }, []);

  // 세션 상태 확인 및 검증 함수
  const checkAndValidateSession = useCallback(async () => {
    const sessionValue = getCurrentSession();
    
    if (sessionValue && sessionValue.trim() !== '') {
      // 세션 값이 있으면 백엔드로 검증
      await validateSessionWithBackend(sessionValue);
    } else {
      setSessionStatus('none');
    }
  }, [getCurrentSession, validateSessionWithBackend]);

  // 컴포넌트 마운트 시 세션 상태 확인 및 검증
  useEffect(() => {
    checkAndValidateSession();
  }, [checkAndValidateSession]);

  // 쿠키 세션 설정 함수
  const handleCookieSession = useCallback(async () => {
    const currentSession = getCurrentSession();
    const sessionValue = prompt("세션 값을 입력하세요:", currentSession);
    if (sessionValue !== null) { // null이 아니면 (취소하지 않았으면) 저장
      // 쿠키에 저장 (빈 값도 허용)
      document.cookie = `session=${sessionValue}; path=/; max-age=86400`; // 24시간
      
      // 백엔드에서 세션 유효성 검증
      const isValid = await validateSessionWithBackend(sessionValue);
      
      if (isValid) {
        alert(`세션이 설정되고 검증되었습니다! (값: ${sessionValue})`);
      } else if (sessionValue.trim() === '') {
        alert("빈 세션이 설정되었습니다. (테스트용)");
        setSessionStatus('none');
      } else {
        // 유효하지 않은 세션이면 삭제
        clearSession();
      }
    }
  }, [getCurrentSession, validateSessionWithBackend, clearSession]);

  // 예약률 다운로드 함수
  const handleDownloadReservation = useCallback(async () => {
    // 세션 설정 확인
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session='));
    
    if (!sessionCookie) {
      alert("세션이 설정되지 않았습니다. 먼저 세션을 설정해주세요.");
      return;
    }

    // 세션 값이 빈 문자열인지 확인
    const sessionValue = sessionCookie.split('=')[1];
    if (!sessionValue || sessionValue.trim() === '') {
      alert("세션 값이 비어있습니다. 유효한 세션을 설정해주세요.");
      return;
    }

    if (rooms.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    const fromYear = startDate.getFullYear();
    const fromMonth = startDate.getMonth() + 1; // 0-based이므로 +1
    const toYear = endDate.getFullYear();
    const toMonth = endDate.getMonth() + 1; // 0-based이므로 +1

    // 시작월이 종료월보다 미래인지 검사
    const startDateValue = fromYear * 12 + fromMonth;
    const endDateValue = toYear * 12 + toMonth;
    
    if (startDateValue > endDateValue) {
      alert("시작 기간이 종료 기간보다 늦을 수 없습니다.");
      return;
    }

    setIsLoading(true);
    
    try {
      // 방 ID 목록 추출
      const ridList = rooms.map(room => room.rid).filter(rid => rid !== undefined);
      
      if (ridList.length === 0) {
        alert("유효한 방 ID가 없습니다.");
        return;
      }

      // 바로 엑셀 다운로드 API 호출
      const response = await fetch('/api/download_excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          room_list: rooms.map(room => ({
            rid: room.rid,
            rname: room.room_name
          })),
          start_year: fromYear,
          start_month: fromMonth,
          end_year: toYear,
          end_month: toMonth,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      // 파일 다운로드 처리
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Content-Disposition 헤더에서 파일명 추출
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = '월별예약률.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`월별 예약률 엑셀 파일이 다운로드되었습니다!\n조회 기간: ${fromYear}년 ${fromMonth}월 ~ ${toYear}년 ${toMonth}월`);
      
    } catch (error) {
      console.error('예약률 엑셀 다운로드 실패:', error);
      
      // 세션 관련 오류인지 확인 (401, 403 등)
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403') || error.message.includes('세션'))) {
        alert('세션이 만료되었거나 유효하지 않습니다. 세션을 다시 설정해주세요.');
        clearSession();
      } else {
        alert(`예약률 엑셀 다운로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [rooms, startDate, endDate, clearSession]);

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-4">
        {/* 세션 상태 신호등 */}
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              sessionStatus === 'active' ? 'bg-green-500' : sessionStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            title={sessionStatus === 'active' ? '세션 활성화됨' : sessionStatus === 'checking' ? '세션 확인 중...' : '세션 설정 필요'}
          />
          <span className="text-sm text-gray-600">
            {sessionStatus === 'active' ? '세션 활성' : sessionStatus === 'checking' ? '세션 확인 중...' : '세션 없음'}
          </span>
        </div>
        
        <Button 
          onClick={handleCookieSession}
          variant="outline"
          className={`${sessionStatus === 'active' ? 'bg-green-50 hover:bg-green-100' : sessionStatus === 'checking' ? 'bg-yellow-50 hover:bg-yellow-100' : 'bg-red-50 hover:bg-red-100'}`}
        >
          세션 설정
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          onClick={handleDownloadReservation}
          variant="outline"
          size="sm"
          className="whitespace-nowrap"
          disabled={isLoading || sessionStatus !== 'active'}
        >
          {isLoading ? '처리 중...' : '예약률 다운로드'}
        </Button>
        
        <div className="flex items-center gap-1 text-sm ml-4">
          <span className="text-gray-600">기간:</span>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            dateFormat="yyyy년 MM월"
            showMonthYearPicker
            className="w-24 px-2 py-1 text-xs border border-gray-300 rounded text-center"
            placeholderText="시작"
            popperClassName="z-[9999]"
            popperPlacement="bottom"
            maxDate={maxDate}
            disabled={isLoading}
          />
          <span className="text-gray-400">~</span>
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            dateFormat="yyyy년 MM월"
            showMonthYearPicker
            className="w-24 px-2 py-1 text-xs border border-gray-300 rounded text-center"
            placeholderText="종료"
            popperClassName="z-[9999]"
            popperPlacement="bottom"
            minDate={startDate}
            disabled={isLoading}
          />
        </div>
      </div>
      
      {isLoading && (
        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
          📊 예약률 데이터를 조회하고 있습니다... 잠시만 기다려주세요.
        </div>
      )}
    </div>
  );
}
