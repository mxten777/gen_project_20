// src/pages/CheckIn.tsx
import { useParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';
import { Camera, UserPlus, AlertCircle, Loader2, Users, Zap, Smartphone } from 'lucide-react';
import { CheckInSuccess } from '@/components/animated-feedback';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * 📱 체크인 페이지 - QR 스캔 및 수동 입력
 *
 * 프리미엄 Glassmorphism 디자인으로 QR 코드 스캔과 수동 체크인을 지원합니다.
 * 실시간 참가자 현황 표시, 고급 애니메이션, 직관적인 UX를 갖추고 있습니다.
 */
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
    const loadParticipants = async () => {
      if (!eventId) return;

      let loadedParticipants: Participant[] = [];

      // localStorage에서 참가자 데이터 로드
      const participantsData = localStorage.getItem(`participants_${eventId}`);
      loadedParticipants = participantsData ? JSON.parse(participantsData) : [];

      setParticipants(loadedParticipants);
      console.log(`📊 참가자 ${loadedParticipants.length}명 로드됨`);
    };

    loadParticipants();
  }, [eventId]);

// QR 스캔 설정
  useEffect(() => {
    if (scanning && videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('📱 QR 스캔 성공:', result);
          setScanning(false);
          scannerRef.current?.stop();

          try {
            const url = new URL(result.data);
            const pathParts = url.pathname.split('/');
            const scannedEventId = pathParts[pathParts.length - 1];

            if (scannedEventId && scannedEventId !== eventId) {
              toast({
                title: '🚫 잘못된 QR 코드',
                description: '이 이벤트의 QR 코드가 아닙니다.',
                variant: 'destructive',
              });
              return;
            }

            toast({
              title: '✅ QR 스캔 성공',
              description: '이름을 입력해주세요.',
            });
          } catch (error) {
            console.error('URL 파싱 오류:', error);
            toast({
              title: '⚠️ QR 코드 오류',
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
        console.error('카메라 오류:', err);
        toast({
          title: '📷 카메라 오류',
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

  // 체크인 처리
  const handleCheckIn = async () => {
    console.log('🔄 체크인 시작', { name, eventId });

    if (!name.trim()) {
      toast({
        title: '⚠️ 입력 오류',
        description: '이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      let currentParticipants: Participant[] = [];

      // localStorage에서 현재 참가자 목록 로드
      const participantsData = localStorage.getItem(`participants_${eventId}`);
      currentParticipants = participantsData ? JSON.parse(participantsData) : [];

      // 중복 체크
      if (currentParticipants.some((p: Participant) => p.name === name.trim())) {
        toast({
          title: '🚫 중복 체크인',
          description: '이미 체크인된 이름입니다.',
          variant: 'destructive',
        });
        return;
      }

      // 새 참가자 추가
      const newParticipant: Participant = {
        id: `participant_${Date.now()}`,
        name: name.trim(),
        checkinAt: new Date(),
      };

      currentParticipants.push(newParticipant);
      setParticipants(currentParticipants);

      // localStorage에 저장
      localStorage.setItem(`participants_${eventId}`, JSON.stringify(currentParticipants));
      console.log('💾 localStorage에 저장됨');

      setName('');
      setShowSuccess(true);

      toast({
        title: '🎉 체크인 완료!',
        description: `${name}님이 성공적으로 체크인되었습니다.`,
      });

    } catch (error) {
      console.error('체크인 실패:', error);
      toast({
        title: '🚨 오류 발생',
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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* ===== 프리미엄 배경 애니메이션 ===== */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 메인 그라데이션 오브 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-secondary-400/20 to-primary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* 부가적인 빛 효과 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary-300/10 to-secondary-300/10 rounded-full blur-2xl animate-pulse-slow" />

        {/* 반짝이 효과들 */}
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
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Glassmorphism 메인 카드 */}
        <Card className="glass-card border-0 shadow-premium overflow-hidden">
          {/* 헤더 섹션 */}
          <CardHeader className="text-center pb-6 relative">
            {/* 배경 장식 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-t-2xl" />

            {/* 연결 상태 표시기 - 로컬 모드 */}
            <div className="absolute top-4 right-4">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-glow animate-pulse" />
            </div>

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
              <Smartphone className="h-8 w-8 text-white" />
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
                이벤트 체크인
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                QR 스캔 또는 수동 입력으로 참여하세요
              </p>
            </motion.div>

            {/* 참가자 현황 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 p-4 glass-card rounded-xl border border-primary-200/30"
            >
              <div className="flex items-center justify-center gap-3">
                <Users className="h-5 w-5 text-primary-500" />
                <span className="text-lg font-semibold gradient-primary">
                  현재 참가자: {participants.length}명
                </span>
              </div>
            </motion.div>
          </CardHeader>

          {/* 컨텐츠 섹션 */}
          <CardContent className="space-y-6 px-8 pb-8">
            {/* QR 스캔 섹션 */}
            <AnimatePresence mode="wait">
              {scanning ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* 카메라 뷰 */}
                  <div className="relative rounded-2xl overflow-hidden shadow-premium">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      playsInline
                      muted
                    />
                    {/* 스캔 오버레이 */}
                    <div className="absolute inset-0 border-2 border-primary-400 rounded-2xl pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-lg shadow-glow">
                        <div className="absolute inset-2 border border-primary-300 rounded animate-pulse" />
                      </div>
                    </div>
                    {/* 코너 마커들 */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary-400 rounded-tl" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary-400 rounded-tr" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary-400 rounded-bl" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary-400 rounded-br" />
                  </div>

                  {/* 스캔 중지 버튼 */}
                  <Button
                    onClick={stopScan}
                    variant="outline"
                    className="w-full h-12 border-2 border-error/50 text-error hover:bg-error/10 transition-all duration-300"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    스캔 중지
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="scan-button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    onClick={startScan}
                    className="w-full h-14 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-premium hover:shadow-glow transition-all duration-500 relative overflow-hidden group"
                  >
                    {/* Shimmer 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                    <Camera className="h-5 w-5 mr-3" />
                    <span className="font-semibold">QR 코드 스캔</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 구분선 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative py-4"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 py-1 glass-card text-sm font-medium text-muted-foreground border border-border/30 rounded-full">
                  또는 수동 입력
                </span>
              </div>
            </motion.div>

            {/* 이름 입력 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary-500" />
                참가자 이름 <span className="text-error">*</span>
              </label>
              <Input
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base border-2 border-border focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                disabled={isLoading}
              />
            </motion.div>

            {/* 체크인 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="pt-4"
            >
              <Button
                onClick={handleCheckIn}
                disabled={isLoading || !name.trim()}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-success to-primary-500 hover:from-success/90 hover:to-primary-600 shadow-premium hover:shadow-glow transition-all duration-500 relative overflow-hidden group disabled:opacity-50"
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
                    <span>체크인 중...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <Zap className="h-5 w-5" />
                    <span>체크인 완료</span>
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 성공 애니메이션 */}
      <CheckInSuccess
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
        participantCount={participants.length}
      />
    </div>
  );
};

export default CheckIn;