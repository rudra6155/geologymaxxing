'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Chapter, Topic, Question } from '@/lib/types';
import Link from 'next/link';
import { useSaveProgress } from '@/hooks/useSaveProgress';

interface GauntletViewProps {
  chapter: Chapter;
}

type GauntletState = 'selecting' | 'playing' | 'results';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function GauntletView({ chapter }: GauntletViewProps) {
  const { user, loading: userLoading, saveGauntletRun, promptLogin } = useSaveProgress();
  const [state, setState] = useState<GauntletState>('selecting');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  // Drill state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [questionState, setQuestionState] = useState<'answering' | 'answered'>('answering');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string>('');
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  const STREAK_TO_CLEAR = 5;

  const topicsWithQuestions = useMemo(() => {
    return chapter.topics.filter(topic => {
      const qCount = chapter.questions.filter(q => q.topicId === topic.id && q.phoneFriendly).length;
      return qCount > 0;
    });
  }, [chapter]);

  const handleStart = (topic: Topic) => {
    const topicQs = chapter.questions.filter(q => q.topicId === topic.id && q.phoneFriendly);
    if (topicQs.length === 0) return;
    
    setSelectedTopic(topic);
    setQuestions(shuffleArray(topicQs));
    setCurrentIndex(0);
    setStreak(0);
    setMaxStreak(0);
    setQuestionState('answering');
    setSelectedAnswer(null);
    setStartedAt(new Date().toISOString());
    setState('playing');
    setSaveStatus('idle');
  };

  const currentQ = questions[currentIndex];

  const handleAnswer = useCallback((answerId: string) => {
    if (questionState !== 'answering' || !currentQ) return;
    setSelectedAnswer(answerId);
    setQuestionState('answered');

    const isCorrect = Array.isArray(currentQ.correct)
      ? currentQ.correct.includes(answerId)
      : currentQ.correct === answerId;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));
    } else {
      setStreak(0);
    }
  }, [questionState, currentQ, streak]);

  const handleFinish = useCallback(async (result: 'cleared' | 'broken') => {
    setState('results');
    setSaveStatus('saving');
    
    const endedAt = new Date().toISOString();
    if (user && selectedTopic) {
      const success = await saveGauntletRun(selectedTopic.id, startedAt, endedAt, result, Math.max(maxStreak, streak >= STREAK_TO_CLEAR ? streak : 0));
      setSaveStatus(success ? 'saved' : 'failed');
    } else {
      setSaveStatus('idle');
    }
  }, [saveGauntletRun, user, selectedTopic, startedAt, maxStreak, streak]);

  const handleNext = useCallback(() => {
    if (streak >= STREAK_TO_CLEAR || (!currentQ && currentIndex >= questions.length)) {
      handleFinish(streak >= STREAK_TO_CLEAR ? 'cleared' : 'broken');
      return;
    }
    // If we run out of questions before clearing, we might need to shuffle and start over to allow infinite drilling until clear/fail.
    // The prompt: "streak challenge... resets on wrong one... cleared condition (e.g. 5)"
    // If they run out of questions, just reshuffle.
    if (currentIndex >= questions.length - 1) {
      setQuestions(prev => shuffleArray([...prev]));
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
    
    setSelectedAnswer(null);
    setQuestionState('answering');
  }, [currentIndex, questions.length, streak, currentQ, handleFinish]);

  const isCleared = streak >= STREAK_TO_CLEAR;

  // -- Render: Selecting Topic --
  if (state === 'selecting') {
    return (
      <main className="min-h-dvh flex flex-col px-4 py-6">
        <header className="mb-8">
          <Link
            href={`/12/${chapter.slug}`}
            className="inline-flex items-center gap-1 text-chalk-muted text-xs font-medium 
                       hover:text-chalk transition-colors mb-4"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Chapter
          </Link>
          <h1 className="text-2xl font-bold text-chalk mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Lock-In Gauntlet
          </h1>
          <p className="text-sm text-chalk-dim leading-relaxed">
            Select a topic to start an intense, phone-friendly drill. Answer 5 questions correctly in a row to clear it.
          </p>
        </header>

        <div className="space-y-3">
          {topicsWithQuestions.map((topic, idx) => (
            <button
              key={topic.id}
              onClick={() => handleStart(topic)}
              className="w-full text-left bg-basalt-light border border-basalt-lighter rounded-lg p-4
                         hover:border-core/40 transition-colors group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[0.625rem] font-bold text-core tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-semibold text-chalk" style={{ fontFamily: 'var(--font-display)' }}>
                    {topic.title}
                  </span>
                </div>
                <span className="text-[0.625rem] text-chalk-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                  {chapter.questions.filter(q => q.topicId === topic.id && q.phoneFriendly).length} drill questions
                </span>
              </div>
              <svg className="w-5 h-5 text-chalk-muted group-hover:text-core transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}

          {topicsWithQuestions.length === 0 && (
            <div className="text-center py-12 border border-dashed border-basalt-lighter rounded-lg">
              <p className="text-chalk-muted text-sm">No phone-friendly drill questions available for this chapter.</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // -- Render: Results --
  if (state === 'results') {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
            style={{
              backgroundColor: isCleared ? 'var(--color-moss)' : 'var(--color-oxide)',
              color: 'var(--color-basalt)',
            }}
          >
            {isCleared ? (
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-chalk mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {isCleared ? 'Gauntlet Cleared!' : 'Streak Broken'}
          </h2>
          <p className="text-chalk-dim text-sm mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
            Max streak: {maxStreak}
          </p>

          <div className="space-y-4 mb-6">
            {!userLoading && !user && (
              <div className="bg-oxide/10 border border-oxide/30 rounded-lg p-3 text-left flex items-start gap-3">
                <svg className="w-5 h-5 text-oxide shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-chalk mb-1">Save your run</p>
                  <p className="text-xs text-chalk-muted leading-relaxed mb-2">
                    Sign in to record this {isCleared ? 'victory' : 'attempt'} on your personal profile.
                  </p>
                  <button onClick={promptLogin} className="text-xs font-semibold text-oxide underline">
                    Sign in now
                  </button>
                </div>
              </div>
            )}
            {user && saveStatus === 'saved' && (
              <div className="bg-moss/10 border border-moss/20 text-moss text-xs font-medium px-3 py-2 rounded text-left">
                ✓ Run saved to your profile
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                if (selectedTopic) handleStart(selectedTopic);
              }}
              className="w-full bg-core/15 border border-core/30 text-core font-semibold text-sm 
                         rounded-lg px-4 py-3 hover:bg-core/20 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => setState('selecting')}
              className="w-full bg-basalt-lighter border border-basalt-lighter text-chalk-dim 
                         font-medium text-sm rounded-lg px-4 py-3 hover:text-chalk transition-colors"
            >
              Pick another topic
            </button>
          </div>
        </div>
      </main>
    );
  }

  // -- Render: Playing --
  if (!currentQ) return null;

  const isCorrect = questionState === 'answered' && (
    Array.isArray(currentQ.correct)
      ? currentQ.correct.includes(selectedAnswer ?? '')
      : currentQ.correct === selectedAnswer
  );

  return (
    <main className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 border-b border-basalt-lighter/30">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setState('selecting')}
            className="inline-flex items-center gap-1 text-chalk-muted text-xs font-medium 
                       hover:text-chalk transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Quit
          </button>
          <span className="text-[0.5625rem] font-bold tracking-widest uppercase text-core" style={{ fontFamily: 'var(--font-mono)' }}>
            The Gauntlet
          </span>
        </div>

        {/* Streak indicators */}
        <div className="flex justify-between items-end">
          <div className="flex gap-1.5">
            {Array.from({ length: STREAK_TO_CLEAR }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-2 rounded-full transition-colors duration-300 ${
                  i < streak ? 'bg-core shadow-[0_0_8px_var(--color-core)]' : 'bg-basalt-lighter'
                }`}
              />
            ))}
          </div>
          <span className="text-xl font-bold text-chalk" style={{ fontFamily: 'var(--font-mono)' }}>
            {streak}<span className="text-chalk-muted text-xs ml-1">/ {STREAK_TO_CLEAR}</span>
          </span>
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <p className="text-lg text-chalk font-medium leading-relaxed mb-8">
          {currentQ.prompt}
        </p>

        {currentQ.options && (
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswer === opt.id;
              const correctId = Array.isArray(currentQ.correct) ? currentQ.correct[0] : currentQ.correct;
              const isCorrectOption = opt.id === correctId;

              let optionStyle = 'bg-basalt-light border-basalt-lighter text-chalk hover:border-core/30';
              if (questionState === 'answered') {
                if (isCorrectOption) {
                  optionStyle = 'bg-moss/15 border-moss/40 text-chalk shadow-[0_0_15px_rgba(var(--color-moss-rgb),0.1)]';
                } else if (isSelected && !isCorrectOption) {
                  optionStyle = 'bg-oxide/15 border-oxide/40 text-chalk';
                } else {
                  optionStyle = 'bg-basalt-light/50 border-basalt-lighter/50 text-chalk-muted';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(opt.id)}
                  disabled={questionState === 'answered'}
                  className={`w-full text-left rounded-xl px-5 py-4 border text-base font-medium
                             transition-all duration-200 flex items-center gap-4 ${optionStyle}
                             ${questionState === 'answered' ? 'cursor-default' : 'active:scale-[0.98]'}`}
                >
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center 
                                text-[0.6875rem] font-bold transition-colors ${
                      questionState === 'answered' && isCorrectOption
                        ? 'border-moss bg-moss/20 text-moss'
                        : questionState === 'answered' && isSelected && !isCorrectOption
                        ? 'border-oxide bg-oxide/20 text-oxide'
                        : 'border-chalk-muted/30 text-chalk-muted'
                    }`}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {opt.id.toUpperCase()}
                  </span>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                  {questionState === 'answered' && isCorrectOption && (
                    <svg className="w-6 h-6 text-moss shrink-0 animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {questionState === 'answered' && isSelected && !isCorrectOption && (
                    <svg className="w-6 h-6 text-oxide shrink-0 animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Explanation (shown after answering) */}
        {questionState === 'answered' && (
          <div className="mt-6 bg-fieldnote/80 border border-fieldnote-lighter/50 rounded-xl px-5 py-4 animate-in slide-in-from-bottom-2 duration-300">
            <span
              className={`text-[0.625rem] font-bold tracking-widest uppercase mb-1.5 block ${isCorrect ? 'text-moss' : 'text-oxide'}`}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {isCorrect ? 'Correct' : 'Streak Broken'}
            </span>
            <p className="text-sm text-chalk/90 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {/* Next button footer */}
      {questionState === 'answered' && (
        <div className="px-4 pb-6 pt-3 bg-gradient-to-t from-basalt to-transparent">
          <button
            onClick={handleNext}
            className={`w-full font-bold text-sm rounded-xl px-4 py-4 transition-all active:scale-[0.98] ${
              !isCorrect 
                ? 'bg-oxide/20 border-2 border-oxide/40 text-oxide hover:bg-oxide/30'
                : streak >= STREAK_TO_CLEAR 
                  ? 'bg-moss border-2 border-moss text-basalt hover:bg-moss/90 shadow-[0_0_20px_var(--color-moss)]'
                  : 'bg-core border-2 border-core text-basalt hover:bg-core/90'
            }`}
          >
            {!isCorrect ? 'Finish Run' : streak >= STREAK_TO_CLEAR ? 'Clear Gauntlet!' : 'Next Question'}
          </button>
        </div>
      )}
    </main>
  );
}
