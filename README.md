# QR 체크인 및 팀 배정 앱

QR 출입 체크인 + 자동 팀배정(JDX) 웹앱 MVP

> **🚀 완전 오프라인 지원**: 인터넷 연결 없이도 모든 기능이 작동하는 PWA 앱

## ✨ 주요 기능

✅ **QR 초대장 생성**: 이벤트 생성 시 자동 QR 코드 생성 및 공유
✅ **실시간 체크인**: QR 스캔 또는 수동 입력으로 참가자 등록
✅ **실시간 대시보드**: 참가자 현황 실시간 반영
✅ **JDX 자동 팀배정**: 균형/랜덤/혼합 배정 알고리즘
✅ **팀별 UI 화면**: 배정 결과 실시간 표시
✅ **PWA 지원**: 오프라인에서도 동작하는 모바일 앱
✅ **관리자 모드**: 토큰 기반 관리자 권한
✅ **완전 오프라인**: localStorage 기반 데이터 저장

## 🛠️ 기술스택

### Frontend
- **React 19**: 최신 React 버전으로 향상된 성능과 개발 경험
- **TypeScript**: 타입 안전성과 개발 생산성 향상
- **Vite**: 초고속 빌드 도구 및 개발 서버

### UI/UX
- **TailwindCSS**: 유틸리티 우선 CSS 프레임워크
- **shadcn/ui**: 고품질 컴포넌트 라이브러리
- **Framer Motion**: 부드러운 애니메이션과 인터랙션
- **Lucide React**: 아름다운 아이콘 라이브러리

### 핵심 기능
- **QR 코드**: qrcode 라이브러리로 QR 생성, qr-scanner로 스캔
- **PWA**: vite-plugin-pwa로 오프라인 지원
- **데이터 저장**: 브라우저 localStorage로 완전 오프라인 지원

### 배포 및 인프라
- **Vercel**: 글로벌 CDN과 자동 배포
- **GitHub**: 버전 관리 및 협업

## 📦 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 1. 프로젝트 클론 및 설치
```bash
# 프로젝트 클론
git clone https://github.com/mxten777/gen_project_20.git
cd gen_project_20

# 의존성 설치
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
- 브라우저에서 `http://localhost:5173` 접속
- 핫 리로드를 지원하여 코드 변경 시 자동 반영

### 3. 프로덕션 빌드
```bash
npm run build
```

### 4. 빌드 미리보기
```bash
npm run preview
```

## 🚀 배포

### Vercel 자동 배포
프로젝트가 GitHub에 푸시되면 자동으로 Vercel에서 배포됩니다.

```bash
# 변경사항 커밋 및 푸시
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
```

### 수동 배포 (선택사항)
```bash
# Vercel CLI 설치 (최초 1회)
npm i -g vercel

# 배포
vercel --prod
```

## 📱 사용법

### 이벤트 생성
1. **홈페이지 접속**: 메인 페이지에서 이벤트 정보를 입력
2. **이벤트 설정**:
   - 이벤트 이름 (필수)
   - 이벤트 날짜 (선택)
   - 이벤트 설명 (선택)
3. **QR 초대장 생성**: "QR 초대장 생성" 버튼 클릭
4. **QR 코드 공유**: 생성된 QR 코드를 참가자와 공유

### 참가자 체크인
1. **QR 코드 스캔**: 참가자가 QR 코드를 카메라로 스캔
2. **정보 입력**:
   - 이름 (필수)
   - 전화번호 (선택)
   - 실력 점수 (1-10, 선택)
   - 선호 팀 (선택)
3. **등록 완료**: 중복 체크 후 참가자 등록

### 팀 배정 (관리자 전용)
1. **관리자 모드 진입**: 관리자 토큰 입력 (기본: `admin`)
2. **팀 배정 설정**:
   - 팀 수 선택 (2-6팀)
   - 배정 방식 선택:
     - **균형 배정**: 실력 점수 기반 균형 조정
     - **랜덤 배정**: 완전 무작위 배정
     - **혼합 배정**: 실력 그룹 내 랜덤 배정
3. **배정 실행**: "팀 배정 실행" 버튼 클릭
4. **결과 확인**: 실시간으로 팀 배정 결과 표시

## 🗂️ 프로젝트 구조

```
src/
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── animated-feedback.tsx    # 애니메이션 피드백
│   ├── connection-status.tsx    # 연결 상태 표시
│   ├── page-transition.tsx      # 페이지 전환 애니메이션
│   └── theme-provider.tsx       # 테마 제공자
├── pages/               # 메인 페이지 컴포넌트
│   ├── Home.tsx         # 이벤트 생성 페이지
│   ├── EventPage.tsx    # 이벤트 대시보드
│   └── CheckIn.tsx      # 체크인 페이지
├── hooks/               # 커스텀 React 훅
│   ├── use-toast.ts     # 토스트 알림 훅
│   └── useFirestore.ts  # 데이터 관리 훅 (localStorage)
├── lib/                 # 유틸리티 및 설정
│   └── utils.ts         # 공통 유틸리티 함수
├── assets/              # 정적 파일
└── firebase.ts          # Firebase 설정 (사용되지 않음)
```

## 💾 데이터 구조

모든 데이터는 브라우저의 **localStorage**에 JSON 형식으로 저장됩니다.

### 이벤트 데이터 구조
```typescript
interface Event {
  id: string;
  name: string;
  date?: string;
  description?: string;
  createdAt: string;
  qrCode: string;        // QR 코드 데이터 URL
}
```

### 참가자 데이터 구조
```typescript
interface Participant {
  id: string;
  name: string;
  phone?: string;
  skill?: number;        // 1-10 실력 점수
  preferredTeam?: string;
  teamAssigned?: string; // 배정된 팀 ID
  checkinAt: string;     // 체크인 시간
}
```

### 팀 데이터 구조
```typescript
interface Team {
  id: string;
  name: string;
  color: string;
  members: string[];     // 참가자 ID 배열
  updatedAt: string;
}
```

## 🎯 JDX 팀 배정 알고리즘

### 1. 균형 배정 (Balanced)
- 참가자들을 실력 점수로 정렬
- 각 팀에 번갈아 배정하여 실력 균형 유지
- **사용 사례**: 경쟁력 있는 대회나 토너먼트

### 2. 랜덤 배정 (Random)
- 완전 무작위로 팀 배정
- 실력이나 다른 요소 고려하지 않음
- **사용 사례**: 캐주얼 모임이나 친목 활동

### 3. 혼합 배정 (Mixed)
- 실력 점수로 그룹화 (상/중/하)
- 각 그룹 내에서 랜덤 배정
- **사용 사례**: 실력 차이를 고려하면서 다양성 확보

## 📱 PWA 기능

### 오프라인 지원
- **서비스 워커**: 정적 파일 캐싱으로 오프라인 접근
- **localStorage**: 모든 데이터 브라우저에 저장
- **캐시 전략**: App Shell + Runtime 캐싱

### 모바일 최적화
- **홈 화면 설치**: 모바일에서 앱처럼 설치 가능
- **반응형 디자인**: 모든 화면 크기 지원
- **터치 인터랙션**: 모바일 친화적 UI/UX

### 설치 방법
1. Chrome/Edge 브라우저에서 사이트 접속
2. 주소창의 "설치" 버튼 클릭 또는 메뉴에서 "홈 화면에 추가"
3. 앱처럼 사용할 수 있음

## 🔧 개발 및 기여

### 코드 품질 관리
```bash
# 린팅
npm run lint

# 타입 체크
npx tsc --noEmit

# 빌드 테스트
npm run build
```

### 개발 워크플로우
1. **브랜치 생성**: `git checkout -b feature/new-feature`
2. **개발 및 테스트**: 기능 구현 및 테스트
3. **커밋**: `git commit -m "feat: 새로운 기능 설명"`
4. **푸시**: `git push origin feature/new-feature`
5. **PR 생성**: GitHub에서 Pull Request 생성

## 🌐 배포 URL

🚀 **프로덕션**: https://gen-project-20-b8hvnpdmd-dongyeol-jungs-projects.vercel.app
🔗 **GitHub**: https://github.com/mxten777/gen_project_20

## 📊 프로젝트 상태

✅ **모든 기능 구현 완료**
✅ **완전 오프라인 지원**
✅ **PWA 기능 지원**
✅ **모바일 최적화**
✅ **프로덕션 배포 완료**

## 🚀 향후 개발 계획

### 테스트 및 검증
- 단위 테스트 (Jest + Testing Library)
- 통합 테스트 (Cypress)
- 성능 테스트 및 최적화
- 접근성 (a11y) 테스트
- 크로스 브라우저 테스트

### 추가 기능 고려사항
- **이벤트 템플릿 시스템**: 자주 사용하는 이벤트 템플릿
- **참가자 데이터 분석**: 체크인 통계 및 분석 대시보드
- **알림 시스템**: 이메일/SMS 참가자 알림
- **다국어 지원**: i18n 국제화
- **관리자 권한 세분화**: 역할 기반 접근 제어
- **데이터 내보내기**: CSV/Excel 참가자 데이터 다운로드
- **클라우드 백업**: 선택적 온라인 데이터 동기화

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다.

## 👥 기여자

- **개발자**: [Your Name]
- **디자인**: [Designer Name]
- **프로젝트 관리**: [PM Name]

---

**✨ 완전 오프라인 QR 체크인 앱 - 어디서나 사용할 수 있습니다! ✨**
