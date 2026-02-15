# Starter Project

재사용 가능한 풀스택 스타터 프로젝트 - 로그인 + Task CRUD + 기본 UI 컴포넌트

## 기술 스택

### Backend
- **Framework**: Spring Boot 3.2.2
- **Language**: Java 21
- **Build Tool**: Gradle
- **Database**: PostgreSQL 15
- **Migration**: Flyway
- **Authentication**: JWT (Access Token + Refresh Token)

### Frontend
- **Framework**: Next.js 14.1
- **Language**: TypeScript
- **UI Components**: shadcn/ui (Radix UI)
- **Form**: React Hook Form + Zod
- **State**: Zustand
- **HTTP Client**: Axios
- **Table**: TanStack Table

### Infrastructure
- Docker & Docker Compose

---

## 프로젝트 구조

```
starter-project/
├── backend/
│   ├── Dockerfile
│   └── src/main/java/com/starter/
│       ├── config/          # Security 설정
│       ├── controller/      # REST API 컨트롤러
│       ├── dto/             # 요청/응답 DTO
│       ├── entity/          # JPA 엔티티
│       ├── exception/       # 예외 처리
│       ├── repository/      # JPA Repository
│       ├── security/        # JWT, 인증 필터
│       └── service/         # 비즈니스 로직
├── frontend/
│   ├── Dockerfile
│   └── src/
│       ├── app/
│       │   ├── login/           # 로그인 페이지
│       │   ├── tasks/           # Task CRUD 페이지
│       │   └── ui-components/   # UI 컴포넌트 가이드
│       ├── components/
│       │   ├── ui/              # 기본 UI 컴포넌트 (12개)
│       │   ├── DataTable.tsx    # 테이블 컴포넌트
│       │   ├── FormField.tsx    # 폼 필드 컴포넌트
│       │   └── ConfirmDialog.tsx # 확인 다이얼로그
│       ├── lib/             # 유틸리티, API, 상태관리
│       └── types/           # TypeScript 타입
├── docker-compose.yml
└── README.md
```

---

## 실행 방법

### 1. Docker Compose로 전체 실행 (권장)

```bash
# 프로젝트 루트에서 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

### 2. 로컬 개발 환경

#### PostgreSQL 실행

```bash
# Docker로 PostgreSQL만 실행
docker-compose up -d postgres
```

#### Backend 실행

```bash
cd backend

# Gradle Wrapper 권한 부여 (최초 1회)
chmod +x gradlew

# 실행
./gradlew bootRun
```

#### Frontend 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

---

## 초기 계정 생성

애플리케이션 실행 후 회원가입 페이지에서 직접 생성하거나, API로 생성:

### 회원가입 API

```bash
# 일반 사용자 생성
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "홍길동"
  }'

# 응답 예시
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "role": "USER"
  }
}
```

### 테스트 계정 예시

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| admin@example.com | admin123 | ADMIN |
| user@example.com | user1234 | USER |

---

## API 엔드포인트

### 인증 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| POST | `/api/auth/logout` | 로그아웃 |

### Task API (인증 필요)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/tasks` | 태스크 생성 |
| GET | `/api/tasks` | 태스크 목록 (페이지네이션) |
| GET | `/api/tasks/{id}` | 태스크 상세 |
| PUT | `/api/tasks/{id}` | 태스크 수정 |
| DELETE | `/api/tasks/{id}` | 태스크 삭제 |

### User API (인증 필요)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/users/me` | 내 정보 조회 |
| PUT | `/api/users/me` | 내 정보 수정 (이름/비밀번호) |

---

## 테스트 실행

### Backend 통합 테스트

```bash
cd backend
./gradlew test
```

### Frontend 컴포넌트 테스트

```bash
cd frontend
npm test
```

---

## UI 페이지

| 경로 | 설명 |
|------|------|
| `/login` | 로그인/회원가입 |
| `/profile` | 내 정보 (이름/비밀번호 변경) |
| `/tasks` | 태스크 목록 (검색/페이지네이션) |
| `/tasks/new` | 새 태스크 생성 |
| `/tasks/[id]/edit` | 태스크 수정 |
| `/ui-components` | UI 컴포넌트 가이드/예제 |

---

## 공통 컴포넌트

### 레이아웃 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|----------|------|------|
| DataTable | `components/DataTable.tsx` | 테이블 + 검색 + 페이지네이션 |
| FormField | `components/FormField.tsx` | React Hook Form 연동 폼 필드 |
| ConfirmDialog | `components/ConfirmDialog.tsx` | 확인 다이얼로그 |

### UI 기본 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|----------|------|------|
| Button | `components/ui/button.tsx` | 버튼 (variant, size) |
| Input | `components/ui/input.tsx` | 텍스트 입력 |
| Textarea | `components/ui/textarea.tsx` | 여러 줄 입력 |
| Select | `components/ui/select.tsx` | 드롭다운 선택 |
| Checkbox | `components/ui/checkbox.tsx` | 체크박스 |
| Radio Group | `components/ui/radio-group.tsx` | 라디오 버튼 그룹 |
| Switch | `components/ui/switch.tsx` | 토글 스위치 |
| Label | `components/ui/label.tsx` | 라벨 |
| Card | `components/ui/card.tsx` | 카드 컨테이너 |
| Badge | `components/ui/badge.tsx` | 상태 배지 |
| Tabs | `components/ui/tabs.tsx` | 탭 네비게이션 |
| Alert | `components/ui/alert.tsx` | 알림 메시지 |

---

## 환경 변수

### Backend

| 변수 | 기본값 | 설명 |
|------|--------|------|
| DB_HOST | localhost | PostgreSQL 호스트 |
| DB_PORT | 5432 | PostgreSQL 포트 |
| DB_NAME | starterdb | 데이터베이스명 |
| DB_USERNAME | postgres | DB 사용자명 |
| DB_PASSWORD | postgres | DB 비밀번호 |
| JWT_SECRET | (내장값) | JWT 서명 키 (256bit 이상) |

### Frontend

| 변수 | 기본값 | 설명 |
|------|--------|------|
| NEXT_PUBLIC_API_URL | http://localhost:8080 | Backend API URL |

---

## 종료

```bash
# Docker Compose 종료
docker-compose down

# 볼륨까지 삭제 (DB 데이터 포함)
docker-compose down -v
```

---

## 페이지 레이아웃 가이드

새 페이지 생성 시 아래 표준 레이아웃을 사용하세요.

### 일반 페이지 (목록, 상세, 설정 등)

```tsx
return (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow">
        {/* 헤더 영역 */}
        <div className="p-6 border-b">
          <div>
            <h1 className="text-lg font-semibold">페이지 제목</h1>
            <p className="text-sm text-muted-foreground">페이지 설명</p>
          </div>
        </div>
        {/* 본문 영역 */}
        <div className="p-6">
          {/* 내용 */}
        </div>
      </div>
    </div>
  </div>
)
```

### 로딩 화면

```tsx
if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
```

### 센터 정렬 페이지 (로그인, 에러 등)

```tsx
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <Card className="w-full max-w-md">
      {/* 내용 */}
    </Card>
  </div>
)
```

