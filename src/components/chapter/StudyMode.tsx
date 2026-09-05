'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Chapter, DepthView, Topic } from '@/lib/types';
import { DEPTH_VIEWS, getDepthViewLabel, getDepthViewDescription } from '@/lib/depth-filter';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { DistinguishPairsView } from './DistinguishPairs';
import { GlossaryView } from './GlossaryView';

interface StudyModeProps {
  chapter: Chapter;
  depthView: DepthView;
  topics: Topic[];
  onExit: () => void;
  onChangeDepth: (view: DepthView) => void;
}

const SCROLL_OFFSET = 80; // sticky header height, kept in sync with scroll-mt-20 below

export function StudyMode({ chapter, depthView, topics, onExit, onChangeDepth }: StudyModeProps) {
  const [showDepthSheet, setShowDepthSheet] = useState(false);
  const [showContents, setShowContents] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const topicRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Mark a topic "read" once its header has scrolled into the upper part of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisited((prev) => {
          let changed = false;
          const next = new Set(prev);
          for (const entry of entries) {
            if (entry.isIntersecting && !next.has(entry.target.id)) {
              next.add(entry.target.id);
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    );
    topicRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [topics]);

  function scrollToTopic(id: string) {
    setShowContents(false);
    const el = topicRefs.current.get(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  const visitedCount = topics.filter((t) => visited.has(t.id)).length;
  const progressPct = topics.length > 0 ? Math.round((visitedCount / topics.length) * 100) : 0;

  return (
    <main className="min-h-dvh pl-2 pb-24">
      {/* Minimal sticky header — no meta, no action pills, just wayfinding */}
      <header className="sticky top-0 z-30 bg-basalt/95 backdrop-blur-sm border-b border-basalt-lighter/30">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            onClick={onExit}
            aria-label="Exit study mode"
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-chalk-muted
                       hover:text-chalk hover:bg-basalt-lighter/40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1
            className="flex-1 min-w-0 truncate text-sm font-bold text-chalk"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {chapter.title}
          </h1>

          <button
            onClick={() => setShowDepthSheet(true)}
            className="shrink-0 inline-flex items-center gap-1 text-[0.625rem] font-bold uppercase tracking-wide
                       text-core bg-core/10 border border-core/25 rounded-full px-2.5 py-1.5"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {getDepthViewLabel(depthView)}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Topic-completion progress — distinct from the raw scroll-% core rail */}
        <div className="h-[2px] bg-basalt-lighter/60">
          <div className="h-full bg-core transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      <div className="px-3 mt-5">
        {topics.map((topic) => (
          <section
            key={topic.id}
            id={topic.id}
            ref={(el) => {
              if (el) topicRefs.current.set(topic.id, el);
              else topicRefs.current.delete(topic.id);
            }}
            className="mb-10 scroll-mt-20"
          >
            <div className="flex items-baseline gap-2.5 mb-4 px-1">
              <span
                className="text-2xl font-bold text-core/40 leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {String(topic.order).padStart(2, '0')}
              </span>
              <h2
                className="flex-1 min-w-0 text-lg font-bold text-chalk leading-snug"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {topic.title}
              </h2>
              <span className="text-[0.5625rem] text-chalk-muted shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                ~{topic.estimatedMinutes}m
              </span>
            </div>

            {topic.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} diagrams={chapter.diagrams} />
            ))}
          </section>
        ))}

        {topics.length === 0 && (
          <div className="text-center py-16">
            <p className="text-chalk-muted text-sm mb-4">Nothing at this depth yet.</p>
            <button
              onClick={() => onChangeDepth('full')}
              className="text-core text-sm font-medium underline underline-offset-4"
            >
              Switch to Full Lesson
            </button>
          </div>
        )}

        <DistinguishPairsView pairs={chapter.distinguishPairs || []} />
        <GlossaryView entries={chapter.glossary || []} />

        <div className="mt-12 flex justify-center">
          <Link
            href={`/${chapter.std ?? 12}/${chapter.slug}/practice`}
            className="inline-flex items-center gap-2 bg-core/15 border border-core/30
                       text-core font-semibold text-sm rounded-full px-6 py-3
                       hover:bg-core/20 transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Practice Questions ({chapter.questions?.length ?? 0})
          </Link>
        </div>
      </div>

      {/* Contents — jump between topics, see what's read */}
      {topics.length > 0 && (
        <button
          onClick={() => setShowContents(true)}
          className="fixed bottom-6 left-5 z-40 inline-flex items-center gap-2 bg-fieldnote
                     border border-fieldnote-lighter/60 text-chalk text-xs font-bold rounded-full
                     pl-3 pr-4 py-2.5 shadow-lg"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          {visitedCount}/{topics.length}
        </button>
      )}

      {showContents && (
        <div className="fixed inset-0 z-50" onClick={() => setShowContents(false)}>
          <div className="absolute inset-0 bg-basalt/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-basalt border-t border-basalt-lighter/40
                       rounded-t-2xl drawer-animate max-h-[70vh] overflow-y-auto safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="w-10 h-1 rounded-full bg-basalt-lighter mx-auto mb-4" />
              <h3 className="text-sm font-bold text-chalk mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Contents
              </h3>
              <div className="space-y-1">
                {topics.map((topic) => {
                  const isVisited = visited.has(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => scrollToTopic(topic.id)}
                      className="w-full flex items-center gap-3 text-left rounded-lg px-2 py-2.5
                                 hover:bg-basalt-lighter/30 transition-colors"
                    >
                      <span
                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.625rem] font-bold border ${
                          isVisited
                            ? 'bg-core/20 border-core/40 text-core'
                            : 'bg-basalt-lighter/30 border-basalt-lighter text-chalk-muted'
                        }`}
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {isVisited ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          topic.order
                        )}
                      </span>
                      <span className="flex-1 min-w-0 text-sm text-chalk font-medium truncate">{topic.title}</span>
                      <span className="shrink-0 text-[0.625rem] text-chalk-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                        ~{topic.estimatedMinutes}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Depth switch — without leaving focus mode */}
      {showDepthSheet && (
        <div className="fixed inset-0 z-50" onClick={() => setShowDepthSheet(false)}>
          <div className="absolute inset-0 bg-basalt/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-basalt border-t border-basalt-lighter/40
                       rounded-t-2xl drawer-animate max-h-[70vh] overflow-y-auto safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="w-10 h-1 rounded-full bg-basalt-lighter mx-auto mb-4" />
              <h3 className="text-sm font-bold text-chalk mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Reading depth
              </h3>
              <div className="space-y-2">
                {DEPTH_VIEWS.map((view) => {
                  const isActive = view === depthView;
                  return (
                    <button
                      key={view}
                      onClick={() => {
                        onChangeDepth(view);
                        setShowDepthSheet(false);
                      }}
                      className={`w-full text-left rounded-xl border p-3 transition-colors ${
                        isActive
                          ? 'bg-core/10 border-core/30'
                          : 'bg-fieldnote/50 border-transparent hover:border-fieldnote-lighter/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${isActive ? 'text-core' : 'text-chalk'}`}
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {getDepthViewLabel(view)}
                        </span>
                        {isActive && (
                          <svg className="w-4 h-4 text-core" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-chalk-dim mt-1">{getDepthViewDescription(view)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
