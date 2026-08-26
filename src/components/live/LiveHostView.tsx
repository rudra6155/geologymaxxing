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

  if (!session) {
    // Stage 1: Topic Picker (reused pattern from Gauntlet)
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-4">
        <Link href={`/12/${chapter.slug}`} className="absolute top-6 left-4 inline-flex items-center gap-1 text-chalk-muted text-xs font-medium hover:text-chalk transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-chalk mb-2" style={{ fontFamily: 'var(--font-display)' }}>Host Live Quiz</h1>
          <p className="text-chalk-dim text-sm" style={{ fontFamily: 'var(--font-mono)' }}>{chapter.chapterNumber}. {chapter.title}</p>
        </div>
        {error && <p className="text-oxide text-sm mb-4">{error}</p>}
        <div className="w-full max-w-sm space-y-3">
          {chapter.topics.map((topic) => {
            const count = chapter.questions.filter(q => q.topicId === topic.id && q.phoneFriendly).length;
            if (count === 0) return null;
            return (
              <button key={topic.id} disabled={loading} onClick={() => handleStartSession(topic)} className="w-full text-left p-4 rounded-xl bg-fieldnote border border-fieldnote-lighter/50 hover:bg-fieldnote-lighter/20 hover:border-core/40 transition-colors disabled:opacity-50 flex items-center justify-between group">
                <div>
                  <h3 className="text-sm font-bold text-chalk" style={{ fontFamily: 'var(--font-display)' }}>{topic.title}</h3>
                  <p className="text-xs text-chalk-muted mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{Math.min(count, 8)} questions</p>
                </div>
                <div className="text-core opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  if (session.status === 'waiting') {
    return (
      <main className="min-h-dvh flex flex-col pb-24">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-chalk-muted font-medium uppercase tracking-widest text-xs mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Join at geology.filtree.in/live</p>
          <div className="text-7xl font-bold text-core tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
            {session.room_code}
          </div>
          <h2 className="mt-6 text-xl text-chalk" style={{ fontFamily: 'var(--font-display)' }}>{selectedTopic?.title}</h2>
          <p className="text-chalk-muted text-sm mt-1">{topicQuestions.length} questions</p>
        </div>
        
        <div className="w-full max-w-md mx-auto px-4">
          <h3 className="text-xs text-chalk-dim uppercase tracking-widest mb-4" style={{ fontFamily: 'var(--font-mono)' }}>Participants ({participants.length})</h3>
          <div className="flex flex-wrap gap-2 mb-8 min-h-[100px] content-start">
            {participants.length === 0 && <span className="text-sm text-chalk-muted italic">Waiting for students...</span>}
            {participants.map(p => (
              <div key={p.id} className="bg-fieldnote border border-fieldnote-lighter/50 px-3 py-1.5 rounded-full text-sm font-medium text-chalk flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                {p.display_name}
                <button onClick={() => handleKick(p.id)} className="text-oxide/50 hover:text-oxide transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => advanceState(0, 'active')}
            disabled={participants.length === 0}
            className="w-full py-4 bg-core text-basalt font-bold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            Start Quiz
          </button>
        </div>
      </main>
    );
  }

  if (session.status === 'active') {
    const question = topicQuestions[session.current_question_index];
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

    return (
      <main className="min-h-dvh flex flex-col lg:flex-row">
        {/* Left Side: Question Display */}
        <div className="flex-1 p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-basalt-lighter/30">
          <div className="text-xs text-chalk-muted font-bold tracking-widest uppercase mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
            Question {session.current_question_index + 1} of {topicQuestions.length}
          </div>
          <h2 className="text-2xl font-medium text-chalk leading-relaxed" style={{ fontFamily: 'var(--font-display)' }}>
            {question.prompt}
          </h2>
          {question.options && (
            <div className="mt-8 space-y-3">
              {question.options.map(opt => {
                const isCorrect = Array.isArray(question.correct) ? question.correct.includes(opt.id) : question.correct === opt.id;
                return (
                  <div key={opt.id} className={`p-4 border rounded-xl flex items-center justify-between ${isCorrect ? 'bg-moss/10 border-moss text-moss-bright' : 'bg-fieldnote border-fieldnote-lighter/50 text-chalk'}`}>
                    <span>{opt.text}</span>
                    {isCorrect && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Leaderboard & Controls */}
        <div className="w-full lg:w-96 p-6 flex flex-col bg-basalt-light/30">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-chalk mb-4" style={{ fontFamily: 'var(--font-mono)' }}>Live Leaderboard</h3>
            <div className="space-y-2">
              {sortedParticipants.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-fieldnote border border-fieldnote-lighter/30">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-4 text-center ${i === 0 ? 'text-core' : 'text-chalk-muted'}`}>{i + 1}</span>
                    <span className="text-sm text-chalk">{p.display_name}</span>
                  </div>
                  <span className="text-sm font-bold text-core" style={{ fontFamily: 'var(--font-mono)' }}>{p.score}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8">
            {session.current_question_index < topicQuestions.length - 1 ? (
              <button onClick={() => advanceState(session.current_question_index + 1, 'active')} className="w-full py-4 bg-chalk text-basalt font-bold rounded-xl active:scale-[0.98] transition-transform">
                Next Question
              </button>
            ) : (
              <button onClick={() => advanceState(session.current_question_index, 'ended')} className="w-full py-4 bg-oxide text-chalk font-bold rounded-xl active:scale-[0.98] transition-transform">
                End Session
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Status: Ended
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-chalk mb-8" style={{ fontFamily: 'var(--font-display)' }}>Session Ended</h1>
      <div className="w-full max-w-md bg-fieldnote border border-fieldnote-lighter/50 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-core mb-6" style={{ fontFamily: 'var(--font-display)' }}>Final Podium</h2>
        <div className="space-y-3">
          {sortedParticipants.slice(0, 3).map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-basalt border border-basalt-lighter">
              <div className="flex items-center gap-4">
                <span className={`text-xl font-bold ${i === 0 ? 'text-core' : i === 1 ? 'text-chalk' : 'text-chalk-muted'}`}>#{i + 1}</span>
                <span className="text-lg text-chalk font-medium">{p.display_name}</span>
              </div>
              <span className="text-lg font-bold text-core" style={{ fontFamily: 'var(--font-mono)' }}>{p.score}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => router.push('/12')} className="px-6 py-3 text-chalk border border-chalk/30 rounded-xl hover:bg-chalk/10 transition-colors">
        Return to Syllabus
      </button>
    </main>
  );
}
