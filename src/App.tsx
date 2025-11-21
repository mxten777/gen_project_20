import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EventPage from './pages/EventPage';
import CheckIn from './pages/CheckIn';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { PageTransition } from '@/components/page-transition';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="qr-checkin-theme">
      <Router>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/event/:eventId" element={<EventPage />} />
            <Route path="/checkin/:eventId" element={<CheckIn />} />
          </Routes>
        </PageTransition>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
