import Link from 'next/link';
import type { Chapter, DepthView } from '@/lib/types';
import { DEPTH_VIEWS, getDepthViewLabel, getDepthViewDescription } from '@/lib/depth-filter';

interface DepthStat {
  topics: number;
  blocks: number;
  minutes: number;
}

interface ChapterOverviewProps {
  chapter: Chapter;
  depthStats: Record<DepthView, DepthStat>;
  onSelectDepth: (depth: DepthView) => void;
}

/** Same "how much of the pyramid" bar language as the old DepthSwitcher, scaled up. */
const DEPTH_BARS: Record<DepthView, number[]> = {
  'last-minute': [1, 0.2, 0.1],
  revision: [1, 0.85, 0.15],
  full: [1, 0.85, 0.6],
};

const DEPTH_ACCENT: Record<DepthView, { text: string; bg: string; border: string; texture: string }> = {
  'last-minute': { text: 'text-core-bright', bg: 'bg-core/10', border: 'border-core/25', texture: 'bed-ironstone' },
  revision: { text: 'text-chalk', bg: 'bg-basalt-lighter/30', border: 'border-basalt-lighter', texture: 'bed-texture' },
  full: { text: 'text-moss-bright', bg: 'bg-moss/10', border: 'border-moss/25', texture: 'bed-slate' },
};

function DepthBars({ view }: { view: DepthView }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
      {DEPTH_BARS[view].map((opacity, i) => (
        <rect key={i} x="2" y={2 + i * 5} width="12" height="3" rx="1" fill="currentColor" opacity={opacity} />
      ))}
    </svg>
  );
}

export function ChapterOverview({ chapter, depthStats, onSelectDepth }: ChapterOverviewProps) {
  return (
    <main className="min-h-dvh pl-2 pb-16">
      <header className="px-4 pt-5 pb-4">
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
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

        <p
          className="text-[0.625rem] font-bold uppercase tracking-[0.25em] text-core mb-2"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Chapter {chapter.chapterNumber}
        </p>
        <h1
          className="text-[1.75rem] font-bold text-chalk mb-2 leading-[1.1]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {chapter.title}
        </h1>
        {chapter.summary && (
          <p className="text-sm text-chalk-dim leading-relaxed mb-3 max-w-[36rem]">{chapter.summary}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-chalk-muted" style={{ fontFamily: 'var(--font-mono)' }}>
          <span>{chapter.marksWeightage} marks</span>
          <span className="opacity-30">·</span>
          <span>pp. {chapter.textbookPages}</span>
          <span className="opacity-30">·</span>
          <span>{chapter.topics.length} topics</span>
        </div>
      </header>

      <div className="px-4 mt-2">
        <p className="text-sm text-chalk-dim mb-4">
          Choose how deep to go — you can switch anytime while studying.
        </p>

        <div className="space-y-3">
          {DEPTH_VIEWS.map((view) => {
            const stat = depthStats[view];
            const accent = DEPTH_ACCENT[view];
            return (
              <button
                key={view}
                onClick={() => onSelectDepth(view)}
                className={`w-full text-left rounded-2xl border ${accent.border} ${accent.bg} p-4 relative
                            bed-texture ${accent.texture}
                            hover:brightness-110 active:scale-[0.99] transition-all duration-150`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${accent.text} bg-basalt/40 border ${accent.border}`}
                  >
                    <DepthBars view={view} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-base font-bold ${accent.text}`}
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {getDepthViewLabel(view)}
                      </h3>
                      <svg
                        className="w-4 h-4 text-chalk-muted shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-xs text-chalk-dim mt-0.5 leading-relaxed">
                      {getDepthViewDescription(view)}
                    </p>
                    <div
                      className="flex items-center gap-2 mt-2 text-[0.625rem] text-chalk-muted"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      <span>{stat.blocks} sections</span>
                      <span className="opacity-30">·</span>
                      <span>{stat.topics} topics</span>
                      <span className="opacity-30">·</span>
                      <span>~{stat.minutes} min</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
