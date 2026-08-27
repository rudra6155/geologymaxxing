'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Chapter, Topic, Question } from '@/lib/types';
import Link from 'next/link';

interface LiveHostViewProps {
  chapter: Chapter;
}

export function LiveHostView({ chapter }: LiveHostViewProps) {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [session, setSession] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Derived Quiz Questions (max 8)
  const topicQuestions = selectedTopic 
    ? chapter.questions.filter(q => q.topicId === selectedTopic.id && q.phoneFriendly).slice(0, 8)
    : [];

  useEffect(() => {
    // Recover session from storage if it exists for this chapter
    const raw = sessionStorage.getItem(`live_host_session_${chapter.slug}`);
    if (raw) {
      try {
        const recovered = JSON.parse(raw);
        setSession(recovered.session);
        
        // Find the topic in the chapter object so we can recover selectedTopic
        const topic = chapter.topics.find(t => t.id === recovered.session.topic_id);
        if (topic) {
          setSelectedTopic(topic);
        }

        // Fetch current participants to recover the list
        supabase.from('session_participants')
          .select('*')
          .eq('session_id', recovered.session.id)
          .then(({ data }) => {
            if (data) setParticipants(data);
          });
      } catch (e) {
        sessionStorage.removeItem(`live_host_session_${chapter.slug}`);
      }
    }
  }, [chapter.slug, chapter.topics, supabase]);

  useEffect(() => {
    if (!session) return;

    // Subscribe to participants table for this session
    const channel = supabase.channel(`host-${session.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${session.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setParticipants(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setParticipants(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
          } else if (payload.eventType === 'DELETE') {
            setParticipants(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, supabase]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleStartSession = async (topic: Topic) => {
    setLoading(true);
    setError(null);
    try {
      const code = generateRoomCode();
      const { data, error: rpcError } = await supabase.rpc('create_live_session', {
        p_room_code: code,
        p_chapter_slug: chapter.slug,
        p_topic_id: topic.id
      });

      if (rpcError) throw rpcError;
      
      setSelectedTopic(topic);
      setSession(data);
      sessionStorage.setItem(`live_host_session_${chapter.slug}`, JSON.stringify({ session: data }));
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const advanceState = async (newIndex: number, newStatus: string) => {
    try {
      await supabase.rpc('advance_live_session', {
        p_session_id: session.id,
        p_host_token: session.host_token,
        p_new_index: newIndex,
        p_status: newStatus
      });
      const newSession = { ...session, current_question_index: newIndex, status: newStatus };
      setSession(newSession);
      sessionStorage.setItem(`live_host_session_${chapter.slug}`, JSON.stringify({ session: newSession }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleKick = async (participantId: string) => {
    try {
      await supabase.rpc('remove_participant', {
        p_session_id: session.id,
        p_host_token: session.host_token,
        p_participant_id: participantId
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  // --- RENDERING ---

  // =========================================
  // Stage 1: Topic Picker — Full-Screen Cards
  // =========================================
  if (!session) {
    return (
      <main className="min-h-dvh flex flex-col bg-basalt">
        {/* Full-width decorative header */}
        <div className="relative px-5 pt-6 pb-8 overflow-hidden">
          {/* Background strata bands */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[rgba(70,65,80,0.4)] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[rgba(89,73,55,0.3)] to-transparent" />
          </div>
          
          <Link href={`/12/${chapter.slug}`} className="relative inline-flex items-center gap-1 text-chalk-muted text-xs font-medium hover:text-chalk transition-colors mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back
          </Link>
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>Live Quiz</span>
            </div>
            <h1 className="text-2xl font-bold text-chalk leading-tight" style={{ fontFamily: 'var(--font-display)' }}>Host a Quiz</h1>
            <p className="text-chalk-dim text-sm mt-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
              Ch {chapter.chapterNumber}. {chapter.title}
            </p>
            <p className="text-chalk-muted text-xs mt-2">Choose a topic to quiz your class on</p>
          </div>
        </div>

        {error && <p className="text-oxide text-sm mx-5 mb-4 bg-oxide/10 border border-oxide/20 rounded-lg px-3 py-2">{error}</p>}
        
        {/* Topic cards — full width, touch-friendly */}
        <div className="flex-1 px-4 pb-8 space-y-3 overflow-y-auto">
          {chapter.topics.map((topic, i) => {
            const count = chapter.questions.filter(q => q.topicId === topic.id && q.phoneFriendly).length;
            if (count === 0) return null;
            return (
              <button 
                key={topic.id} 
                disabled={loading} 
                onClick={() => handleStartSession(topic)} 
                className="strata-animate w-full text-left rounded-xl bg-fieldnote border border-fieldnote-lighter/40 
                           hover:bg-fieldnote-lighter/20 hover:border-core/30 active:scale-[0.98]
                           transition-all duration-200 disabled:opacity-50 group bed-texture overflow-hidden relative"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="px-5 py-5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-chalk leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-bold text-core uppercase tracking-widest px-2 py-0.5 bg-core/10 rounded-full" style={{ fontFamily: 'var(--font-mono)' }}>
                        {Math.min(count, 8)} Qs
                      </span>
                      <span className="text-[10px] text-chalk-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                        ~{topic.estimatedMinutes}m
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 w-10 h-10 rounded-full bg-core/10 border border-core/20 flex items-center justify-center text-core opacity-60 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  // =========================================
  // Stage 2: Waiting Room — Stone Tablet Code
  // =========================================
  if (session.status === 'waiting') {
    return (
      <main className="min-h-dvh flex flex-col bg-basalt relative">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-core/5 rounded-full blur-[100px]" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 pb-28">
          <p className="text-chalk-muted font-medium uppercase tracking-[0.2em] text-[10px] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
            Join at geology.filtree.in/live
          </p>
          
          {/* Stone tablet room code */}
          <div className="relative bg-fieldnote border border-fieldnote-lighter/50 rounded-2xl px-10 py-8 mb-6 bed-texture">
            {/* Chiseled edges */}
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-chalk/8 to-transparent" />
            <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-chalk/5 to-transparent" />
            
            <div className="text-6xl font-black text-core tracking-[0.3em] stone-carved" style={{ fontFamily: 'var(--font-mono)' }}>
              {session.room_code}
            </div>
          </div>

          <h2 className="text-lg text-chalk font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{selectedTopic?.title}</h2>
          <p className="text-chalk-muted text-xs mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{topicQuestions.length} questions ready</p>
          
          {/* Participants — mineral specimen badges */}
          <div className="mt-8 w-full max-w-md">
            <h3 className="text-[10px] text-chalk-dim uppercase tracking-[0.15em] mb-4 font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
              Specimens Collected ({participants.length})
            </h3>
            <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
              {participants.length === 0 && <span className="text-sm text-chalk-muted italic">Waiting for students...</span>}
              {participants.map(p => (
                <div 
                  key={p.id} 
                  className="bg-fieldnote border border-fieldnote-lighter/50 px-3.5 py-2 rounded-xl text-sm font-medium text-chalk flex items-center gap-2 strata-animate"
                >
                  {/* Mini mineral dot */}
                  <span className="w-2 h-2 rounded-full bg-core/50 shrink-0" />
                  {p.display_name}
                  <button onClick={() => handleKick(p.id)} className="text-oxide/40 hover:text-oxide transition-colors ml-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Pinned bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-basalt via-basalt to-transparent pt-12 safe-bottom z-20">
          <button 
            onClick={() => advanceState(0, 'active')}
            disabled={participants.length === 0}
            className="w-full py-4 bg-core text-basalt font-bold text-lg rounded-xl disabled:opacity-40 active:scale-[0.98] transition-transform"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Start Quiz
          </button>
        </div>
      </main>
    );
  }

  // =========================================
  // Stage 3: Active Quiz — Full Screen Question
  // =========================================
  if (session.status === 'active') {
    const question = topicQuestions[session.current_question_index];
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

    return (
      <main className="min-h-dvh flex flex-col bg-basalt relative">
        {/* Question header */}
        <header className="px-5 pt-5 pb-4 border-b border-basalt-lighter/30 bg-fieldnote/30 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-chalk-muted font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              Question {session.current_question_index + 1} of {topicQuestions.length}
            </div>
            <button 
              onClick={() => setShowLeaderboard(!showLeaderboard)} 
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-core uppercase tracking-widest px-2.5 py-1 bg-core/10 rounded-full border border-core/20"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Board
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-basalt-lighter/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-core rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${((session.current_question_index + 1) / topicQuestions.length) * 100}%` }}
            />
          </div>
        </header>

        {/* Question content — takes full remaining space */}
        <div className="flex-1 px-5 py-6 flex flex-col pb-28">
          <h2 className="text-xl font-medium text-chalk leading-relaxed mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            {question.prompt}
          </h2>
          
          {question.options && (
            <div className="space-y-3 mt-auto">
              {question.options.map(opt => {
                const isCorrect = Array.isArray(question.correct) ? question.correct.includes(opt.id) : question.correct === opt.id;
                return (
                  <div 
                    key={opt.id} 
                    className={`px-5 py-4 border rounded-xl flex items-center justify-between transition-all ${
                      isCorrect 
                        ? 'bg-moss/10 border-moss/40 text-moss-bright' 
                        : 'bg-fieldnote/50 border-fieldnote-lighter/30 text-chalk-dim'
                    }`}
                  >
                    <span className="text-[15px] leading-snug">{opt.text}</span>
                    {isCorrect && (
                      <svg className="w-5 h-5 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaderboard Drawer (collapsible) */}
        {showLeaderboard && (
          <div className="fixed inset-0 z-30" onClick={() => setShowLeaderboard(false)}>
            <div className="absolute inset-0 bg-basalt/60 backdrop-blur-sm" />
            <div className="absolute bottom-0 left-0 right-0 bg-basalt border-t border-basalt-lighter/40 rounded-t-2xl drawer-animate max-h-[60vh] overflow-y-auto safe-bottom" onClick={e => e.stopPropagation()}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-chalk" style={{ fontFamily: 'var(--font-display)' }}>Live Leaderboard</h3>
                  <button onClick={() => setShowLeaderboard(false)} className="text-chalk-muted p-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="space-y-2">
                  {sortedParticipants.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-fieldnote/60 border border-fieldnote-lighter/20">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-core' : i === 1 ? 'text-chalk' : 'text-chalk-muted'}`}>{i + 1}</span>
                        <span className="text-sm text-chalk">{p.display_name}</span>
                      </div>
                      <span className="text-sm font-bold text-core" style={{ fontFamily: 'var(--font-mono)' }}>{p.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fixed bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-basalt via-basalt to-transparent pt-10 safe-bottom z-20">
          {session.current_question_index < topicQuestions.length - 1 ? (
            <button 
              onClick={() => advanceState(session.current_question_index + 1, 'active')} 
              className="w-full py-4 bg-chalk text-basalt font-bold text-base rounded-xl active:scale-[0.98] transition-transform"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Next Question →
            </button>
          ) : (
            <button 
              onClick={() => advanceState(session.current_question_index, 'ended')} 
              className="w-full py-4 bg-oxide text-chalk font-bold text-base rounded-xl active:scale-[0.98] transition-transform"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              End Session
            </button>
          )}
        </div>
      </main>
    );
  }

  // =========================================
  // Stage 4: Ended — Rock Column Podium
  // =========================================
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  const podiumEntries = sortedParticipants.slice(0, 3);
  // Heights for podium columns: 1st = tallest, 2nd = medium, 3rd = shortest
  const podiumHeights = [140, 100, 72];
  // Reorder for visual display: 2nd, 1st, 3rd
  const podiumOrder = podiumEntries.length >= 3 
    ? [podiumEntries[1], podiumEntries[0], podiumEntries[2]]
    : podiumEntries;
  const podiumHeightOrder = podiumEntries.length >= 3 
    ? [podiumHeights[1], podiumHeights[0], podiumHeights[2]]
    : podiumHeights.slice(0, podiumEntries.length);
  const podiumRankOrder = podiumEntries.length >= 3 ? [2, 1, 3] : podiumEntries.map((_, i) => i + 1);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-basalt safe-bottom">
      <h1 className="text-3xl font-bold text-chalk mb-2" style={{ fontFamily: 'var(--font-display)' }}>Session Complete</h1>
      <p className="text-chalk-muted text-sm mb-10" style={{ fontFamily: 'var(--font-mono)' }}>{selectedTopic?.title}</p>
      
      {/* Rock Column Podium */}
      {podiumOrder.length > 0 && (
        <div className="flex items-end justify-center gap-3 mb-10 w-full max-w-sm">
          {podiumOrder.map((p, i) => (
            <div key={p.id} className="flex-1 flex flex-col items-center">
              {/* Name above column */}
              <span className="text-xs font-medium text-chalk mb-2 truncate max-w-full">{p.display_name}</span>
              <span className="text-lg font-black text-core mb-1" style={{ fontFamily: 'var(--font-mono)' }}>{p.score}</span>
              
              {/* Rock column */}
              <div 
                className="podium-col w-full flex items-start justify-center pt-4 strata-animate"
                style={{ 
                  height: `${podiumHeightOrder[i]}px`,
                  animationDelay: `${i * 150}ms` 
                }}
              >
                <span className={`text-xl font-black ${podiumRankOrder[i] === 1 ? 'text-core' : 'text-chalk-muted'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                  #{podiumRankOrder[i]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Other participants */}
      {sortedParticipants.length > 3 && (
        <div className="w-full max-w-sm mb-8">
          <div className="space-y-1.5">
            {sortedParticipants.slice(3).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-fieldnote/40 border border-fieldnote-lighter/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-chalk-muted font-bold w-4" style={{ fontFamily: 'var(--font-mono)' }}>{i + 4}</span>
                  <span className="text-sm text-chalk">{p.display_name}</span>
                </div>
                <span className="text-sm font-bold text-chalk-dim" style={{ fontFamily: 'var(--font-mono)' }}>{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => router.push('/12')} className="px-6 py-3.5 text-chalk border border-chalk/20 rounded-xl hover:bg-chalk/5 active:scale-[0.98] transition-all">
        Return to Syllabus
      </button>
    </main>
  );
}
