// src/pages/CheckIn.tsx
import { useParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Camera, UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { CheckInSuccess } from '@/components/animated-feedback';
import { ThemeToggle } from '@/components/theme-toggle';

interface Participant {
  id: string;
  name: string;
  preferredTeam?: string;
  teamAssigned?: string;
  checkinAt: Date;
}

const CheckIn = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [name, setName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    // Firebase 연결 상태 테스트
    const testFirebaseConnection = async () => {
      console.log('🔍 Firebase 연결 테스트 시작');
      console.log('Firebase DB 객체:', db);
      
      if (!db) {
        console.warn('❌ Firebase DB가 초기화되지 않음');
        return;
      }

      try {
        // 간단한 읽기 테스트
        await getDoc(doc(db, 'test', 'connection'));
        console.log('✅ Firebase 읽기 테스트 성공');
        
        // 간단한 쓰기 테스트
        await setDoc(doc(db, 'test', 'connection'), { 
          timestamp: new Date(),
          test: true 
        });
        console.log('✅ Firebase 쓰기 테스트 성공');
        
      } catch (error) {
        console.error('❌ Firebase 연결 테스트 실패:', error);
      }
    };

    // 페이지 로드 후 2초 뒤에 테스트
    const timer = setTimeout(testFirebaseConnection, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Load participants on component mount
    const loadParticipants = async () => {
      if (!eventId) return;
      
      let loadedParticipants: Participant[] = [];
      if (db) {
        try {
          const participantsDoc = await getDoc(doc(db, 'participants', eventId));
          if (participantsDoc.exists()) {
            loadedParticipants = participantsDoc.data()?.list || [];
          }
        } catch (error) {
          console.error('Firebase load failed:', error);
          const participantsData = localStorage.getItem(`participants_${eventId}`);
          loadedParticipants = participantsData ? JSON.parse(participantsData) : [];
        }
      } else {
        const participantsData = localStorage.getItem(`participants_${eventId}`);
        loadedParticipants = participantsData ? JSON.parse(participantsData) : [];
      }
      
      setParticipants(loadedParticipants);
      console.log('Loaded participants on mount:', loadedParticipants.length);
    };

    loadParticipants();
  }, [eventId, db]);

  useEffect(() => {
    if (scanning && videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR scanned:', result);
          setScanning(false);
          scannerRef.current?.stop();
          
          // QR 코드에서 URL 파싱
          try {
            const url = new URL(result.data);
            const pathParts = url.pathname.split('/');
            const scannedEventId = pathParts[pathParts.length - 1];
            console.log('Scanned eventId:', scannedEventId, 'Current eventId:', eventId);
            
            if (scannedEventId && scannedEventId !== eventId) {
              toast({
                title: '잘못된 QR 코드',
                description: '이 이벤트의 QR 코드가 아닙니다.',
                variant: 'destructive',
              });
              return;
            }
            
            toast({
              title: 'QR 스캔 성공',
              description: '정보를 입력해주세요.',
            });
          } catch (error) {
            console.error('URL parsing error:', error);
            toast({
              title: 'QR 코드 오류',
              description: '유효하지 않은 QR 코드입니다.',
              variant: 'destructive',
            });
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      scannerRef.current.start().catch((err) => {
        console.error('QR Scanner error:', err);
        toast({
          title: '카메라 오류',
          description: '카메라 권한을 확인해주세요.',
          variant: 'destructive',
        });
        setScanning(false);
      });
    }

    return () => {
      scannerRef.current?.stop();
    };
  }, [scanning, toast, eventId]);

  const handleCheckIn = async () => {
    console.log('🔄 handleCheckIn 시작', { name, eventId });
    
    if (!name || !eventId) {
      console.log('❌ 필수 입력 누락');
      toast({
        title: '입력 오류',
        description: '이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    console.log('⏳ 로딩 시작, Firebase 연결 상태:', !!db);
    
    try {
    let currentParticipants: Participant[] = [];
    if (db) {
      try {
        const participantsDoc = await getDoc(doc(db, 'participants', eventId));
        if (participantsDoc.exists()) {
          currentParticipants = participantsDoc.data()?.list || [];
        }
        console.log('Loaded existing participants from Firebase:', currentParticipants.length);
      } catch (error) {
        console.error('Firebase load failed:', error);
        // Fallback to localStorage
        const participantsData = localStorage.getItem(`participants_${eventId}`);
        currentParticipants = participantsData ? JSON.parse(participantsData) : [];
        console.log('Loaded participants from localStorage:', currentParticipants.length);
      }
    } else {
      const participantsData = localStorage.getItem(`participants_${eventId}`);
      currentParticipants = participantsData ? JSON.parse(participantsData) : [];
      console.log('Loaded participants from localStorage (no Firebase):', currentParticipants.length);
    }
    
    console.log('Current participants:', currentParticipants);
    
    if (currentParticipants.some((p: Participant) => p.name === name)) {
      console.log('Duplicate participant');
      toast({
        title: '중복 체크인',
        description: '이미 체크인된 이름입니다.',
        variant: 'destructive',
      });
      return;
    }

    const newParticipant: Participant = {
      id: `participant_${Date.now()}`,
      name,
      checkinAt: new Date(),
    };

    currentParticipants.push(newParticipant);
    console.log('Added new participant:', newParticipant);

    // Update state
    setParticipants(currentParticipants);

    // Save to Firebase or localStorage
    if (db) {
      try {
        await setDoc(doc(db, 'participants', eventId), { list: currentParticipants });
        console.log('✅ Saved to Firebase successfully');
        
        // Also backup to localStorage
        localStorage.setItem(`participants_${eventId}`, JSON.stringify(currentParticipants));
      } catch (error) {
        console.error('❌ Firebase save failed, using localStorage:', error);
        localStorage.setItem(`participants_${eventId}`, JSON.stringify(currentParticipants));
        toast({
          title: '저장 완료 (오프라인)',
          description: 'Firebase 연결 실패로 로컬에 저장되었습니다.',
        });
      }
    } else {
      localStorage.setItem(`participants_${eventId}`, JSON.stringify(currentParticipants));
      console.log('Saved to localStorage (no Firebase)');
      toast({
        title: '저장 완료 (로컬)',
        description: 'Firebase가 연결되지 않아 로컬에 저장되었습니다.',
      });
    }

    setName('');
    setShowSuccess(true);
    } catch (error) {
      console.error('Check-in failed:', error);
      toast({
        title: '오류 발생',
        description: '체크인에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startScan = () => {
    setScanning(true);
  };

  const stopScan = () => {
    setScanning(false);
    scannerRef.current?.stop();
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-blue-100 p-4 relative overflow-hidden flex items-center justify-center">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-secondary-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-300 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-10 right-20 w-36 h-36 bg-primary-400 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-10 left-20 w-32 h-32 bg-secondary-400 rounded-full blur-2xl animate-bounce delay-700"></div>
      </div>

      {/* Enhanced Floating Elements */}
<div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary-400 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-4 h-4 bg-secondary-400 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-primary-400 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5 bg-primary-500 rounded-full animate-ping delay-800"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-secondary-500 rounded-full animate-ping delay-1200"></div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 100 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl relative overflow-hidden rounded-2xl">
          {/* Enhanced Card Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-primary-50/50 to-secondary-50/40"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary-200/40 to-transparent rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-secondary-200/40 to-transparent rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-primary-300/25 to-secondary-300/25 rounded-full blur-sm"></div>

          {/* Premium Multi-layer Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-100/20 to-transparent skew-x-12 animate-pulse opacity-30 delay-1000"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary-100/15 to-transparent -skew-x-6 animate-pulse opacity-20 delay-2000"></div>
          <CardHeader className="text-center pb-6 relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 p-4 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 rounded-full w-fit shadow-lg"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent mb-3">
              이벤트 체크인
            </CardTitle>
            <p className="text-gray-600 mt-3 text-center max-w-sm mx-auto leading-relaxed">
              QR 코드를 스캔하거나 정보를 입력하세요<br/>
              <span className="text-sm font-semibold text-emerald-600">이름, 전화번호, 실력 점수가 모두 필요합니다</span>
            </p>
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-center text-lg font-semibold text-emerald-700">
                현재 등록된 참가자: {participants.length}명
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10 p-8">
            {scanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="relative">
                  <video ref={videoRef} className="w-full rounded-xl shadow-md" />
                  <div className="absolute inset-0 border-2 border-primary-400 rounded-xl pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-lg"></div>
                  </div>
                </div>
                <Button onClick={stopScan} className="w-full h-12 flex items-center gap-2 rounded-xl border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50 transition-all duration-300" variant="outline">
                  <AlertCircle className="h-4 w-4" />
                  스캔 중지
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button onClick={startScan} className="w-full h-12 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 flex items-center gap-2 rounded-xl">
                  <Camera className="h-5 w-5" />
                  QR 코드 스캔
                </Button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative py-4"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-gray-500 font-medium text-sm border border-gray-300 rounded-full py-1">
                  또는 수동 입력
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                참가자 이름 *
              </label>
              <Input
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 text-lg border-2 border-primary-200/50 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md focus:shadow-lg"
                disabled={isLoading}
              />
            </motion.div>

            {/* 모바일 가독성 개선을 위한 여백 */}
            <div className="h-4 md:h-6"></div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={handleCheckIn}
                className="w-full h-16 md:h-14 text-lg font-semibold bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white shadow-xl hover:shadow-premium hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-primary-200 focus:ring-offset-2 transition-all duration-300 will-change-transform flex items-center justify-center gap-3 disabled:hover:scale-100 rounded-xl border-2 border-white/20"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-lg">체크인 중...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-lg font-bold">체크인 완료</span>
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      <CheckInSuccess isVisible={showSuccess} onClose={() => setShowSuccess(false)} participantCount={participants.length} />
    </div>
  );
};

export default CheckIn;