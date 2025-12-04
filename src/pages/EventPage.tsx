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
import { Users, Settings, Shield, Trophy, Download, Share2, Image, Calendar, Clock, MapPin, Target, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { TeamAssignmentSuccess } from '@/components/animated-feedback';
import { ConnectionStatus, ConnectionIndicator } from '@/components/connection-status';

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
  totalSkill?: number;
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

  // Helper function to generate QR code with better error handling
  const generateQRCode = async (url: string, options = {}) => {
    try {
      console.log('🔄 Generating QR code for URL:', url);

      // Validate URL format
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided for QR code generation');
      }

      // Check if URL is accessible
      try {
        new URL(url);
      } catch {
        throw new Error('Invalid URL format');
      }

      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M',
        ...options
      });

      console.log('✅ QR code generated successfully, data URL length:', qrDataUrl.length);
      return qrDataUrl;
    } catch (error) {
      console.error('❌ QR code generation failed:', error);

      // Return a simple placeholder SVG as fallback
      const fallbackSvg = `data:image/svg+xml;base64,${btoa(`
        <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="300" fill="#f9fafa"/>
          <text x="50%" y="40%" font-family="Arial" font-size="16" fill="#999999" text-anchor="middle">QR Code</text>
          <text x="50%" y="60%" font-family="Arial" font-size="14" fill="#999999" text-anchor="middle">Generation Failed</text>
          <text x="50%" y="75%" font-family="Arial" font-size="12" fill="#cccccc" text-anchor="middle">${url.substring(0, 30)}...</text>
        </svg>
      `)}`;

      return fallbackSvg;
    }
  };

  // Generate premium invitation card
  const generateInvitation = useCallback(async () => {
    console.log('Generating invitation...', { event, qrUrl });
    
    if (!event) {
      console.log('Missing event, skipping invitation generation');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Canvas context not available');
        return;
      }

      // Set canvas size for compact display
      canvas.width = 600;
      canvas.height = 800;

      // Create gradient background with beautiful two-tone colors
        const gradient = ctx.createLinearGradient(0, 0, 600, 800);
        gradient.addColorStop(0, '#3b82f6');    // Blue
        gradient.addColorStop(0.25, '#8b5cf6'); // Purple
        gradient.addColorStop(0.5, '#f472b6');  // Rose
        gradient.addColorStop(0.75, '#fbbf24'); // Amber
        gradient.addColorStop(1, '#f59e0b');    // Yellow      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 800);

      // Add decorative elements
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(30, 30, 540, 740);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText('🎉 이벤트 초대장 🎉', 300, 120);

      // Event title1 (main title)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.fillText(event.title1, 300, 180);

      // Event title2 (subtitle)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(event.title2, 300, 220);

      // Event date and time
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Arial';
      const dateStr = (() => {
        try {
          const date = new Date(event.date);
          return isNaN(date.getTime()) ? '날짜 정보 없음' : date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          });
        } catch {
          return '날짜 정보 없음';
        }
      })();
      ctx.fillText(`${dateStr} ${event.timeFrom}`, 300, 270);

      // Location
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText(`장소: ${event.location || '장소 정보 없음'}`, 300, 310);

      // Expected attendees
      ctx.fillStyle = '#ffffff';
      ctx.font = '22px Arial';
      ctx.fillText(`참석 예정 인원: ${event.expectedAttendees}명`, 300, 340);

      // Description
      ctx.fillStyle = '#ffffff';
      ctx.font = '22px Arial';
      ctx.fillText('참여를 원하시면 아래 QR 코드를 스캔하세요!', 300, 380);

      // Generate QR Code directly on canvas with better error handling
      console.log('Generating QR code on canvas...');
      try {
        const qrCanvas = document.createElement('canvas');
        const qrCtx = qrCanvas.getContext('2d');
        if (!qrCtx) {
          throw new Error('QR Canvas context not available');
        }

        const checkinUrl = `${window.location.origin}/checkin/${eventId}`;
        console.log('QR URL for invitation:', checkinUrl);

        await QRCode.toCanvas(qrCanvas, checkinUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });

        // Draw QR code on main canvas
        ctx.drawImage(qrCanvas, 200, 420, 200, 200);
        console.log('✅ QR code drawn on canvas successfully');
      } catch (qrError) {
        console.error('❌ QR generation on canvas failed:', qrError);
        // Draw placeholder text instead
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR 코드 생성에 실패했습니다', 300, 500);
        ctx.fillText('아래 URL을 직접 복사하여 사용하세요:', 300, 525);
        ctx.fillText(`${window.location.origin}/checkin/${eventId}`, 300, 550);
        ctx.fillText('모바일 브라우저에서 접속 가능합니다', 300, 575);

        // Also show toast notification
        toast({
          title: 'QR 코드 생성 실패',
          description: '초대장 이미지에 QR코드를 포함할 수 없습니다. URL을 직접 공유해주세요.',
          variant: 'destructive',
        });
      }

      // Instructions
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('📱 모바일로 QR 코드를 스캔하여', 300, 650);
      ctx.fillText('체크인하세요!', 300, 680);

      // Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '16px Arial';
      ctx.fillText('Powered by QR Check-in System', 300, 750);

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

        canvas.width = 600;
        canvas.height = 800;

        const gradient = ctx.createLinearGradient(0, 0, 600, 800);
        gradient.addColorStop(0, '#3b82f6');    // Blue
        gradient.addColorStop(0.25, '#8b5cf6'); // Purple
        gradient.addColorStop(0.5, '#f472b6');  // Rose
        gradient.addColorStop(0.75, '#fbbf24'); // Amber
        gradient.addColorStop(1, '#f59e0b');    // Yellow

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 800);

        // Add semi-transparent overlay for better text readability
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, 600, 800);

        // Add semi-transparent overlay for better text readability
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, 600, 800);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(30, 30, 540, 740);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText('🎉 이벤트 초대장 🎉', 300, 100);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(event.title1, 300, 140);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(event.title2, 300, 170);

        ctx.fillStyle = '#ffffff';
        ctx.font = '28px Arial';
        const fallbackDateStr = (() => {
          try {
            const date = new Date(event.date);
            return isNaN(date.getTime()) ? '날짜 정보 없음' : date.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            });
          } catch {
            return '날짜 정보 없음';
          }
        })();
        ctx.fillText(`${fallbackDateStr} ${event.timeFrom}`, 300, 200);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`장소: ${event.location || '장소 정보 없음'}`, 300, 230);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`참석 예정 인원: ${event.expectedAttendees}명`, 300, 260);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText('QR 코드 생성 실패 - 수동 체크인 필요', 300, 400);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '18px Arial';
        ctx.fillText('Powered by QR Check-in System', 300, 600);

        const imageData = canvas.toDataURL('image/png', 0.9);
        setInvitationImage(imageData);
      } catch (fallbackError) {
        console.error('Fallback invitation generation also failed:', fallbackError);
      }
    }
  }, [event, eventId, qrUrl]);

  // Share invitation
  const shareInvitation = async () => {
    if (!invitationImage || !event) return;

    const shareData = {
      title: `${event.title1} ${event.title2} - 이벤트 초대장`,
      text: `${event.title1} ${event.title2} 이벤트에 초대합니다! QR 코드를 스캔하여 참여하세요.`,
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
    if (!invitationImage || !event) return;

    const link = document.createElement('a');
    link.download = `${event.title1}_${event.title2}_초대장.png`;
    link.href = invitationImage;
    link.click();

    toast({
      title: '다운로드 완료',
      description: '초대장 이미지가 저장되었습니다.',
    });
  };

  // Generate invitation on mount
  useEffect(() => {
    if (event && !invitationImage) {
      console.log('Starting invitation generation...');
      // Use requestAnimationFrame to avoid synchronous state update
      const animationFrame = requestAnimationFrame(() => {
        generateInvitation().catch(err => {
          console.error('Invitation generation failed:', err);
        });
      });
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [event, invitationImage, generateInvitation]);

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
                const participantsData = doc.data()?.list || [];
                console.log('📡 Real-time participants update from Firebase:', participantsData.length, 'participants');
                setParticipants(participantsData);
                // Backup to localStorage
                localStorage.setItem(`participants_${eventId}`, JSON.stringify(participantsData));
              } else {
                console.log('📡 No participants document found in Firebase');
              }
            },
            (error) => {
              console.warn('❌ Participants listener error:', error);
              // Fallback to localStorage
              const fallbackData = localStorage.getItem(`participants_${eventId}`);
              if (fallbackData) {
                const participantsData = JSON.parse(fallbackData);
                console.log('📱 Loaded participants from localStorage fallback:', participantsData.length);
                setParticipants(participantsData);
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
      const qrDataUrl = await generateQRCode(url);
      setQrUrl(qrDataUrl);
    };

    // Delay QR generation slightly to not block initial render
    const timer = setTimeout(generateQR, 100);
    return () => clearTimeout(timer);
  }, [eventId]);  const assignTeams = async () => {
    console.log('assignTeams called', { numTeams, balanceType, participants });
    
    if (!eventId) return;

    // 멋진 팀 이름들
    const teamNames = [
      '불꽃 드래곤즈', '천둥 매들러스', '얼음 울프스', '바람 이글스', '대지 베어스',
      '번개 타이거즈', '화산 라이언즈', '폭풍 팬더스', '별빛 울브스', '달빛 폭스',
      '태양 워리어즈', '달 워리어즈', '별 워리어즈', '숲의 수호자들', '바다의 수호자들',
      '산의 수호자들', '불의 수호자들', '얼음의 수호자들', '바람의 수호자들', '대지의 수호자들'
    ];

    // 팀 초기화
    const teams = Array.from({ length: numTeams }, (_, i) => ({
      id: `team_${i + 1}`,
      name: teamNames[i] || `팀 ${String.fromCharCode(65 + i)}`,
      color: ['blue', 'red', 'green', 'yellow', 'purple', 'orange'][i] || 'gray',
      members: [] as Participant[],
      totalSkill: 0,
    }));

    const allParticipants = [...participants];

    // 1단계: 인원 수 기반 기본 배정
    const totalParticipants = allParticipants.length;
    const baseMembersPerTeam = Math.floor(totalParticipants / numTeams); // 몫
    const remainder = totalParticipants % numTeams; // 나머지 (깍뚜기 팀 수)

    console.log(`총 ${totalParticipants}명, ${numTeams}팀, 각 팀 기본 ${baseMembersPerTeam}명, 깍뚜기 ${remainder}팀`);

    // 참가자들을 랜덤하게 섞기 (공정한 배정을 위해)
    allParticipants.sort(() => Math.random() - 0.5);

    let participantIndex = 0;

    // 각 팀에 기본 인원 배정
    for (let teamIndex = 0; teamIndex < numTeams; teamIndex++) {
      const membersForThisTeam = baseMembersPerTeam + (teamIndex < remainder ? 1 : 0); // 깍뚜기 팀은 +1
      
      for (let i = 0; i < membersForThisTeam && participantIndex < totalParticipants; i++) {
        const participant = allParticipants[participantIndex];
        teams[teamIndex].members.push(participant);
        teams[teamIndex].totalSkill += participant.skill || 0;
        participantIndex++;
      }
    }

    console.log('기본 배정 후 팀 상태:', teams.map(t => ({ name: t.name, count: t.members.length, totalSkill: t.totalSkill })));

    // 2단계: 실력 균형 맞추기 (balanceType에 따라)
    if (balanceType === 'balanced') {
      // 실력 점수 기반 균형 맞추기
      const maxIterations = 50; // 무한 루프 방지
      let iterations = 0;
      let hasChanges = true;

      while (hasChanges && iterations < maxIterations) {
        hasChanges = false;
        iterations++;

        // 각 팀의 평균 실력 계산
        const teamAverages = teams.map(team => {
          const skillSum = team.members.reduce((sum, p) => sum + (p.skill || 0), 0);
          return skillSum / team.members.length;
        });

        // 가장 실력이 높은 팀과 낮은 팀 찾기
        let maxAvgIndex = 0;
        let minAvgIndex = 0;
        let maxAvg = teamAverages[0];
        let minAvg = teamAverages[0];

        for (let i = 1; i < teams.length; i++) {
          if (teamAverages[i] > maxAvg) {
            maxAvg = teamAverages[i];
            maxAvgIndex = i;
          }
          if (teamAverages[i] < minAvg) {
            minAvg = teamAverages[i];
            minAvgIndex = i;
          }
        }

        // 실력 차이가 2점 이상 나면 교환 시도
        if (maxAvg - minAvg >= 2) {
          const highTeam = teams[maxAvgIndex];
          const lowTeam = teams[minAvgIndex];

          // 높은 팀에서 낮은 실력자를, 낮은 팀에서 높은 실력자를 찾아 교환
          let bestSwap = null;
          let bestImprovement = 0;

          for (const highMember of highTeam.members) {
            for (const lowMember of lowTeam.members) {
              const highSkill = highMember.skill || 0;
              const lowSkill = lowMember.skill || 0;

              if (highSkill > lowSkill) {
                // 교환 후 평균 차이 계산
                const newHighAvg = (teamAverages[maxAvgIndex] * highTeam.members.length - highSkill + lowSkill) / highTeam.members.length;
                const newLowAvg = (teamAverages[minAvgIndex] * lowTeam.members.length - lowSkill + highSkill) / lowTeam.members.length;
                const improvement = (maxAvg - minAvg) - Math.abs(newHighAvg - newLowAvg);

                if (improvement > bestImprovement) {
                  bestImprovement = improvement;
                  bestSwap = { highMember, lowMember };
                }
              }
            }
          }

          // 최적 교환 실행
          if (bestSwap) {
            const { highMember, lowMember } = bestSwap;
            
            // 멤버 교환
            const highIndex = highTeam.members.indexOf(highMember);
            const lowIndex = lowTeam.members.indexOf(lowMember);
            
            highTeam.members[highIndex] = lowMember;
            lowTeam.members[lowIndex] = highMember;
            
            // 실력 합계 업데이트
            highTeam.totalSkill = highTeam.totalSkill - (highMember.skill || 0) + (lowMember.skill || 0);
            lowTeam.totalSkill = lowTeam.totalSkill - (lowMember.skill || 0) + (highMember.skill || 0);
            
            hasChanges = true;
            console.log(`교환 실행: ${highMember.name} ↔ ${lowMember.name}, 개선도: ${bestImprovement.toFixed(2)}`);
          }
        }
      }

      console.log(`균형 맞추기 완료: ${iterations}회 반복`);
    } else if (balanceType === 'random') {
      // 이미 랜덤하게 배정되어 있으므로 추가 작업 없음
    } else if (balanceType === 'mixed') {
      // 혼합 배정: 실력 그룹별로 재배치
      const skillGroups = allParticipants.reduce((groups, p) => {
        const skill = p.skill || 0;
        const groupKey = Math.floor(skill / 3) * 3; // 3점 단위로 그룹화
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(p);
        return groups;
      }, {} as Record<number, Participant[]>);

      // 각 그룹을 팀별로 고르게 분배
      Object.values(skillGroups).forEach(group => {
        group.sort(() => Math.random() - 0.5);
        
        group.forEach((participant, index) => {
          const teamIndex = index % numTeams;
          // 기존 팀에서 제거
          const oldTeamIndex = teams.findIndex(t => t.members.some(m => m.id === participant.id));
          if (oldTeamIndex !== -1) {
            teams[oldTeamIndex].members = teams[oldTeamIndex].members.filter(m => m.id !== participant.id);
            teams[oldTeamIndex].totalSkill -= participant.skill || 0;
          }
          
          // 새 팀에 추가
          teams[teamIndex].members.push(participant);
          teams[teamIndex].totalSkill += participant.skill || 0;
        });
      });
    }

    console.log('최종 팀 배정 결과:', teams.map(t => ({ 
      name: t.name, 
      count: t.members.length, 
      totalSkill: t.totalSkill,
      avgSkill: t.members.length > 0 ? (t.totalSkill / t.members.length).toFixed(1) : '0'
    })));

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

  // Export teams to CSV
  const exportToCSV = () => {
    if (teams.length === 0 || !event) {
      toast({
        title: '내보내기 실패',
        description: '배정된 팀이 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    // Create CSV content
    const csvRows = [
      ['팀 이름', '참가자 이름', '실력 점수', '전화번호', '체크인 시간']
    ];

    teams.forEach(team => {
      team.members.forEach(member => {
        csvRows.push([
          team.name,
          member.name,
          member.skill?.toString() || '',
          member.phone || '',
          new Date(member.checkinAt).toLocaleString('ko-KR')
        ]);
      });
    });

    // Convert to CSV string
    const csvContent = csvRows.map(row => 
      row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.title1}_${event.title2}_팀배정결과.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '내보내기 완료',
      description: '팀 배정 결과가 CSV 파일로 저장되었습니다.',
    });
  };

  // Share to KakaoTalk
  const shareToKakaoTalk = () => {
    if (!event) return;
    const shareUrl = window.location.href;
    const shareText = `${event.title1} ${event.title2} 이벤트 팀 배정 결과가 나왔어요!\n\n${shareUrl}`;

    if (navigator.share && navigator.canShare({ url: shareUrl, text: shareText })) {
      navigator.share({
        title: `${event.title1} ${event.title2} - 팀 배정 결과`,
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: '링크 복사됨',
          description: '카카오톡 공유 링크가 클립보드에 복사되었습니다.',
        });
      });
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(shareText);
      toast({
        title: '링크 복사됨',
        description: '카카오톡 공유 링크가 클립보드에 복사되었습니다.',
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 relative overflow-x-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/8 to-indigo-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-indigo-400/6 to-blue-400/6 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, #8b5cf6 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>

      {/* Floating accent elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-60"></div>
      <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-300 opacity-60"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping delay-500 opacity-60"></div>
      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-6 md:px-4 md:py-8 max-w-7xl">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          {/* Hero Section with Glass Effect */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-xl">
                    <Trophy className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {event.title1}
                  </h1>
                  <h2 className="text-xl md:text-3xl font-semibold text-gray-700 mb-3">
                    {event.title2}
                  </h2>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">
                        {(() => {
                          try {
                            const date = new Date(event.date);
                            return isNaN(date.getTime()) ? '날짜 정보 없음' : date.toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'long'
                            });
                          } catch {
                            return '날짜 정보 없음';
                          }
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">{event.timeFrom}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
              >
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">참가 현황</p>
                      <p className="text-2xl font-bold text-blue-700">{participants.length}/{event.expectedAttendees}명</p>
                    </div>
                  </div>
                </div>
                {teams.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 font-medium">팀 배정</p>
                        <p className="text-2xl font-bold text-purple-700">{teams.length}팀</p>
                      </div>
                    </div>
                  </div>
                )}
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
            </div>
          </div>
        </motion.div>

        {/* Top Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4 mb-6 md:mb-8"
        >
          <ConnectionIndicator />
          <ThemeToggle />
        </motion.div>

        {/* Connection Status & Success Animation */}
        <ConnectionStatus />
        <TeamAssignmentSuccess
          isVisible={showTeamSuccess}
          teamCount={assignedTeamCount}
          onComplete={() => setShowTeamSuccess(false)}
        />

        {/* Main Content Grid */}
        <div className="space-y-8">
          {/* Featured Invitation Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl blur-2xl"></div>
              <Card className="relative bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-8 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center justify-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-30"></div>
                      <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                        <Image className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        프리미엄 초대장
                      </CardTitle>
                      <p className="text-gray-600 mt-1">아름다운 디자인으로 특별한 순간을 공유하세요</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {invitationImage ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1, duration: 0.6 }}
                      className="flex justify-center mb-8"
                    >
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative rounded-2xl shadow-2xl overflow-hidden group-hover:shadow-3xl transition-all duration-500">
                          <img src={invitationImage} alt="Premium Invitation" className="w-full max-w-sm md:max-w-lg rounded-2xl" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="flex justify-center py-12"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative w-56 h-72 md:w-64 md:h-80 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-xl">
                          <div className="text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 font-medium">초대장 생성 중...</p>
                            <p className="text-xs text-gray-400 mt-1">잠시만 기다려주세요</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4"
                  >
                    <Button
                      onClick={shareInvitation}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3 md:py-3 h-12 text-sm md:text-base font-medium"
                    >
                      <Share2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      초대장 공유하기
                    </Button>
                    <Button
                      onClick={downloadInvitation}
                      variant="outline"
                      className="flex-1 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3 md:py-3 h-12 text-sm md:text-base font-medium"
                    >
                      <Download className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      이미지 다운로드
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Management Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Team Management Card */}
              <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
                      <Settings className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-800">팀 배정 관리</div>
                      <div className="text-sm text-gray-600 font-normal">스마트한 팀 구성으로 완벽한 이벤트</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!isAdmin ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="text-center py-8">
                        <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">관리자 인증 필요</h3>
                        <p className="text-gray-500 text-sm mb-6">팀 배정을 위해 관리자 권한이 필요합니다</p>
                      </div>
                      <div className="space-y-3">
                        <Input
                          placeholder="관리자 토큰을 입력하세요"
                          value={adminToken}
                          onChange={(e) => setAdminToken(e.target.value)}
                          type="password"
                          className="h-12 text-center text-lg rounded-xl border-2 border-gray-200 focus:border-purple-300"
                        />
                        <Button
                          onClick={checkAdmin}
                          className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Shield className="h-5 w-5 mr-2" />
                          관리자 모드 활성화
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            팀 수
                          </label>
                          <select
                            value={numTeams}
                            onChange={(e) => setNumTeams(Number(e.target.value))}
                            className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 text-center font-medium"
                          >
                            {[2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>{n}팀</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            배정 방식
                          </label>
                          <select
                            value={balanceType}
                            onChange={(e) => setBalanceType(e.target.value as 'balanced' | 'random' | 'mixed')}
                            className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 text-center font-medium"
                          >
                            <option value="balanced">균형 배정</option>
                            <option value="random">랜덤 배정</option>
                            <option value="mixed">혼합 배정</option>
                          </select>
                        </div>
                      </div>
                      <Button
                        onClick={assignTeams}
                        disabled={participants.length === 0}
                        className="w-full h-12 md:h-16 text-base md:text-xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transform-gpu transition-all duration-300 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <Trophy className="h-7 w-7 mr-3" />
                        팀 배정 실행
                        {participants.length === 0 && ' (참가자 없음)'}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Participants Overview Card */}
              <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-800">참가자 현황</div>
                      <div className="text-sm text-gray-600 font-normal">실시간 참가자 관리 및 모니터링</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{participants.length}</span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800">총 참가자</p>
                        <p className="text-sm text-gray-600">목표: {event.expectedAttendees}명</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl md:text-3xl font-bold text-green-600">{Math.round((participants.length / event.expectedAttendees) * 100)}%</div>
                      <div className="text-sm text-gray-600">달성률</div>
                    </div>
                  </div>

                  {participants.length > 0 && (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {participants.slice(0, 5).map((p, index) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {p.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-500">
                              {(() => {
                                try {
                                  const date = new Date(p.checkinAt);
                                  return isNaN(date.getTime()) ? '시간 정보 없음' : date.toLocaleTimeString('ko-KR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                } catch {
                                  return '시간 정보 없음';
                                }
                              })()}
                            </p>
                          </div>
                          {p.skill && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              Lv.{p.skill}
                            </span>
                          )}
                        </motion.div>
                      ))}
                      {participants.length > 5 && (
                        <div className="text-center py-2">
                          <span className="text-sm text-gray-500">외 {participants.length - 5}명...</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Participants List Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500">
              <CardHeader className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3 sm:gap-4 text-2xl sm:text-3xl font-bold">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-800 text-xl sm:text-2xl md:text-3xl font-bold">참가자 목록</div>
                    <div className="text-xs sm:text-sm text-gray-600 font-normal">참가자들의 실시간 체크인 현황</div>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-bold shadow-lg">
                      {participants.length}명
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 md:p-8">
                {isLoadingParticipants && participants.length === 0 ? (
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 animate-pulse">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-3 sm:h-4 bg-gray-300 rounded mb-1 sm:mb-2"></div>
                            <div className="h-2 sm:h-3 bg-gray-300 rounded w-3/4"></div>
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <div className="h-4 sm:h-5 md:h-6 bg-gray-300 rounded-full flex-1"></div>
                          <div className="h-4 sm:h-5 md:h-6 bg-gray-300 rounded-full w-12 sm:w-16 md:w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : participants.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-2xl opacity-30"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Users className="h-12 w-12 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">아직 체크인한 참가자가 없습니다</h3>
                    <p className="text-gray-500 text-lg mb-2">QR 코드를 스캔하거나 수동으로 체크인해주세요</p>
                    <p className="text-gray-400 text-sm">참가자들이 도착하면 실시간으로 목록이 업데이트됩니다</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {participants.map((p, index) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        className="group bg-gradient-to-br from-white via-gray-50 to-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg border border-gray-200/50 hover:shadow-2xl hover:border-emerald-200/50 transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] transform-gpu"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                            <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg shadow-lg">
                              {p.name.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 group-hover:text-emerald-700 transition-colors duration-300 break-words hyphens-auto text-justify leading-tight">{p.name}</h3>
                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                              <span className="break-words hyphens-auto text-justify leading-tight">
                                {(() => {
                                  try {
                                    const date = new Date(p.checkinAt);
                                    return isNaN(date.getTime()) ? '시간 정보 없음' : date.toLocaleTimeString('ko-KR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    });
                                  } catch {
                                    return '시간 정보 없음';
                                  }
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-wrap">
                          {p.skill && (
                            <span className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-xs sm:text-sm font-semibold border border-blue-300/50 whitespace-nowrap">
                              ⚡ Lv.{p.skill}
                            </span>
                          )}
                          {p.teamAssigned && (
                            <span className="px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-xs sm:text-sm font-semibold border border-purple-300/50 whitespace-nowrap">
                              🏆 {p.teamAssigned}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Results Section */}
          {teams.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-4 text-3xl font-bold">
                      <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-800">팀 배정 결과</div>
                        <div className="text-sm text-gray-600 font-normal">완벽하게 구성된 팀을 확인하세요</div>
                      </div>
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareToKakaoTalk}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-10 px-4 text-sm font-medium"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        공유
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-10 px-4 text-sm font-medium"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        내보내기
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team, index) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={`relative bg-gradient-to-br ${getTeamColor(team.color)} border border-opacity-20 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                            <div className={`w-12 h-12 md:w-16 md:h-16 ${getTeamColor(team.color)} rounded-2xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg`}>
                              {team.name.split(' ')[1]}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-1">{team.name}</h3>
                              <p className="text-gray-600 font-medium text-sm md:text-base">{team.members.length}명 • 평균 Lv.{team.members.length > 0 ? Math.round((team.totalSkill || 0) / team.members.length) : 0}</p>
                            </div>
                          </div>
                          <ul className="space-y-2 md:space-y-3">
                            {team.members.map((member) => (
                              <li key={member.id} className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 hover:bg-white/80 transition-all duration-200">
                                <span className="font-semibold text-gray-800 text-sm md:text-base">{member.name}</span>
                                {member.skill && (
                                  <span className="px-2 md:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs md:text-sm font-medium">
                                    Lv.{member.skill}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
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