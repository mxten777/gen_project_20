import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EventPage from './pages/EventPage';
import CheckIn from './pages/CheckIn';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { PageTransition } from '@/components/page-transition';

/**
 * 🏗️ 메인 애플리케이션 컴포넌트
 *
 * 프리미엄 이벤트 체크인 시스템의 루트 컴포넌트입니다.
 * 라우팅, 테마 관리, 페이지 전환 애니메이션을 담당합니다.
 */
function App() {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="qr-checkin-theme"
    >
      {/* 프리미엄 배경 그라데이션 */}
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        {/* 애니메이션 배경 요소들 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary-300/10 to-secondary-300/10 rounded-full blur-2xl animate-pulse-slow" />
        </div>

        <Router>
          <div className="relative z-10">
            <PageTransition>
              <Routes>
                {/* 🏠 홈 페이지 - 이벤트 생성 */}
                <Route path="/" element={<Home />} />

                {/* 📊 이벤트 관리 페이지 */}
                <Route path="/event/:eventId" element={<EventPage />} />

                {/* 📱 체크인 페이지 */}
                <Route path="/checkin/:eventId" element={<CheckIn />} />
              </Routes>
            </PageTransition>

            {/* 토스트 알림 시스템 */}
            <Toaster />
          </div>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
