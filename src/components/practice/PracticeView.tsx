'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Question, Chapter } from '@/lib/types';
import Link from 'next/link';
import { useSaveProgress } from '@/hooks/useSaveProgress';

interface PracticeViewProps {
  chapter: Chapter;
}

type PracticeState = 'answering' | 'answered' | 'results';

interface QuestionResult {
  questionId: string;
  correct: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PracticeView({ chapter }: PracticeViewProps) {
  const [phoneOnly, setPhoneOnly] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<PracticeState>('answering');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const questions = useMemo(() => {
    const filtered = phoneOnly
      ? chapter.questions.filter((q) => q.phoneFriendly)
      : chapter.questions;
    return mounted ? shuffleArray(filtered) : filtered;
  }, [chapter.questions, phoneOnly, mounted]);

  const currentQ = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleAnswer = useCallback((answerId: string) => {
    if (state !== 'answering' || !currentQ) return;
    setSelectedAnswer(answerId);
    setState('answered');

    const isCorrect = Array.isArray(currentQ.correct)
      ? currentQ.correct.includes(answerId)
      : currentQ.correct === answerId;

    setResults((prev) => [...prev, { questionId: currentQ.id, correct: isCorrect }]);
  }, [state, currentQ]);

  const { user, loading: userLoading, saveAttempts, promptLogin } = useSaveProgress();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  // Trigger save when reaching results
  useEffect(() => {
    if ((state === 'results' || (questions.length > 0 && currentIndex >= questions.length)) && user && saveStatus === 'idle' && results.length > 0) {
      setSaveStatus('saving');
      // For practice mode, we just use the first topic id from questions as the topic proxy,
      // or we can pass a dummy topic ID if we don't have a strict topic boundary here.
      // But Chunk 2 prompt: "question attempts — per student, per question: which question, whether correct, when. This is what lets you compute per-topic accuracy later"
      // The chapter questions don't always have a single topic in practice mode. We'll extract topic from the question if needed or pass the chapter slug as the 'topic' context.
      const attempts = results.map(r => ({ questionId: r.questionId, correct: r.correct }));
      saveAttempts(chapter.slug, attempts).then((success) => {
        setSaveStatus(success ? 'saved' : 'failed');
      });
    }
  }, [state, currentIndex, questions.length, user, saveStatus, results, chapter.slug, saveAttempts]);

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setState('results');
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setMatchSelections({});
    setState('answering');
  }, [currentIndex, questions.length]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setState('answering');
    setSelectedAnswer(null);
    setMatchSelections({});
    setResults([]);
    setSaveStatus('idle');
  }, []);

  // Results screen
  if (state === 'results' || (questions.length > 0 && currentIndex >= questions.length)) {
    const correctCount = results.filter((r) => r.correct).length;
    const total = results.length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center max-w-sm w-full">
          <div
            className="text-5xl font-bold mb-2"
            style={{
              fontFamily: 'var(--font-mono)',
              color: pct >= 70 ? 'var(--color-moss)' : pct >= 40 ? 'var(--color-core)' : 'var(--color-oxide)',
            }}
          >
            {pct}%
          </div>
          <p className="text-chalk text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            {pct >= 70 ? 'Great work!' : pct >= 40 ? 'Keep practising' : 'Review the chapter'}
          </p>
          <p className="text-chalk-dim text-sm mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
            {correctCount} / {total} correct
          </p>

          <div className="space-y-2">
            {!userLoading && !user && (
              <div className="bg-oxide/10 border border-oxide/30 rounded-lg p-3 text-left mb-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-oxide shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-chalk mb-1">Save your progress</p>
                  <p className="text-xs text-chalk-muted leading-relaxed mb-2">
                    Sign in to save this result and track your accuracy across topics.
                  </p>
                  <button
                    onClick={promptLogin}
                    className="text-xs font-semibold text-oxide underline"
                  >
                    Sign in now
                  </button>
                </div>
              </div>
            )}
            {user && saveStatus === 'saved' && (
              <div className="bg-moss/10 border border-moss/20 text-moss text-xs font-medium px-3 py-2 rounded mb-4 text-left">
                ✓ Results saved to your profile
              </div>
            )}
            
            <button
              onClick={handleRestart}
              className="w-full bg-core/15 border border-core/30 text-core font-semibold text-sm 
                         rounded-lg px-4 py-3 hover:bg-core/20 transition-colors"
            >
              Try again
            </button>
            <Link
              href={`/${chapter.std ?? 12}/${chapter.slug}`}
              className="block w-full bg-basalt-lighter border border-basalt-lighter text-chalk-dim 
                         font-medium text-sm rounded-lg px-4 py-3 hover:text-chalk transition-colors text-center"
            >
              Back to chapter
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!currentQ || questions.length === 0) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4">
        <p className="text-chalk-muted text-sm mb-4">
          No {phoneOnly ? 'phone-friendly ' : ''}questions available for this chapter.
        </p>
        {phoneOnly && (
          <button
            onClick={() => setPhoneOnly(false)}
            className="text-core text-sm font-medium underline"
          >
            Show all questions
          </button>
        )}
      </main>
    );
  }

  const isCorrect = state === 'answered' && (
    Array.isArray(currentQ.correct)
      ? currentQ.correct.includes(selectedAnswer ?? '')
      : currentQ.correct === selectedAnswer
  );

  return (
    <main className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <Link
            href={`/${chapter.std ?? 12}/${chapter.slug}`}
            className="inline-flex items-center gap-1 text-chalk-muted text-xs font-medium 
                       hover:text-chalk transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {chapter.title}
          </Link>

          <button
            onClick={() => { setPhoneOnly(!phoneOnly); handleRestart(); }}
            className={`text-[0.625rem] font-medium px-2 py-1 rounded-full border transition-colors ${
              phoneOnly
                ? 'text-moss border-moss/30 bg-moss/10'
                : 'text-chalk-muted border-basalt-lighter bg-basalt-light'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {phoneOnly ? '📱 Phone mode' : '📝 All questions'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-basalt-lighter rounded-full overflow-hidden">
          <div
            className="h-full bg-core rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[0.5625rem] text-chalk-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            Q{currentIndex + 1} of {questions.length}
          </span>
          <span className="text-[0.5625rem] text-chalk-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            {currentQ.marks}M · {currentQ.difficulty}
          </span>
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 px-4 py-4">
        <p className="text-base text-chalk font-medium leading-relaxed mb-6">
          {currentQ.prompt}
        </p>

        {/* MCQ / OddOneOut options */}
        {(currentQ.type === 'mcq' || currentQ.type === 'oddOneOut') && currentQ.options && (
          <div className="space-y-2">
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswer === opt.id;
              const correctId = Array.isArray(currentQ.correct) ? currentQ.correct[0] : currentQ.correct;
              const isCorrectOption = opt.id === correctId;

              let optionStyle = 'bg-basalt-light border-basalt-lighter text-chalk hover:border-core/30';
              if (state === 'answered') {
                if (isCorrectOption) {
                  optionStyle = 'bg-moss/15 border-moss/40 text-chalk';
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
                  disabled={state === 'answered'}
                  className={`w-full text-left rounded-lg px-4 py-3 border text-sm 
                             transition-all duration-150 flex items-center gap-3 ${optionStyle}
                             ${state === 'answered' ? 'cursor-default' : 'active:scale-[0.99]'}`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center 
                                text-[0.625rem] font-bold ${
                      state === 'answered' && isCorrectOption
                        ? 'border-moss bg-moss/20 text-moss'
                        : state === 'answered' && isSelected && !isCorrectOption
                        ? 'border-oxide bg-oxide/20 text-oxide'
                        : 'border-chalk-muted/30 text-chalk-muted'
                    }`}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {opt.id.toUpperCase()}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                  {state === 'answered' && isCorrectOption && (
                    <svg className="w-5 h-5 text-moss shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {state === 'answered' && isSelected && !isCorrectOption && (
                    <svg className="w-5 h-5 text-oxide shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Match pairs display */}
        {currentQ.type === 'matchPairs' && currentQ.pairs && (
          <div className="rounded-lg bg-basalt-light border border-basalt-lighter overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-basalt-lighter">
                  <th className="text-left px-3 py-2 text-[0.625rem] uppercase tracking-widest text-core font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                    Term
                  </th>
                  <th className="text-left px-3 py-2 text-[0.625rem] uppercase tracking-widest text-moss font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                    Match
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentQ.pairs.map((pair, i) => (
                  <tr key={i} className={i < (currentQ.pairs?.length ?? 0) - 1 ? 'border-b border-basalt-lighter/50' : ''}>
                    <td className="px-3 py-2 text-chalk font-medium">{pair.left}</td>
                    <td className="px-3 py-2 text-chalk/85">{pair.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {state === 'answering' && (
              <div className="px-3 py-2 border-t border-basalt-lighter">
                <button
                  onClick={() => { setState('answered'); setResults((prev) => [...prev, { questionId: currentQ.id, correct: true }]); }}
                  className="text-xs text-core font-medium"
                >
                  Reveal answer →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Short answer display */}
        {currentQ.type === 'shortAnswer' && (
          <div>
            {state === 'answering' ? (
              <button
                onClick={() => { setState('answered'); setResults((prev) => [...prev, { questionId: currentQ.id, correct: true }]); }}
                className="w-full bg-basalt-light border border-basalt-lighter rounded-lg px-4 py-3 
                           text-sm text-core font-medium hover:bg-basalt-lighter transition-colors"
              >
                Reveal model answer →
              </button>
            ) : (
              <div className="bg-fieldnote border border-fieldnote-lighter/50 rounded-lg px-4 py-3">
                <span
                  className="text-[0.5625rem] font-bold tracking-widest text-moss uppercase mb-2 block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  MODEL ANSWER
                </span>
                <p className="text-sm text-chalk/90 leading-relaxed">{currentQ.answer}</p>
              </div>
            )}
          </div>
        )}

        {/* Explanation (shown after answering) */}
        {state === 'answered' && (
          <div className="mt-4 bg-fieldnote/50 border border-fieldnote-lighter/30 rounded-lg px-4 py-3">
            <span
              className="text-[0.5625rem] font-bold tracking-widest text-chalk-muted uppercase mb-1 block"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              EXPLANATION
            </span>
            <p className="text-sm text-chalk/85 leading-relaxed">{currentQ.explanation}</p>
            {currentQ.teacherFlagged && (
              <div className="mt-2 inline-flex items-center gap-1 text-[0.625rem] text-core font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                ⭐ Teacher flagged — likely exam question
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next button */}
      {state === 'answered' && (
        <div className="px-4 pb-6 pt-2">
          <button
            onClick={handleNext}
            className="w-full bg-core/15 border border-core/30 text-core font-semibold text-sm 
                       rounded-lg px-4 py-3.5 hover:bg-core/20 transition-colors active:scale-[0.99]"
          >
            {currentIndex >= questions.length - 1 ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}
    </main>
  );
}
