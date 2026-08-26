import Link from 'next/link';
import type { Metadata } from 'next';
import { STD_12_CHAPTERS, TOTAL_MARKS_12 } from '@/lib/chapter-registry';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Std 12 — Geology Chapters',
  description: 'All 8 chapters of Maharashtra State Board Std 12 Geology. Tap a stratum to begin.',
};

/** Each chapter gets a distinct earth-toned band color */
const STRATA_COLORS = [
  { bg: 'rgba(89, 73, 55, 0.35)', border: 'rgba(89, 73, 55, 0.6)' },     // 1 - mudstone brown
  { bg: 'rgba(75, 85, 72, 0.35)', border: 'rgba(75, 85, 72, 0.6)' },     // 2 - greenschist
  { bg: 'rgba(95, 80, 65, 0.35)', border: 'rgba(95, 80, 65, 0.6)' },     // 3 - sandstone
  { bg: 'rgba(70, 65, 80, 0.35)', border: 'rgba(70, 65, 80, 0.6)' },     // 4 - slate
  { bg: 'rgba(100, 75, 55, 0.35)', border: 'rgba(100, 75, 55, 0.6)' },   // 5 - ironstone
  { bg: 'rgba(55, 80, 90, 0.35)', border: 'rgba(55, 80, 90, 0.6)' },     // 6 - blue clay
  { bg: 'rgba(90, 60, 55, 0.35)', border: 'rgba(90, 60, 55, 0.6)' },     // 7 - laterite
  { bg: 'rgba(65, 75, 85, 0.35)', border: 'rgba(65, 75, 85, 0.6)' },     // 8 - shale
];

export default async function Std12Page() {
  const MIN_HEIGHT_PX = 72;
  const MAX_HEIGHT_PX = 160;
  const RANGE = MAX_HEIGHT_PX - MIN_HEIGHT_PX;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-dvh pb-8">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 relative">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-chalk-muted text-xs font-medium 
                       hover:text-chalk transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          {user ? (
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-core text-xs font-medium bg-core/10 border border-core/20 px-3 py-1 rounded-full hover:bg-core/15 transition-colors"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
          ) : (
            <Link
              href="?login=true"
              className="inline-flex items-center gap-1.5 text-chalk-muted text-xs font-medium border border-basalt-lighter px-3 py-1 rounded-full hover:text-chalk hover:bg-basalt-light transition-colors"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Sign In
            </Link>
          )}
        </div>

        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="text-chalk">Std 12</span>
          <span className="text-chalk-muted ml-2 text-lg font-normal">Geology</span>
        </h1>
        <p className="text-chalk-dim text-sm mt-1">
          {TOTAL_MARKS_12} marks total · 8 chapters · Band thickness = marks weightage
        </p>
      </header>

      {/* Strata Column */}
      <div className="px-3 space-y-1">
        {STD_12_CHAPTERS.map((chapter, i) => {
          const weight = chapter.marksWeightage ?? 10;
          const heightPx = MIN_HEIGHT_PX + (weight / 17) * RANGE; // 17 = max marks
          const colors = STRATA_COLORS[i];

          if (!chapter.available) {
            return (
              <div
                key={chapter.slug}
                className="strata-band rounded-lg px-4 flex items-center gap-3 opacity-50 cursor-not-allowed"
                style={{
                  minHeight: `${heightPx}px`,
                  backgroundColor: colors.bg,
                  borderLeft: `3px solid ${colors.border}`,
                }}
              >
                {/* Chapter number */}
                <div
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-chalk/10"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-chalk-muted)',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                  }}
                >
                  {chapter.chapterNumber}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2
                      className="text-sm font-semibold text-chalk-muted truncate"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {chapter.title}
                    </h2>
                  </div>
                  <p className="text-xs text-chalk-muted/70 line-clamp-1">{chapter.summary}</p>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className="text-[0.625rem] text-chalk-muted/60 block"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    SOON
                  </span>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={chapter.slug}
              href={`/12/${chapter.slug}`}
              className="strata-band block rounded-lg px-4 flex items-center gap-3 
                         hover:brightness-125 active:brightness-110 transition-all"
              style={{
                minHeight: `${heightPx}px`,
                backgroundColor: colors.bg,
                borderLeft: `3px solid ${colors.border}`,
              }}
            >
              {/* Chapter number */}
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-core)',
                  borderColor: 'var(--color-core)',
                  backgroundColor: 'rgba(201, 138, 62, 0.1)',
                }}
              >
                {chapter.chapterNumber}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2
                    className="text-sm font-semibold text-chalk truncate"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {chapter.title}
                  </h2>
                </div>
                <p className="text-xs text-chalk-dim line-clamp-2">{chapter.summary}</p>
              </div>

              {/* Marks badge */}
              <div className="shrink-0 text-right">
                <span
                  className="text-lg font-bold text-core block leading-none"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {chapter.marksWeightage}
                </span>
                <span
                  className="text-[0.5625rem] text-chalk-muted block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  marks
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Scale legend */}
      <div className="px-4 mt-6">
        <p className="text-[0.625rem] text-chalk-muted text-center" style={{ fontFamily: 'var(--font-mono)' }}>
          Band thickness ∝ marks weightage · Thicker band = more marks in exam
        </p>
      </div>
    </main>
  );
}
