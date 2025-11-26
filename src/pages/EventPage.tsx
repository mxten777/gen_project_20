// src/pages/EventPage.tsx
import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Users, Settings, Shield, Trophy, Download, Share2, Image } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { SkeletonParticipant } from '@/components/skeleton';
import { TeamAssignmentSuccess } from '@/components/animated-feedback';
import { ConnectionStatus, ConnectionIndicator } from '@/components/connection-status';

interface Event {
  name: string;
  date: string;
  createdAt: Date;
}

interface Participant {
  id: string;
  name: string;
  phone?: string;
  skill?: number;
  preferredTeam?: string;
  teamAssigned?: string;
  checkinAt: Date;
}

interface Team {
  id: string;
  name: string;
  color: string;
  members: Participant[];
  updatedAt: Date;
}

const EventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [qrUrl, setQrUrl] = useState('');
  const [invitationImage, setInvitationImage] = useState<string>('');
  const [numTeams, setNumTeams] = useState(2);
  const [balanceType, setBalanceType] = useState<'balanced' | 'random' | 'mixed'>('balanced');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [showTeamSuccess, setShowTeamSuccess] = useState(false);
  const [assignedTeamCount, setAssignedTeamCount] = useState(0);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const { toast } = useToast();

  // Generate premium invitation card
  const generateInvitation = useCallback(async () => {
    console.log('Generating invitation...', { event, qrUrl });
    
    if (!event || !qrUrl) {
      console.log('Missing event or qrUrl');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Canvas context not available');
        return;
      }

      // Set canvas size for high quality
      canvas.width = 800;
      canvas.height = 1200;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 800, 1200);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(0.5, '#764ba2');
      gradient.addColorStop(1, '#f093fb');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 1200);

      // Add decorative elements
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(50, 50, 700, 1100);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 이벤트 초대장 🎉', 400, 150);

      // Event name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(event.name, 400, 220);

      // Event date
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText(new Date(event.date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }), 400, 270);

      // Description
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('참여를 원하시면 아래 QR 코드를 스캔하세요!', 400, 330);

      // Generate QR Code directly on canvas with better error handling
      console.log('Generating QR code on canvas...');
      try {
        const qrCanvas = document.createElement('canvas');
        await QRCode.toCanvas(qrCanvas, `${window.location.origin}/checkin/${eventId}`, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });

        // Draw QR code on main canvas
        ctx.drawImage(qrCanvas, 250, 380, 300, 300);
        console.log('✅ QR code drawn on canvas successfully');
      } catch (qrError) {
        console.error('❌ QR generation on canvas failed:', qrError);
        // Draw placeholder text instead
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR 코드 생성 실패', 400, 530);
        ctx.fillText(`직접 접속: ${window.location.origin}/checkin/${eventId}`, 400, 550);
      }

      // Instructions
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText('📱 모바일로 QR 코드를 스캔하여', 400, 720);
      ctx.fillText('체크인하세요!', 400, 750);

      // Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '16px Arial';
      ctx.fillText('Powered by QR Check-in System', 400, 850);

      // Convert to image
      const imageData = canvas.toDataURL('image/png', 0.9);
      console.log('Invitation image generated successfully');
      setInvitationImage(imageData);
    } catch (error) {
      console.error('Invitation generation failed:', error);
      // Fallback: generate without QR
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 800;
        canvas.height = 1200;

        const gradient = ctx.createLinearGradient(0, 0, 800, 1200);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 1200);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(50, 50, 700, 1100);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 이벤트 초대장 🎉', 400, 150);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(event.name, 400, 220);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(new Date(event.date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }), 400, 270);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('QR 코드 생성 실패 - 수동 체크인 필요', 400, 530);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Arial';
        ctx.fillText('Powered by QR Check-in System', 400, 850);

        const imageData = canvas.toDataURL('image/png', 0.9);
        setInvitationImage(imageData);
      } catch (fallbackError) {
        console.error('Fallback invitation generation also failed:', fallbackError);
      }
    }
  }, [event, qrUrl, eventId]);

  // Share invitation
  const shareInvitation = async () => {
    if (!invitationImage) return;

    const shareData = {
      title: `${event?.name} - 이벤트 초대장`,
      text: `${event?.name} 이벤트에 초대합니다! QR 코드를 스캔하여 참여하세요.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share failed:', error);
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: '링크 복사됨',
          description: '초대장 링크가 클립보드에 복사되었습니다.',
        });
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: '링크 복사됨',
        description: '초대장 링크가 클립보드에 복사되었습니다.',
      });
    }
  };

  // Download invitation image
  const downloadInvitation = () => {
    if (!invitationImage) return;

    const link = document.createElement('a');
    link.download = `${event?.name}_초대장.png`;
    link.href = invitationImage;
    link.click();

    toast({
      title: '다운로드 완료',
      description: '초대장 이미지가 저장되었습니다.',
    });
  };

  // Generate invitation on mount
  useEffect(() => {
    if (event && qrUrl && !invitationImage) {
      // Use requestAnimationFrame to avoid synchronous state update
      let animationFrame: number;
      animationFrame = requestAnimationFrame(() => {
        generateInvitation().catch(err => {
          console.error('Invitation generation failed:', err);
        });
      });
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [event, qrUrl, invitationImage, generateInvitation]);

  useEffect(() => {
    const loadData = async () => {
      if (!eventId) return;

      setIsLoadingParticipants(true);

      // Try Firebase first, fallback to localStorage
      if (db) {
        try {
          // Load event from Firestore with timeout
          const eventDocPromise = getDoc(doc(db!, 'events', eventId));
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );
          const eventDoc = await Promise.race([eventDocPromise, timeoutPromise]);
          
          if (eventDoc.exists()) {
            setEvent(eventDoc.data() as Event);
          } else {
            // If event not found in Firebase, try localStorage
            const eventData = localStorage.getItem(`event_${eventId}`);
            if (eventData) {
              setEvent(JSON.parse(eventData));
            }
          }

          // Load participants from Firestore
          const participantsDoc = await getDoc(doc(db!, 'participants', eventId));
          if (participantsDoc.exists()) {
            setParticipants(participantsDoc.data()?.list || []);
          }

          // Load teams from Firestore
          const teamsDoc = await getDoc(doc(db!, 'teams', eventId));
          if (teamsDoc.exists()) {
            setTeams(teamsDoc.data()?.list || []);
          }

          // Real-time listeners with error handling
          const unsubscribeParticipants = onSnapshot(
            doc(db!, 'participants', eventId), 
            (doc) => {
              if (doc.exists()) {
                setParticipants(doc.data()?.list || []);
                // Backup to localStorage
                localStorage.setItem(`participants_${eventId}`, JSON.stringify(doc.data()?.list || []));
              }
            },
            (error) => {
              console.warn('Participants listener error:', error);
              // Fallback to localStorage
              const fallbackData = localStorage.getItem(`participants_${eventId}`);
              if (fallbackData) {
                setParticipants(JSON.parse(fallbackData));
              }
            }
          );

          const unsubscribeTeams = onSnapshot(
            doc(db!, 'teams', eventId), 
            (doc) => {
              if (doc.exists()) {
                setTeams(doc.data()?.list || []);
                // Backup to localStorage
                localStorage.setItem(`teams_${eventId}`, JSON.stringify(doc.data()?.list || []));
              }
            },
            (error) => {
              console.warn('Teams listener error:', error);
              // Fallback to localStorage
              const fallbackData = localStorage.getItem(`teams_${eventId}`);
              if (fallbackData) {
                setTeams(JSON.parse(fallbackData));
              }
            }
          );

          setIsLoadingParticipants(false);

          return () => {
            unsubscribeParticipants();
            unsubscribeTeams();
          };
        } catch (error) {
          console.error('Firebase load failed, using localStorage:', error);
        }
      }

      // Fallback to localStorage
      const eventData = localStorage.getItem(`event_${eventId}`);
      if (eventData) {
        setEvent(JSON.parse(eventData));
      }

      const participantsData = localStorage.getItem(`participants_${eventId}`);
      if (participantsData) {
        setParticipants(JSON.parse(participantsData));
      }

      const teamsData = localStorage.getItem(`teams_${eventId}`);
      if (teamsData) {
        setTeams(JSON.parse(teamsData));
      }



      setIsLoadingParticipants(false);
    };

    loadData();

    // Listen for storage changes as additional fallback
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `participants_${eventId}` && e.newValue) {
        setParticipants(JSON.parse(e.newValue));
      }
      if (e.key === `teams_${eventId}` && e.newValue) {
        setTeams(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check for updates every 2 seconds as fallback
    const interval = setInterval(() => {
      if (!db) { // Only if not using Firebase
        const participantsData = localStorage.getItem(`participants_${eventId}`);
        if (participantsData) {
          const newParticipants = JSON.parse(participantsData);
          setParticipants(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(newParticipants)) {
              return newParticipants;
            }
            return prev;
          });
        }

        const teamsData = localStorage.getItem(`teams_${eventId}`);
        if (teamsData) {
          const newTeams = JSON.parse(teamsData);
          setTeams(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(newTeams)) {
              return newTeams;
            }
            return prev;
          });
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [eventId]);

  // Generate QR URL separately to avoid blocking main data load
  useEffect(() => {
    if (!eventId) return;
    
    const generateQR = async () => {
      const url = `${window.location.origin}/checkin/${eventId}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        setQrUrl(qrDataUrl);
        console.log('✅ QR code generated successfully');
      } catch (error) {
        console.error('❌ QR Code generation failed:', error);
        // Set a placeholder QR URL to prevent blocking
        setQrUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
      }
    };
    
    // Delay QR generation slightly to not block initial render
    const timer = setTimeout(generateQR, 100);
    return () => clearTimeout(timer);
  }, [eventId]);

  const assignTeams = async () => {
    console.log('assignTeams called', { numTeams, balanceType, participants });
    
    if (!eventId) return;

    // JDX algorithm implementation
    const teams = Array.from({ length: numTeams }, (_, i) => ({
      id: `team_${i + 1}`,
      name: `Team ${String.fromCharCode(65 + i)}`,
      color: ['blue', 'red', 'green', 'yellow', 'purple', 'orange'][i] || 'gray',
      members: [] as Participant[],
    }));

    let sortedParticipants = [...participants];
    if (balanceType === 'balanced' && participants.some(p => p.skill)) {
      sortedParticipants.sort((a, b) => (b.skill || 0) - (a.skill || 0));
    } else if (balanceType === 'random') {
      sortedParticipants = participants.sort(() => Math.random() - 0.5);
    } else if (balanceType === 'mixed') {
      // Mixed: balance first, then randomize within similar skill groups
      const skillGroups = sortedParticipants.reduce((groups, p) => {
        const skill = p.skill || 0;
        if (!groups[skill]) groups[skill] = [];
        groups[skill].push(p);
        return groups;
      }, {} as Record<number, Participant[]>);

      sortedParticipants = Object.values(skillGroups).flatMap(group =>
        group.sort(() => Math.random() - 0.5)
      );
    }

    sortedParticipants.forEach((p, index) => {
      const teamIndex = index % numTeams;
      teams[teamIndex].members.push(p);
    });

    console.log('Teams created:', teams);

    // Update participants with team assignment
    const updatedParticipants = participants.map(p => {
      const team = teams.find(t => t.members.some(m => m.id === p.id));
      return team ? { ...p, teamAssigned: team.name } : p;
    });

    // Save to Firebase or localStorage with retry logic
    if (db) {
      const maxRetries = 3;
      let retries = 0;
      
      const saveWithRetry = async (): Promise<void> => {
        try {
          await Promise.all([
            setDoc(doc(db!, 'teams', eventId), { list: teams.map(t => ({ ...t, updatedAt: new Date() })) }),
            setDoc(doc(db!, 'participants', eventId), { list: updatedParticipants })
          ]);
          console.log('✅ Saved to Firebase');
          
          // Also backup to localStorage
          localStorage.setItem(`teams_${eventId}`, JSON.stringify(teams.map(t => ({ ...t, updatedAt: new Date() }))));
          localStorage.setItem(`participants_${eventId}`, JSON.stringify(updatedParticipants));
        } catch (error) {
          retries++;
          console.warn(`Firebase save attempt ${retries} failed:`, error);
          
          if (retries < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            return saveWithRetry();
          } else {
            console.error('❌ Firebase save failed after all retries, using localStorage');
            // Final fallback to localStorage
            localStorage.setItem(`teams_${eventId}`, JSON.stringify(teams.map(t => ({ ...t, updatedAt: new Date() }))));
            localStorage.setItem(`participants_${eventId}`, JSON.stringify(updatedParticipants));
          }
        }
      };
      
      await saveWithRetry();
    } else {
      // Save to localStorage
      const teamsWithDate = teams.map(t => ({ ...t, updatedAt: new Date() }));
      localStorage.setItem(`teams_${eventId}`, JSON.stringify(teamsWithDate));
      localStorage.setItem(`participants_${eventId}`, JSON.stringify(updatedParticipants));
      console.log('Saved to localStorage');
    }

    setTeams(teams.map(t => ({ ...t, updatedAt: new Date() })));
    setParticipants(updatedParticipants);

    // Show success animation
    setAssignedTeamCount(numTeams);
    setShowTeamSuccess(true);

    toast({
      title: '팀 배정 완료',
      description: `${numTeams}팀으로 배정되었습니다.`,
    });
  };

  const checkAdmin = () => {
    if (adminToken === 'admin') {
      setIsAdmin(true);
      toast({
        title: '관리자 모드 활성화',
        description: '관리자 권한이 부여되었습니다.',
      });
    } else {
      toast({
        title: '토큰 오류',
        description: '올바른 관리자 토큰을 입력하세요.',
        variant: 'destructive',
      });
    }
  };

  if (!event) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4 relative">
        {/* Theme Toggle & Connection Status */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          <ConnectionIndicator />
          <ThemeToggle />
        </div>
        
        {/* Connection Status Notifications */}
        <ConnectionStatus />

        {/* Team Assignment Success Animation */}
        <TeamAssignmentSuccess
          isVisible={showTeamSuccess}
          teamCount={assignedTeamCount}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-6"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {event.name}
              </h1>
              <p className="text-gray-600 mt-1">{new Date(event.date).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-semibold">{participants.length}명 참가</span>
            </div>
            {teams.length > 0 && (
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <span className="font-semibold">{teams.length}팀 배정됨</span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Premium Invitation Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass" className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Image className="h-6 w-6 text-blue-500" />
                  프리미엄 초대장
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invitationImage ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="flex justify-center"
                  >
                    <div className="relative">
                      <img src={invitationImage} alt="Premium Invitation" className="w-full max-w-sm rounded-xl shadow-lg" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="w-48 h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">초대장 생성 중...</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={shareInvitation}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    공유하기
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadInvitation}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    다운로드
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    아름다운 초대장을 팀원들에게 공유하세요!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Assignment Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings className="h-6 w-6 text-purple-500" />
                  팀 배정 관리
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAdmin ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4" />
                      관리자 인증 필요
                    </div>
                    <Input
                      placeholder="관리자 토큰"
                      value={adminToken}
                      onChange={(e) => setAdminToken(e.target.value)}
                      type="password"
                      className="h-10"
                    />
                    <Button onClick={checkAdmin} variant="outline" className="w-full flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      관리자 모드 활성화
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">팀 수</label>
                        <select
                          value={numTeams}
                          onChange={(e) => setNumTeams(Number(e.target.value))}
                          className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {[2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>{n}팀</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">배정 방식</label>
                        <select
                          value={balanceType}
                          onChange={(e) => setBalanceType(e.target.value as 'balanced' | 'random' | 'mixed')}
                          className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="balanced">균형 배정</option>
                          <option value="random">랜덤 배정</option>
                          <option value="mixed">혼합 배정</option>
                        </select>
                      </div>
                    </div>
                    <Button 
                      onClick={assignTeams} 
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex items-center gap-2"
                      disabled={participants.length === 0}
                    >
                      <Trophy className="h-4 w-4" />
                      팀 배정 실행 {participants.length === 0 && '(참가자 없음)'}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Participants List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass" className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-green-500" />
                참가자 목록
                <span className="ml-auto text-sm font-normal text-gray-500">
                  {participants.length}명
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingParticipants && participants.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonParticipant key={index} />
                  ))}
                </div>
              ) : participants.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">아직 체크인한 참가자가 없습니다</p>
                  <p className="text-gray-400 text-sm">
                    QR 코드를 스캔하거나 수동으로 체크인해주세요
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map((p, index) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200"
                    >

                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {p.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{p.name}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(p.checkinAt).toLocaleTimeString('ko-KR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {p.skill && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">실력:</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {p.skill}
                            </span>
                          </div>
                        )}
                        {p.teamAssigned && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">팀:</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              {p.teamAssigned}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Results */}
        {teams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card variant="glass" className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  팀 배정 결과
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto flex items-center gap-2"
                    onClick={() => {
                      // Export functionality could be added here
                      toast({
                        title: '내보내기',
                        description: 'CSV 내보내기 기능은 추후 추가 예정입니다.',
                      });
                    }}
                  >
                    <Download className="h-4 w-4" />
                    내보내기
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`bg-gradient-to-br ${getTeamColor(team.color)} border border-opacity-20 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 ${getTeamColor(team.color)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                          {team.name.split(' ')[1]}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{team.name}</h3>
                          <p className="text-sm text-gray-600">{team.members.length}명</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {team.members.map((member) => (
                          <li key={member.id} className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                            <span className="font-medium text-gray-800">{member.name}</span>
                            {member.skill && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                {member.skill}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Helper function for team colors
const getTeamColor = (color: string) => {
  const colors = {
    blue: 'from-blue-400 to-blue-600',
    red: 'from-red-400 to-red-600',
    green: 'from-green-400 to-green-600',
    yellow: 'from-yellow-400 to-yellow-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
    gray: 'from-gray-400 to-gray-600'
  };
  return colors[color as keyof typeof colors] || colors.gray;
};

export default EventPage;