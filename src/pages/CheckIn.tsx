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
import { ThemeToggle } from '@/components/theme-toggle';

interface Participant {
  id: string;
  name: string;
  phone?: string;
  skill?: number;
  preferredTeam?: string;
  teamAssigned?: string;
  checkinAt: Date;
}

const CheckIn = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skill, setSkill] = useState<number | ''>('');
  const [scanning, setScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const { toast } = useToast();

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
    alert(`체크인 시도: 이름=${name}, 이벤트ID=${eventId}`);
    
    console.log('handleCheckIn called', { name, eventId, phone, skill });
    
    if (!name || !eventId) {
      alert('이름이나 이벤트 ID가 없습니다.');
      console.log('Missing name or eventId');
      return;
    }

    setIsLoading(true);
    
    try {
    let participants: Participant[] = [];
    if (db) {
      try {
        const participantsDoc = await getDoc(doc(db, 'participants', eventId));
        if (participantsDoc.exists()) {
          participants = participantsDoc.data()?.list || [];
        }
      } catch (error) {
        console.error('Firebase load failed:', error);
        // Fallback to localStorage
        const participantsData = localStorage.getItem(`participants_${eventId}`);
        participants = participantsData ? JSON.parse(participantsData) : [];
      }
    } else {
      const participantsData = localStorage.getItem(`participants_${eventId}`);
      participants = participantsData ? JSON.parse(participantsData) : [];
    }
    
    console.log('Current participants:', participants);
    
    if (participants.some((p: Participant) => p.name === name)) {
      alert('중복 참가자입니다.');
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
      phone: phone || undefined,
      skill: skill || undefined,
      checkinAt: new Date(),
    };

    participants.push(newParticipant);

    // Save to Firebase or localStorage
    if (db) {
      try {
        await setDoc(doc(db, 'participants', eventId), { list: participants });
        console.log('Saved to Firebase');
      } catch (error) {
        console.error('Firebase save failed, using localStorage:', error);
        localStorage.setItem(`participants_${eventId}`, JSON.stringify(participants));
      }
    } else {
      localStorage.setItem(`participants_${eventId}`, JSON.stringify(participants));
      console.log('Saved to localStorage');
    }

    alert(`${name}님이 체크인되었습니다.`);
    toast({
      title: '체크인 완료',
      description: `${name}님이 체크인되었습니다.`,
    });

    setName('');
    setPhone('');
    setSkill('');
    } catch (error) {
      console.error('Check-in failed:', error);
      toast({
        title: '오류 발생',
        description: '체크인에 실패했습니다.',
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-100 flex items-center justify-center p-4 relative">
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
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full w-fit"
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              이벤트 체크인
            </CardTitle>
            <p className="text-gray-600 mt-2">QR 코드를 스캔하거나 정보를 입력하세요</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {scanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="relative">
                  <video ref={videoRef} className="w-full rounded-xl shadow-md" />
                  <div className="absolute inset-0 border-2 border-emerald-400 rounded-xl pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-lg"></div>
                  </div>
                </div>
                <Button onClick={stopScan} className="w-full flex items-center gap-2" variant="outline">
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
                <Button onClick={startScan} className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  QR 코드 스캔
                </Button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">또는 수동 입력</span>
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
                className="h-12 text-lg"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700">전화번호 (선택)</label>
              <Input
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 text-lg"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700">실력 점수 (선택)</label>
              <Input
                type="number"
                placeholder="1-10 사이의 점수"
                value={skill}
                onChange={(e) => setSkill(Number(e.target.value) || '')}
                className="h-12 text-lg"
                min="1"
                max="10"
                disabled={isLoading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={handleCheckIn}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    체크인 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    체크인 완료
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

export default CheckIn;