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
        ctx.fillText((() => {
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
        })(), 400, 270);

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

    let allParticipants = [...participants];

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
    if (teams.length === 0) {
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
    link.setAttribute('download', `${event?.name}_팀배정결과.csv`);
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
    const shareUrl = window.location.href;
    const shareText = `${event?.name} 이벤트 팀 배정 결과가 나왔어요!\n\n${shareUrl}`;

    if (navigator.share && navigator.canShare({ url: shareUrl, text: shareText })) {
      navigator.share({
        title: `${event?.name} - 팀 배정 결과`,
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
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 relative" style={{ minHeight: '100vh', height: '100vh' }}>
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-10 left-10 w-48 h-48 bg-slate-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-blue-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-20 w-36 h-36 bg-slate-400 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-2xl animate-bounce delay-700"></div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-slate-400 rounded-full animate-ping"></div>
      <div className="absolute top-3/4 right-1/4 w-4 h-4 bg-blue-400 rounded-full animate-ping delay-300"></div>
      <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-ping delay-500"></div>
      <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5 bg-slate-500 rounded-full animate-ping delay-800"></div>
      <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping delay-1200"></div>
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: '90vh' }}>
          <div className="overflow-y-auto p-6" style={{ maxHeight: '90vh' }}>
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
          onComplete={() => setShowTeamSuccess(false)}
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
              <p className="text-gray-600 mt-1">
                {(() => {
                  try {
                    const date = new Date(event.date);
                    return isNaN(date.getTime()) ? '날짜 정보 없음' : date.toLocaleDateString('ko-KR');
                  } catch {
                    return '날짜 정보 없음';
                  }
                })()}
              </p>
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
            <Card variant="glass" className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl relative overflow-hidden rounded-3xl hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                    <Image className="h-6 w-6 text-white" />
                  </div>
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
            <Card variant="glass" className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl relative overflow-hidden rounded-3xl hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
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
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transform-gpu flex items-center gap-3 disabled:hover:scale-100 rounded-2xl"
                      disabled={participants.length === 0}
                    >
                      <Trophy className="h-6 w-6" />
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
          <Card variant="glass" className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl relative overflow-hidden rounded-3xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                참가자 목록
                <span className="ml-auto text-lg font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
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
            <Card variant="glass" className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl relative overflow-hidden rounded-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  팀 배정 결과
                  <div className="ml-auto flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 rounded-xl shadow-lg"
                      onClick={shareToKakaoTalk}
                    >
                      <Share2 className="h-4 w-4" />
                      카톡 공유
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 rounded-xl shadow-lg"
                      onClick={exportToCSV}
                    >
                      <Download className="h-4 w-4" />
                      CSV 내보내기
                    </Button>
                  </div>
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