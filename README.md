# 🏨 Room Search Map 프로젝트

React + FastAPI 기반의 숙소 검색 및 예약률 관리 시스템입니다.

## 📋 프로젝트 개요

이 프로젝트는 숙소 검색 및 지도 표시 기능과 예약률 관리 시스템을 제공합니다. React와 TypeScript로 구현된 프론트엔드와 FastAPI로 구현된 백엔드로 구성되어 있습니다.

## 🔧 개발 환경 설정

### Mac에서 개발 환경 설정

#### 1. Homebrew 설치
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

설치 후 터미널에 표시되는 지시에 따라 PATH에 Homebrew를 추가하세요.

#### 2. Node.js 설치
```bash
brew install node
```

설치 확인:
```bash
node --version
npm --version
```

#### 3. Python 설치
```bash
brew install python
```

설치 확인:
```bash
python3 --version
```

### 환경 변수 설정

#### 클라이언트 환경 변수 (.env)
클라이언트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가해야 합니다:

```bash
# client/.env
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
```

카카오맵 API 키는 [Kakao Developers](https://developers.kakao.com/)에서 발급받을 수 있습니다.

#### 서버 환경 변수 (.env)
서버 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
DEBUG=True
API_HOST=0.0.0.0
API_PORT=8000
```

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

서버 재시작이 필요한 경우:
```bash
chmod +x restart.sh
./restart.sh
```

서버 중지:
```bash
chmod +x stop.sh
./stop.sh
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
│   ├── public/             # 정적 파일
│   ├── package.json        # 프론트엔드 의존성
│   └── vite.config.ts      # Vite 설정
├── server/                 # FastAPI 백엔드
│   ├── main.py             # FastAPI 메인 애플리케이션
│   ├── models.py           # 데이터 모델
│   ├── routers/            # API 라우터
│   ├── services/           # 비즈니스 로직
│   ├── utils/              # 유틸리티 함수
│   └── requirements.txt    # Python 의존성
├── start.sh               # 자동 실행 스크립트 (Unix)
├── restart.sh             # 서버 재시작 스크립트
├── stop.sh                # 서버 중지 스크립트
├── start.bat              # 자동 실행 스크립트 (Windows)
└── README.md              # 프로젝트 문서
```

## 🔧 주요 기능

### 프론트엔드 (React + TypeScript)
- 🗺️ **지도 연동** - Leaflet을 사용한 숙소 위치 시각화
- 🔍 **고급 검색 필터** - 다양한 조건으로 숙소 검색
- 📊 **예약률 데이터 관리** - 예약 데이터 시각화 및 내보내기
- 📅 **날짜 선택 UI** - react-datepicker 사용
- 🎨 **모던 UI/UX** - Tailwind CSS와 Radix UI 컴포넌트 사용
- 🔄 **상태 관리** - Zustand를 사용한 효율적인 상태 관리

### 백엔드 (FastAPI + Python)
- 🚀 **고성능 API** - FastAPI 기반 비동기 처리
- 📖 **자동 API 문서** - Swagger UI 및 ReDoc
- 🔒 **CORS 설정** - 프론트엔드 연동
- 📊 **데이터 검증** - Pydantic 모델 사용
- 📑 **엑셀 데이터 처리** - openpyxl을 사용한 데이터 처리

## 🛠️ 개발 가이드

### 환경 변수 설정

`server/.env` 파일에서 다음 설정을 변경할 수 있습니다:

```env
DEBUG=True
API_HOST=0.0.0.0
API_PORT=8000
```

### API 엔드포인트

- `GET /` - API 상태 확인
- `GET /health` - 헬스 체크
- `GET /api/*` - 숙소 및 예약 관련 API

### 프론트엔드 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 정적 타입 지원
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Zustand** - 상태 관리 라이브러리
- **Axios** - HTTP 클라이언트
- **Leaflet** - 오픈소스 지도 라이브러리

### 백엔드 기술 스택

- **FastAPI** - 고성능 Python 웹 프레임워크
- **Uvicorn** - ASGI 서버
- **Pydantic** - 데이터 검증
- **Python-dotenv** - 환경 변수 관리
- **OpenPyXL** - Excel 파일 처리

## 📝 추가 정보

- **프론트엔드 상세**: `client/README.md` 참조
- **백엔드 상세**: `server/README.md` 참조
- **API 문서**: http://localhost:8000/docs

## 🤝 기여하기

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다
3. 변경사항을 커밋합니다
4. 브랜치에 푸시합니다
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.
