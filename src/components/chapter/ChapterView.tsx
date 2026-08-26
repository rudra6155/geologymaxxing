'use client';

import { useState } from 'react';
import type { Chapter, DepthView } from '@/lib/types';
import { filterTopicsByDepth } from '@/lib/depth-filter';
import { DepthSwitcher } from './DepthSwitcher';
import { CoreSampleRail } from './CoreSampleRail';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { DistinguishPairsView } from './DistinguishPairs';
import { GlossaryView } from './GlossaryView';
import { AskAiButton } from '@/components/chat/AskAiButton';
import Link from 'next/link';

interface ChapterViewProps {
  chapter: Chapter;
}

export function ChapterView({ chapter }: ChapterViewProps) {
  const [depthView, setDepthView] = useState<DepthView>('full');

  const filteredTopics = filterTopicsByDepth(chapter.topics, depthView);

  return (
    <>
      <CoreSampleRail />

    <main className="min-h-dvh pl-2 pb-32">
        {/* Header */}
        <header className="px-4 pt-5 pb-3 sticky top-0 z-30 bg-basalt/95 backdrop-blur-sm border-b border-basalt-lighter/30">
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/12"
              className="inline-flex items-center gap-1 text-chalk-muted text-xs font-medium 
                         hover:text-chalk transition-colors w-fit shrink-0"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Ch {chapter.chapterNumber}
            </Link>

            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              <Link
                href={`/12/${chapter.slug}/live/host`}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-amber-500
                           bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1
                           hover:bg-amber-500/15 transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Host Live
              </Link>
              <Link
                href={`/12/${chapter.slug}/gauntlet`}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-core
                           bg-core/10 border border-core/20 rounded-full px-3 py-1
                           hover:bg-core/15 transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Gauntlet
              </Link>
              
              <Link
                href={`/12/${chapter.slug}/practice`}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-moss
                           bg-moss/10 border border-moss/20 rounded-full px-3 py-1
                           hover:bg-moss/15 transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Practice
              </Link>
            </div>
          </div>

          <h1
            className="text-xl font-bold text-chalk mb-1 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {chapter.title}
          </h1>

          <div className="flex items-center gap-3 text-[0.625rem] text-chalk-muted mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
            <span>{chapter.marksWeightage} marks</span>
            <span className="opacity-30">·</span>
            <span>pp. {chapter.textbookPages}</span>
            <span className="opacity-30">·</span>
            <span>~{chapter.estimatedMinutes} min</span>
          </div>

          <DepthSwitcher value={depthView} onChange={setDepthView} />
        </header>

        {/* Topics & Blocks */}
        <div className="px-3 mt-4">
          {filteredTopics.map((topic) => (
            <section key={topic.id} className="mb-8" id={topic.id}>
              {/* Topic header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span
                  className="text-[0.625rem] font-bold text-core tracking-widest"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {String(topic.order).padStart(2, '0')}
                </span>
                <h2
                  className="text-lg font-bold text-chalk"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {topic.title}
                </h2>
                <span
                  className="text-[0.5625rem] text-chalk-muted ml-auto"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  ~{topic.estimatedMinutes}m
                </span>
              </div>

              {/* Blocks */}
              {topic.blocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  diagrams={chapter.diagrams}
                />
              ))}
            </section>
          ))}

          {filteredTopics.length === 0 && (
            <div className="text-center py-12">
              <p className="text-chalk-muted text-sm">
                No content at this depth level for this chapter.
              </p>
            </div>
          )}

          {/* Distinguish Pairs */}
          <DistinguishPairsView pairs={chapter.distinguishPairs} />

          {/* Glossary */}
          <GlossaryView entries={chapter.glossary} />
        </div>

        {/* Bottom nav */}
        <div className="px-4 mt-12 flex justify-center">
          <Link
            href={`/12/${chapter.slug}/practice`}
            className="inline-flex items-center gap-2 bg-core/15 border border-core/30 
                       text-core font-semibold text-sm rounded-full px-6 py-3
                       hover:bg-core/20 transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Practice Questions ({chapter.questions.length})
          </Link>
        </div>
      </main>
      
      <AskAiButton chapterSlug={chapter.slug} />
    </>
  );
}
