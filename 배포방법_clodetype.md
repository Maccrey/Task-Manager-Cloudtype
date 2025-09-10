Cloudtype 배포 가이드 (초보자용)

1. 사전 준비사항

GitHub 저장소 생성

1. https://github.com에 로그인
2. 새 저장소(Repository) 생성
3. 현재 프로젝트 코드를 GitHub에 업로드

cd /Users/maccrey/Development/Task-Manager
git init
git add .
git commit -m "Initial commit for Cloudtype deployment"
git remote add origin [YOUR_GITHUB_REPO_URL]
git push -u origin main

2. Cloudtype 회원가입 및 로그인

1. https://cloudtype.io 접속
1. GitHub 계정으로 회원가입/로그인
1. GitHub 저장소 연동 권한 부여

1. 프로젝트 배포 설정

Step 1: 새 프로젝트 생성

1. Cloudtype 대시보드에서 "새 프로젝트 생성" 클릭
2. GitHub 저장소에서 Task-Manager 프로젝트 선택

Step 2: 배포 환경 설정

- 런타임: Node.js 18.x
- 빌드 명령어: npm install
- 시작 명령어: npm run backend (또는 cd backend && npm start)
- 포트: 3000

Step 3: 환경 변수 설정 (필요시)

현재 프로젝트에는 특별한 환경 변수가 필요 없지만, 필요하다면 여기서 설정

4. 배포 전 코드 수정사항

포트 설정 수정

backend/server.js에서 포트 설정을 환경 변수로 변경해야 합니다:

const PORT = process.env.PORT || 3000;

프론트엔드 API URL 수정

frontend/script.js에서 하드코딩된 IP 주소를 배포된 도메인으로 변경:

// 현재: const apiUrl = 'http://172.30.1.52:3000';
// 변경: const apiUrl = window.location.origin;

5. 배포 실행

1. "배포" 버튼 클릭
1. 배포 로그 확인
1. 성공 시 제공되는 URL로 접속 테스트

1. 배포 후 확인사항

- 웹 애플리케이션 정상 작동 확인
- API 연결 상태 확인
- 데이터 저장/불러오기 테스트

7. 문제 해결

- 배포 실패 시: Cloudtype Discord 채널 이용
- 로그 확인: Cloudtype 대시보드의 로그 탭
- 도메인 문제: DNS 설정 확인

주의사항

- 현재 파일 기반 데이터 저장 방식은 서버 재시작 시 데이터 유실 가능
- 프로덕션 환경에서는 데이터베이스 사용 권장
- 백업 파일(bookworklist.json) 정기적 다운로드 필요

이 가이드를 따라하면 초보자도 쉽게 Cloudtype에 배포할 수 있습니다!
