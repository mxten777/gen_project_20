// src/pages/Home.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Calendar, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

const Home = () => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const createEvent = async () => {
    if (!eventName.trim() || !eventDate) {
      toast({
        title: '입력 오류',
        description: '이벤트 이름과 날짜를 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const eventId = `event_${Date.now()}`;
      const eventData = {
        id: eventId,
        name: eventName.trim(),
        date: eventDate,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
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
                이벤트 이름
              </label>
              <Input
                placeholder="예: 테니스 동호회 모임"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
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
                이벤트 날짜
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                onClick={createEvent} 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading || !eventName.trim() || !eventDate}
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
    </div>
  );
};

export default Home;