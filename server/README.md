# Room Crawler Backend API

FastAPI 기반의 숙소 검색 및 예약률 관리 백엔드 서버입니다.

## 기능

- 숙소 검색 API
- 세션 기반 인증
- CORS 설정으로 React 프론트엔드 연동
- 자동 API 문서 생성 (Swagger UI)

## 설치 및 실행

### 1. 가상환경 생성 및 활성화

```bash
cd server
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정

`.env` 파일을 수정하여 필요한 설정을 변경하세요.

### 4. 서버 실행

```bash
# 개발 모드 (자동 리로드)
python main.py

# 또는 uvicorn 직접 실행
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API 엔드포인트

### 기본 정보
- **Base URL**: `http://localhost:8000`
- **API 문서**: `http://localhost:8000/docs` (Swagger UI)
- **ReDoc**: `http://localhost:8000/redoc`

### 주요 엔드포인트

#### 1. 헬스 체크
```
GET /health
```

#### 2. 숙소 검색
```
POST /api/rooms
Content-Type: application/json
Cookie: session=your_session_value

{
  "keyword": "신촌",
  "min_using_fee": 300000,
  "max_using_fee": 800000,
  "room_cnt": ["1", "2"],
  "now_page": 1,
  "itemcount": 20
}
```

#### 3. 세션 정보 조회
```
GET /api/session
Cookie: session=your_session_value
```

## 프론트엔드 연동

React 클라이언트에서 다음과 같이 API를 호출할 수 있습니다:

```typescript
// 숙소 검색
const response = await fetch('http://localhost:8000/api/rooms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // 쿠키 포함
  body: JSON.stringify(searchParams)
});
```

## 개발 가이드

### 새로운 API 추가

1. `main.py`에 새로운 엔드포인트 함수 추가
2. Pydantic 모델로 요청/응답 스키마 정의
3. 필요시 세션 인증 추가

### 데이터베이스 연동

현재는 더미 데이터를 사용하고 있습니다. 실제 데이터베이스 연동을 위해서는:

1. SQLAlchemy 또는 다른 ORM 추가
2. 데이터베이스 모델 정의
3. 마이그레이션 스크립트 작성

## 주의사항

- `.env` 파일은 Git에 커밋하지 마세요
- 프로덕션 환경에서는 SECRET_KEY를 안전하게 관리하세요
- CORS 설정을 프로덕션 도메인에 맞게 수정하세요
