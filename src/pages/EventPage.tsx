// src/pages/EventPage.tsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Users, Calendar, Clock, MapPin, Target, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConnectionIndicator } from '@/components/connection-status';

interface Event {
  id: string;
  title1: string;
  title2: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  expectedAttendees: number;
  createdAt: Date;
  location?: string;
}

interface Participant {
  id: string;
  name: string;
  phone?: string;
  skill?: number;
  checkinAt: Date;
}

const EventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    console.log('🔄 이벤트 데이터 로딩 시작');
    setIsLoading(true);

    try {
      // Load event data from localStorage
      const eventData = localStorage.getItem(`event_${eventId}`);
      if (eventData) {
        setEvent(JSON.parse(eventData));
        console.log('✅ localStorage에서 이벤트 데이터 로드됨');
      } else {
        console.log('⚠️ 이벤트 데이터를 찾을 수 없음');
      }

      // Load participants data
      const participantsData = localStorage.getItem(`participants_${eventId}`);
      if (participantsData) {
        setParticipants(JSON.parse(participantsData));
        console.log('👥 참가자 데이터 로드됨');
      }
    } catch (error) {
      console.error('❌ 이벤트 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
      console.log('🏁 이벤트 데이터 로딩 완료');
    }
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">이벤트를 찾을 수 없습니다</h2>
          <p className="text-gray-500">존재하지 않는 이벤트이거나 삭제되었을 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* 프리미엄 배경 애니메이션 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-secondary-400/20 to-primary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* 테마 토글 */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* 메인 컨텐츠 */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-7xl relative z-10"
      >
        {/* Glassmorphism 메인 카드 */}
        <Card className="glass-card border-0 shadow-premium overflow-hidden">
          {/* 헤더 섹션 */}
          <CardHeader className="text-center pb-6 relative">
            {/* 배경 장식 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-t-2xl" />

            {/* 연결 상태 표시기 */}
            <div className="absolute top-4 right-4">
              <ConnectionIndicator />
            </div>

            {/* 타이틀 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10"
            >
              <CardTitle className="text-4xl md:text-5xl font-bold mb-2">
                <span className="gradient-primary">{event.title1}</span>
                <br />
                <span className="text-gray-700">{event.title2}</span>
              </CardTitle>
            </motion.div>

            {/* 이벤트 정보 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6 text-sm md:text-base"
            >
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-5 w-5 text-primary-500" />
                <span className="font-medium">{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5 text-primary-500" />
                <span className="font-medium">{event.timeFrom} - {event.timeTo}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <span className="font-medium">{event.location}</span>
                </div>
              )}
            </motion.div>
          </CardHeader>

          {/* 컨텐츠 섹션 */}
          <CardContent className="space-y-8">
            {/* 통계 카드들 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">참가자</p>
                    <p className="text-2xl font-bold text-blue-700">{participants.length}명</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">목표</p>
                    <p className="text-2xl font-bold text-green-700">{event.expectedAttendees}명</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">진행 상태</p>
                    <p className="text-2xl font-bold text-indigo-700">활성</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 참가자 목록 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <Card className="glass-card border-0 shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                    <Users className="h-7 w-7 text-primary-500" />
                    참가자 목록
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {participants.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">아직 체크인한 참가자가 없습니다</h3>
                      <p className="text-gray-500">참가자들이 도착하면 실시간으로 목록이 업데이트됩니다</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {participants.map((participant, index) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                              {participant.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{participant.name}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(participant.checkinAt).toLocaleTimeString('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          {participant.skill && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              Lv.{participant.skill}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EventPage;