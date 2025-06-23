# Room Search Map Project

React + FastAPI 기반의 숙소 검색 및 예약률 관리 시스템입니다.

## 🚀 빠른 시작

### 자동 실행 스크립트 (권장)

프로젝트 루트에서 다음 명령어를 실행하면 모든 의존성을 자동으로 설치하고 서버를 시작합니다:

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

### 수동 실행

#### 1. 백엔드 서버 (FastAPI)
```bash
cd server
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### 2. 프론트엔드 서버 (React)
```bash
cd client
npm install
npm run dev
```

## 📋 시스템 요구사항

- **Node.js** 16.0 이상
- **Python** 3.8 이상
- **npm** 또는 **yarn**

## 🌐 서버 주소

- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 프로젝트 구조

```
Room Search Map/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── stores/         # Zustand 상태 관리
│   │   └── types/          # TypeScript 타입 정의
│   ├── package.json
│   └── vite.config.ts
├── server/                 # FastAPI 백엔드
│   ├── main.py            # FastAPI 메인 애플리케이션
│   ├── requirements.txt   # Python 의존성
│   ├── .env              # 환경 변수
│   └── venv/             # Python 가상환경
├── start.sh              # 자동 실행 스크립트 (Unix)
├── start.bat             # 자동 실행 스크립트 (Windows)
└── README.md
```

## 🔧 주요 기능

### 프론트엔드 (React + TypeScript)
- 🗺️ **카카오맵 연동** - 숙소 위치 시각화
- 🔍 **고급 검색 필터** - 다양한 조건으로 숙소 검색
- 📊 **예약률 다운로드** - CSV 형태로 데이터 내보내기
- 📅 **기간 선택 UI** - react-datepicker 사용
- 🔐 **세션 관리** - 쿠키 기반 세션 설정
- 🎨 **반응형 디자인** - Tailwind CSS 사용

### 백엔드 (FastAPI + Python)
- 🚀 **고성능 API** - FastAPI 기반 비동기 처리
- 📖 **자동 API 문서** - Swagger UI 및 ReDoc
- 🔒 **세션 인증** - 쿠키 기반 인증 시스템
- 🌐 **CORS 설정** - 프론트엔드 연동
- 📊 **데이터 검증** - Pydantic 모델 사용

## 🛠️ 개발 가이드

### 환경 변수 설정

`server/.env` 파일에서 다음 설정을 변경할 수 있습니다:

```env
DEBUG=True
API_HOST=0.0.0.0
API_PORT=8000
SESSION_SECRET_KEY=your-secret-key-here
SESSION_EXPIRE_HOURS=24
```

### API 엔드포인트

- `GET /health` - 헬스 체크
- `POST /api/rooms` - 숙소 검색 (세션 필요)
- `GET /api/session` - 세션 정보 조회

### 프론트엔드 컴포넌트

- `MainLayout` - 메인 레이아웃
- `SearchBar` - 검색 필터 UI
- `ActionButtons` - 세션 설정 및 다운로드 버튼
- `KakaoMapView` - 카카오맵 컴포넌트

## 🔄 개발 워크플로우

1. **기능 개발**: 각각의 프론트엔드/백엔드에서 개발
2. **테스트**: API 문서에서 백엔드 테스트
3. **통합**: 프론트엔드에서 API 연동 테스트
4. **빌드**: 프로덕션 빌드 및 배포

## 📝 추가 정보

- **프론트엔드 상세**: `client/README.md` 참조
- **백엔드 상세**: `server/README.md` 참조
- **API 문서**: http://localhost:8000/docs

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.
