import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Calendar, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

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
    if (!eventTitle1.trim() || !eventDate || !eventLocation.trim()) {
      toast({
        title: '입력 오류',
        description: '필수 항목(제목1, 날짜, 장소)을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const eventId = `event_${Date.now()}`;
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

      // Save to Firebase or localStorage
      if (db) {
        try {
          await setDoc(doc(db, 'events', eventId), eventData);
          console.log('Event saved to Firebase');
        } catch (error) {
          console.error('Firebase save failed, using localStorage:', error);
          localStorage.setItem(`event_${eventId}`, JSON.stringify(eventData));
        }
      } else {
        localStorage.setItem(`event_${eventId}`, JSON.stringify(eventData));
        console.log('Event saved to localStorage');
      }
      
      toast({
        title: '이벤트 생성 완료',
        description: 'QR 초대장이 생성되었습니다.',
      });
      
      navigate(`/event/${eventId}`);
    } catch (error) {
      console.error('Event creation failed:', error);
      toast({
        title: '오류 발생',
        description: '이벤트 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-40 h-40 bg-purple-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-indigo-300 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-400 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-28 h-28 bg-blue-400 rounded-full blur-2xl animate-bounce delay-700"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
      <div className="absolute top-3/4 right-1/4 w-4 h-4 bg-blue-400 rounded-full animate-ping delay-300"></div>
      <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-ping delay-500"></div>
      <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping delay-800"></div>
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-fit"
            >
              <Calendar className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              이벤트 생성
            </CardTitle>
            <p className="text-gray-600 mt-2">새로운 이벤트를 만들고 QR 초대장을 생성하세요</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                이벤트 제목1 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="예: 삼광초등학교"
                value={eventTitle1}
                onChange={(e) => setEventTitle1(e.target.value)}
                className="h-12 text-lg"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                이벤트 제목2
              </label>
              <Input
                placeholder="예: 송년모임"
                value={eventTitle2}
                onChange={(e) => setEventTitle2(e.target.value)}
                className="h-12 text-lg"
                disabled={isLoading}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                이벤트 날짜 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="h-12 text-lg"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                🕐 이벤트 시간
              </label>
              <Input
                placeholder="예: 오후 2시, 2시 30분"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="h-12 text-lg"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                📍 장소 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="예: 삼광초등학교 강당"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="h-12 text-lg"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                👥 참석 예정 인원
              </label>
              <Input
                type="number"
                placeholder="예: 50"
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(e.target.value ? Number(e.target.value) : '')}
                className="h-12 text-lg"
                min="1"
                disabled={isLoading}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Button 
                onClick={createEvent} 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading || !eventTitle1.trim() || !eventDate || !eventLocation.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    QR 초대장 생성
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeTutorial}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  환영합니다!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  QR 체크인 앱으로 이벤트 관리를 쉽게 시작하세요.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    이벤트 이름과 날짜를 입력하세요
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">2</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    QR 초대장을 생성하고 참가자와 공유하세요
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold">3</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    실시간으로 체크인 현황을 확인하세요
                  </p>
                </div>
              </div>

              <Button onClick={closeTutorial} className="w-full">
                시작하기
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;