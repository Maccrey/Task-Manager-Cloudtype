# 점자 도서 작업 관리 대시보드

이 프로젝트는 점자 도서 제작 진행 상황을 추적하고 관리하는 웹 애플리케이션입니다.

## 주요 기능

- **도서 검색:** 국립중앙도서관 API를 통해 ISBN 또는 책 제목으로 도서를 검색합니다.
- **신규 도서 등록:** 검색된 도서 정보 또는 수동으로 입력한 정보로 새로운 작업 항목을 등록합니다.
  - 점역자 입력 필드는 기본적으로 비활성화되어 있으며, 체크박스를 통해 활성화할 수 있습니다.
- **작업 단계 관리:** 1차 교정, 2차 교정, 3차 교정, 점역 등 작업 단계를 관리하고 담당자를 지정합니다.
- **진행 상황 업데이트:** 각 작업 단계별로 진행된 페이지와 작업 날짜/시간을 기록하고 진행률을 시각적으로 확인합니다.
- **실시간 동기화:** 여러 사용자가 동시에 작업할 때 실시간으로 변경사항이 반영됩니다.
- **작업 세션 관리:** 작업 시작/중지 버튼으로 작업 시간을 추적하고, 다른 사용자에게 실시간으로 표시됩니다.
- **작업 히스토리:** 각 도서별 전체 작업 히스토리를 확인합니다.
- **출퇴근 기록:** 작업자별 출퇴근 시간 및 작업 내역을 추적합니다.
- **데이터 저장:** 모든 작업 데이터는 Firebase Realtime Database에 실시간으로 저장되고 관리됩니다.

## 기술 스택

- **프론트엔드:** HTML, CSS, JavaScript (Vanilla JS - 프레임워크 없음)
- **데이터베이스:** Firebase Realtime Database (실시간 동기화)
- **아키텍처:** 완전한 프론트엔드 기반 (서버리스)

## 설치 및 실행 방법

### 1. Firebase 설정

Firebase Realtime Database를 사용하려면 Firebase 프로젝트가 필요합니다.

#### Firebase 프로젝트 생성:
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Realtime Database 생성 (테스트 모드로 시작)
3. 프로젝트 설정 > 일반에서 웹 앱 추가
4. Firebase SDK 구성 정보 복사

#### 프론트엔드 Firebase 설정:
`frontend/firebase-config.js` 파일에 Firebase 구성 정보를 입력합니다:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. 프론트엔드 실행

웹 브라우저에서 `frontend/index.html` 파일을 직접 열거나, 로컬 웹 서버를 사용합니다:

```bash
# Python 3를 사용한 간단한 웹 서버
cd frontend
python3 -m http.server 8000
```

그 다음 브라우저에서 `http://localhost:8000`을 엽니다.

### 3. 국립중앙도서관 API 키 설정 (선택사항)

도서 검색 기능을 사용하려면 국립중앙도서관에서 발급받은 API 키가 필요합니다.

1. `frontend/script.js` 파일을 엽니다.
2. `apiKey` 변수에 자신의 API 키를 입력합니다:

```javascript
const apiKey = "YOUR_API_KEY"; // 여기에 API 키를 입력하세요.
```

## Firebase 실시간 동기화

이 프로젝트는 Firebase Realtime Database를 **직접 사용**하여 다음과 같은 기능을 제공합니다:

- **완전한 실시간 동기화**: 모든 클라이언트가 Firebase에 직접 연결되어 즉시 변경사항을 받습니다.
- **서버리스 아키텍처**: 별도의 백엔드 서버 없이 Firebase만으로 작동합니다.
- **자동 업데이트**: 데이터 변경 시 Firebase 리스너가 모든 클라이언트를 자동으로 업데이트합니다.
- **오프라인 지원**: Firebase의 기본 오프라인 캐싱 기능을 활용합니다.

### 데이터 구조

Firebase에 저장되는 데이터 컬렉션:
- `books`: 도서 정보 및 작업 진행 상황
- `staff`: 작업자 정보
- `workSessions`: 현재 진행 중인 작업 세션 (실시간)
- `workSessionsHistory`: 완료된 작업 세션 히스토리
- `attendanceMemos`: 출퇴근 메모

## 프로젝트 구조

```
Task-Manager-Cloudtype/
├── frontend/
│   ├── index.html                       # 메인 대시보드
│   ├── attendance-calendar.html         # 출퇴근 달력
│   ├── script.js                        # 메인 로직
│   ├── style.css                        # 스타일시트
│   ├── firebase-config.js               # Firebase 클라이언트 설정
│   ├── firebase-adapter.js              # Firebase API 어댑터
│   └── firebase-service-account.json    # Firebase 인증 (Git 제외)
├── package.json                         # 프로젝트 메타데이터
├── .gitignore                           # Git 제외 파일 목록
├── CLAUDE.md                            # Claude Code 가이드
└── README.md                            # 이 파일
```

## 보안 주의사항

⚠️ **중요:** `frontend/firebase-service-account.json` 파일은 민감한 인증 정보를 포함하고 있습니다.

- 이 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.
- 절대 GitHub이나 공개 저장소에 업로드하지 마세요.
- 현재 프로젝트는 Firebase 웹 SDK만 사용하므로 이 파일이 필요하지 않지만, 향후 서버 사이드 기능을 위해 보관되어 있습니다.

## 특이사항

- **작업자 로그인**: 등록된 직원 이름으로만 로그인 가능합니다.
- **실시간 작업 상태**: 작업 시작/중지 시 모든 사용자 화면에 즉시 반영됩니다.
- **자동 데이터 복구**: 손상된 데이터 구조를 자동으로 감지하고 복구합니다.
- **출퇴근 기록**: 작업 세션 히스토리를 기반으로 자동 생성됩니다.

## 문제 해결

### Firebase 연결 오류
- Firebase 구성 정보가 올바른지 확인하세요.
- Firebase Console에서 Realtime Database가 활성화되어 있는지 확인하세요.
- 브라우저 콘솔에서 에러 메시지를 확인하세요.

### 데이터가 표시되지 않음
- Firebase Console에서 Database 규칙을 확인하세요.
- 테스트 모드에서는 모든 읽기/쓰기가 허용됩니다.

### 작업 중지 버튼이 작동하지 않음
- 해당 작업의 데이터 구조가 올바른지 확인하세요.
- 페이지를 새로고침하면 자동 복구가 시도됩니다.

## 라이선스

이 프로젝트는 점자 도서 제작 관리를 위한 내부 도구입니다.

## 버전 히스토리

- **v2.5**: Firebase 직접 연결로 완전한 실시간 동기화 구현
- **v2.0**: Firebase Realtime Database 도입
- **v1.0**: 초기 버전 (파일 기반 저장)
