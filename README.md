# QR 체크인 및 팀 배정 앱

QR 출입 체크인 + 자동 팀배정(JDX) 웹앱 MVP

## 기능

✅ **QR 초대장 생성**: 이벤트 생성 시 자동 QR 코드 생성  
✅ **실시간 체크인**: QR 스캔 또는 수동 입력으로 참가자 등록  
✅ **실시간 대시보드**: 참가자 현황 실시간 반영  
✅ **JDX 자동 팀배정**: 균형/랜덤/혼합 배정 알고리즘  
✅ **팀별 UI 화면**: 배정 결과 실시간 표시  
✅ **PWA 지원**: 오프라인에서도 동작하는 모바일 앱  
✅ **관리자 모드**: 토큰 기반 관리자 권한  
✅ **실시간 동기화**: Firestore를 통한 실시간 데이터 공유  

## 기술스택

- **Frontend**: Vite + React + TypeScript
- **UI**: TailwindCSS + shadcn/ui + lucide-react
- **Animation**: Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage)
- **QR**: qrcode + qr-scanner
- **Deploy**: Vercel
- **PWA**: vite-plugin-pwa

## 설치 및 실행

1. 의존성 설치:
   ```bash
   npm install
   ```

2. 환경 변수 설정:
   ```bash
   # .env 파일 생성 후 Firebase 설정 추가
   cp .env.example .env
   # .env 파일에 실제 Firebase 키 값들 입력
   ```

3. Firebase 설정:
   - Firebase 콘솔에서 프로젝트 생성
   - Firestore 데이터베이스 활성화
   - 보안 규칙 설정 (README의 보안 규칙 참조)

4. 개발 서버 실행:
   ```bash
   npm run dev
   ```

5. 빌드:
   ```bash
   npm run build
   ```

## 배포

### Vercel 배포
1. GitHub에 푸시:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push
   ```

2. Vercel 환경 변수 설정:
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN  
   vercel env add VITE_FIREBASE_PROJECT_ID
   vercel env add VITE_FIREBASE_STORAGE_BUCKET
   vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
   vercel env add VITE_FIREBASE_APP_ID
   ```

3. 프로덕션 배포:
   ```bash
   vercel --prod
   ```

## 사용법

### 이벤트 생성
1. 홈페이지에서 이벤트 이름과 날짜 입력
2. "QR 초대장 생성" 클릭
3. 생성된 QR 코드를 참가자와 공유

### 체크인
1. 참가자가 QR 코드 스캔 또는 수동 입력
2. 이름, 전화번호(선택), 실력 점수(선택) 입력
3. 중복 체크 후 등록

### 팀 배정 (관리자 전용)
1. 관리자 토큰 입력 (기본: 'admin')
2. 팀 수 선택 (2-6팀)
3. 배정 방식 선택:
   - **균형 배정**: 실력 점수 기반 균형 조정
   - **랜덤 배정**: 완전 랜덤
   - **혼합 배정**: 실력 그룹 내 랜덤
4. "팀 배정 실행" 클릭

## Firestore 구조

```
events/{eventId}
  - name, date, createdAt

events/{eventId}/participants/{participantId}
  - name, phone?, skill?, preferredTeam?, teamAssigned, checkinAt

events/{eventId}/teams/{teamId}
  - name, color, members: [participantId...], updatedAt
```

## JDX 알고리즘

- **균형 배정**: 실력 점수로 정렬 후 순차 배정
- **랜덤 배정**: 완전 무작위 배정
- **혼합 배정**: 실력 그룹별로 나누어 그룹 내 랜덤 배정

## PWA 기능

- 오프라인에서 UI 접근 가능
- 서비스 워커를 통한 캐싱
- 모바일 홈화면 설치 지원

## 배포 URL

🚀 **프로덕션**: https://gen-project-20-29tk4utk0-dongyeol-jungs-projects.vercel.app

## 개발자 노트

- MVP 버전으로 핵심 기능 구현
- QR 스캔은 카메라 권한 필요
- 팀 배정 결과는 Firestore에 영구 저장
- 실시간 동기화로 다중 기기 지원
- Firebase 환경 변수 설정 완료
- Vercel 자동 배포 구성 완료

## 프로젝트 상태

✅ **모든 기능 구현 완료**
✅ **Firebase 실시간 연동**
✅ **프로덕션 배포 완료**
✅ **PWA 기능 지원**
✅ **모바일 최적화**
