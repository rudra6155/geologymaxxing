'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Question } from '@/lib/types';
import Link from 'next/link';

interface LiveParticipantViewProps {
  initialQuestions: Question[];
  roomCode: string;
}

export function LiveParticipantView({ initialQuestions, roomCode }: LiveParticipantViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [participant, setParticipant] = useState<any>(null);
  const [sessionState, setSessionState] = useState<{
    id: string;
    status: string;
    current_question_index: number;
  } | null>(null);
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Hydrate participant & load initial session state
  useEffect(() => {
    const raw = sessionStorage.getItem(`live_participant_${roomCode}`);
    if (!raw) {
      router.replace('/live');
      return;
    }
    
    try {
      const p = JSON.parse(raw);
      setParticipant(p);
      
      // Fetch initial session state and answers
      const init = async () => {
        const { data: sData } = await supabase.from('live_sessions').select('id, status, current_question_index').eq('room_code', roomCode).single();
        if (sData) setSessionState(sData);

        const { data: pData } = await supabase.from('session_participants').select('id, display_name, score').eq('session_id', sData?.id);
        if (pData) setLeaderboard(pData);

        // Fetch past answers
        if (sData) {
          const { data: aData } = await supabase.rpc('get_participant_answers', {
            p_participant_id: p.id,
            p_participant_token: p.participant_token
          });
          if (aData) {
            const map: Record<string, string> = {};
            (aData as any[]).forEach(a => {
              map[a.question_id] = a.selected_answer;
            });
            setSubmittedAnswers(map);
          }
        }
      };
      
      init();
    } catch (e) {
      router.replace('/live');
    }
  }, [roomCode, router, supabase]);

  // 2. Realtime Subscriptions
  useEffect(() => {
    if (!sessionState?.id) return;

    const channel = supabase.channel(`participant-${sessionState.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_sessions', filter: `id=eq.${sessionState.id}` }, (payload) => {
        setSessionState(prev => prev ? { ...prev, status: payload.new.status, current_question_index: payload.new.current_question_index } : null);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${sessionState.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLeaderboard(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setLeaderboard(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        } else if (payload.eventType === 'DELETE') {
          setLeaderboard(prev => prev.filter(p => p.id !== payload.old.id));
          // If we got kicked
          if (payload.old.id === participant?.id) {
            sessionStorage.removeItem(`live_participant_${roomCode}`);
            router.replace('/live');
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionState?.id, participant?.id, roomCode, router, supabase]);

  const handleSubmit = async (q: Question, optionId: string) => {
    if (submitting || submittedAnswers[q.id] || !sessionState) return;
    setSubmitting(true);
    setError(null);
    
    // Optimistic UI
    setSubmittedAnswers(prev => ({ ...prev, [q.id]: optionId }));

    try {
      const isCorrect = Array.isArray(q.correct) ? q.correct.includes(optionId) : q.correct === optionId;
      await supabase.rpc('submit_live_answer', {
        p_session_id: sessionState.id,
        p_participant_id: participant.id,
        p_participant_token: participant.participant_token,
        p_question_id: q.id,
        p_selected_answer: optionId,
        p_is_correct: isCorrect
      });
    } catch (err: any) {
      setError('Failed to submit answer. Check connection.');
      setSubmittedAnswers(prev => {
        const next = { ...prev };
        delete next[q.id];
        return next;
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!participant || !sessionState) {
    return <main className="min-h-dvh flex items-center justify-center bg-basalt"><div className="animate-pulse w-8 h-8 rounded-full bg-fieldnote-lighter"></div></main>;
  }

  // --- WAITING ROOM ---
  if (sessionState.status === 'waiting') {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-6 text-center bg-basalt">
        <div className="w-16 h-16 rounded-full bg-fieldnote-lighter/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-core animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-chalk mb-2" style={{ fontFamily: 'var(--font-display)' }}>You&apos;re in!</h1>
        <p className="text-chalk-muted text-sm" style={{ fontFamily: 'var(--font-mono)' }}>Waiting for the host to start...</p>
        <div className="mt-12 text-xs font-bold uppercase tracking-widest text-chalk-dim" style={{ fontFamily: 'var(--font-mono)' }}>
          Joined as <span className="text-chalk">{participant.display_name}</span>
        </div>
      </main>
    );
  }

  // --- ACTIVE QUIZ ---
  if (sessionState.status === 'active') {
    const qIndex = sessionState.current_question_index;
    const question = initialQuestions[qIndex];
    const hasAnswered = submittedAnswers[question?.id];
    
    // Sort leaderboard top 5 for the live ticker
    const sortedBoard = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 5);

    return (
      <main className="min-h-dvh flex flex-col bg-basalt">
        {/* Top Header / Leaderboard ticker */}
        <header className="px-4 py-3 border-b border-basalt-lighter/50 flex items-center justify-between bg-fieldnote sticky top-0 z-10">
          <div className="text-xs font-bold text-chalk-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            Q{qIndex + 1}/{initialQuestions.length}
          </div>
          <div className="flex gap-4 overflow-hidden">
            {sortedBoard.map((p, i) => (
              <div key={p.id} className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
                <span className={`text-[10px] font-black ${i === 0 ? 'text-core' : 'text-chalk-muted'}`}>#{i+1}</span>
                <span className="text-xs font-medium text-chalk truncate max-w-[60px]">{p.display_name}</span>
                <span className="text-[10px] text-chalk-dim">{p.score}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 flex flex-col justify-center max-w-lg mx-auto w-full">
          {error && <div className="mb-4 p-3 bg-oxide/10 text-oxide rounded-lg text-sm">{error}</div>}
          
          <h2 className="text-xl md:text-2xl font-medium text-chalk leading-relaxed mb-8" style={{ fontFamily: 'var(--font-display)' }}>
            {question.prompt}
          </h2>

          <div className="space-y-3">
            {question.options?.map(opt => {
              const isSelected = hasAnswered === opt.id;
              // If answered, we lock all buttons and highlight the selected one
              return (
                <button
                  key={opt.id}
                  disabled={!!hasAnswered || submitting}
                  onClick={() => handleSubmit(question, opt.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
                    isSelected 
                      ? 'bg-core/10 border-core text-chalk ring-2 ring-core/30'
                      : hasAnswered
                        ? 'bg-basalt-light/50 border-transparent text-chalk-muted opacity-50'
                        : 'bg-fieldnote border-fieldnote-lighter/50 text-chalk hover:border-chalk/30'
                  }`}
                >
                  <span className="text-lg">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {hasAnswered && (
             <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="inline-flex items-center gap-2 text-sm font-medium text-chalk-muted px-4 py-2 bg-fieldnote rounded-full border border-fieldnote-lighter/50">
                 <svg className="w-4 h-4 animate-spin text-core" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Waiting for next question
               </div>
             </div>
          )}
        </div>
      </main>
    );
  }

  // --- ENDED ---
  const myScore = leaderboard.find(p => p.id === participant.id)?.score || 0;
  const rank = [...leaderboard].sort((a, b) => b.score - a.score).findIndex(p => p.id === participant.id) + 1;
  const isPodium = rank <= 3;

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 text-center bg-basalt">
      <h1 className="text-3xl font-bold text-chalk mb-2" style={{ fontFamily: 'var(--font-display)' }}>Session Complete</h1>
      
      <div className={`mt-8 w-full max-w-sm rounded-3xl p-8 border ${isPodium ? 'bg-core/5 border-core/20 ring-1 ring-core/10' : 'bg-fieldnote border-fieldnote-lighter/50'}`}>
        <div className="text-sm font-bold uppercase tracking-widest text-chalk-muted mb-6" style={{ fontFamily: 'var(--font-mono)' }}>Your Result</div>
        
        <div className="flex items-end justify-center gap-2 mb-2">
          <span className={`text-6xl font-black ${isPodium ? 'text-core' : 'text-chalk'}`} style={{ fontFamily: 'var(--font-mono)' }}>{myScore}</span>
          <span className="text-xl text-chalk-muted pb-1 font-medium">/ {initialQuestions.length}</span>
        </div>
        
        <div className="mt-8 text-sm font-medium text-chalk-dim" style={{ fontFamily: 'var(--font-mono)' }}>
          Ranked <span className="text-chalk font-bold">#{rank}</span> of {leaderboard.length}
        </div>
      </div>

      <Link href="/12" className="mt-12 px-6 py-3 text-chalk border border-chalk/30 rounded-xl hover:bg-chalk/10 transition-colors">
        Back to Syllabus
      </Link>
    </main>
  );
}
