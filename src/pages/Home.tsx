import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Loader2, Sparkles, Zap, Users, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * 🏠 홈 페이지 - 이벤트 생성
 *
 * 프리미엄 Glassmorphism 디자인으로 이벤트 생성 인터페이스를 제공합니다.
 * 실시간 유효성 검사, 고급 애니메이션, 직관적인 UX를 갖추고 있습니다.
 */
const Home = () => {
  const [eventTitle1, setEventTitle1] = useState('');
  const [eventTitle2, setEventTitle2] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('qr-checkin-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('qr-checkin-tutorial-seen', 'true');
  };

  const createEvent = async () => {
    console.log('🚀 이벤트 생성 시작');
    if (!eventTitle1.trim() || !eventDate || !eventLocation.trim()) {
      console.log('❌ 필수 항목 누락');
      toast({
        title: '⚠️ 입력 오류',
        description: '필수 항목(제목1, 날짜, 장소)을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    console.log('⏳ 로딩 시작');
    setIsLoading(true);

    try {
      const eventId = `event_${Date.now()}`;
      console.log('📝 이벤트 ID 생성:', eventId);
      const eventData = {
        id: eventId,
        title1: eventTitle1.trim(),
        title2: eventTitle2.trim(),
        date: eventDate,
        timeFrom: eventTime,
        timeTo: '', // 빈 값으로 설정
        location: eventLocation.trim(),
        expectedAttendees: Number(expectedAttendees) || 0,
        createdAt: new Date(),
      };
      console.log('📋 이벤트 데이터:', eventData);

      // Firebase 또는 localStorage에 저장
      console.log('💾 localStorage에 저장');
      localStorage.setItem(`event_${eventId}`, JSON.stringify(eventData));
      console.log('💾 이벤트가 localStorage에 저장되었습니다');

      console.log('🎉 토스트 표시');
      toast({
        title: '🎉 이벤트 생성 완료',
        description: 'QR 초대장이 생성되었습니다.',
      });

      console.log('🧭 페이지 이동 시도:', `/event/${eventId}`);
      navigate(`/event/${eventId}`);
      console.log('✅ 페이지 이동 완료');
    } catch (error) {
      console.error('❌ 이벤트 생성 실패:', error);
      toast({
        title: '🚨 오류 발생',
        description: '이벤트 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      console.log('🏁 로딩 종료');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* ===== 프리미엄 배경 애니메이션 ===== */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 메인 그라데이션 오브 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-secondary-400/20 to-primary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* 부가적인 빛 효과 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary-300/10 to-secondary-300/10 rounded-full blur-2xl animate-pulse-slow" />

        {/* 작은 반짝이 효과들 */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary-400 rounded-full animate-ping" />
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-secondary-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-primary-500 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
      </div>

      {/* ===== 테마 토글 ===== */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* ===== 메인 컨텐츠 ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Glassmorphism 카드 */}
        <Card className="glass-card border-0 shadow-premium overflow-hidden">
          {/* 헤더 섹션 */}
          <CardHeader className="text-center pb-6 relative">
            {/* 배경 장식 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-t-2xl" />

            {/* 아이콘 애니메이션 */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 20
              }}
              className="mx-auto mb-6 p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl w-fit shadow-glow relative"
            >
              <Sparkles className="h-8 w-8 text-white" />
              {/* 빛나는 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-2xl blur opacity-50 animate-pulse" />
            </motion.div>

            {/* 타이틀 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold gradient-primary mb-3">
                이벤트 생성
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                QR 초대장으로 스마트한 이벤트 관리 시작하기
              </p>
            </motion.div>
          </CardHeader>

          {/* 폼 섹션 */}
          <CardContent className="space-y-6 px-8 pb-8">
            {/* 이벤트 제목1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary-500" />
                이벤트 제목1 <span className="text-error">*</span>
              </label>
              <Input
                placeholder="예: 삼광초등학교"
                value={eventTitle1}
                onChange={(e) => setEventTitle1(e.target.value)}
                className="h-12 text-base border-2 border-border focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                disabled={isLoading}
              />
            </motion.div>

            {/* 이벤트 제목2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-secondary-500" />
                이벤트 제목2
              </label>
              <Input
                placeholder="예: 송년모임"
                value={eventTitle2}
                onChange={(e) => setEventTitle2(e.target.value)}
                className="h-12 text-base border-2 border-border focus:border-secondary-500 focus:ring-4 focus:ring-secondary-100 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                disabled={isLoading}
              />
            </motion.div>

            {/* 이벤트 날짜 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-500" />
                이벤트 날짜 <span className="text-error">*</span>
              </label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="h-12 text-base border-2 border-border focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                disabled={isLoading}
              />
            </motion.div>

            {/* 이벤트 시간 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary-500" />
                이벤트 시간
              </label>
              <Input
                placeholder="예: 오후 2시, 2시 30분"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="h-12 text-base border-2 border-border focus:border-secondary-500 focus:ring-4 focus:ring-secondary-100 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                disabled={isLoading}
              />
            </motion.div>

            {/* 장소 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-500" />
                장소 <span className="text-error">*</span>
              </label>
              <Input
                placeholder="예: 삼광초등학교 강당"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="h-12 text-base border-2 border-border focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                disabled={isLoading}
              />
            </motion.div>

            {/* 참석 예정 인원 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-secondary-500" />
                참석 예정 인원
              </label>
              <Input
                type="number"
                placeholder="예: 50"
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(e.target.value ? Number(e.target.value) : '')}
                className="h-12 text-base border-2 border-border focus:border-secondary-500 focus:ring-4 focus:ring-secondary-100 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                min="1"
                disabled={isLoading}
              />
            </motion.div>

            {/* 생성 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-4"
            >
              <Button
                onClick={createEvent}
                disabled={isLoading || !eventTitle1.trim() || !eventDate || !eventLocation.trim()}
                className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-500 relative overflow-hidden group"
              >
                {/* Shimmer 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>생성 중...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <Zap className="h-5 w-5" />
                    <span>QR 초대장 생성</span>
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== 프리미엄 튜토리얼 모달 ===== */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={closeTutorial}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass-card max-w-sm w-full mx-4 shadow-premium p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold gradient-primary mb-2">
                  환영합니다! 🎉
                </h3>
                <p className="text-muted-foreground">
                  QR 체크인 앱으로 스마트한 이벤트 관리를 시작하세요
                </p>
              </div>

              {/* 단계별 가이드 */}
              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: '1️⃣',
                    title: '이벤트 정보 입력',
                    desc: '이름, 날짜, 장소를 입력하세요'
                  },
                  {
                    icon: '2️⃣',
                    title: 'QR 초대장 생성',
                    desc: '자동으로 QR 코드가 생성됩니다'
                  },
                  {
                    icon: '3️⃣',
                    title: '실시간 체크인',
                    desc: '참가자들이 QR을 스캔하여 체크인'
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-4 p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50"
                  >
                    <div className="text-lg">{step.icon}</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 시작하기 버튼 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={closeTutorial}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🚀 시작하기
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;