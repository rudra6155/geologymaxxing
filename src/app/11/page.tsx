import Link from 'next/link';
import type { Metadata } from 'next';
import { STD_11_CHAPTERS, TOTAL_MARKS_11 } from '@/lib/chapter-registry';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Std 11 — Geology Chapters',
  description: 'All 6 chapters of Maharashtra State Board Std 11 Geology. Tap a stratum to begin.',
};

/** Each chapter gets a distinct earth-toned band with texture class */
const STRATA_STYLES = [
  { bg: 'rgba(89, 73, 55, 0.35)',  border: 'rgba(89, 73, 55, 0.6)',  texture: 'bed-mudstone',   label: 'Mudstone' },
  { bg: 'rgba(75, 85, 72, 0.35)',  border: 'rgba(75, 85, 72, 0.6)',  texture: 'bed-sandstone',  label: 'Sandstone' },
  { bg: 'rgba(95, 80, 65, 0.35)',  border: 'rgba(95, 80, 65, 0.6)',  texture: 'bed-texture',    label: 'Limestone' },
  { bg: 'rgba(70, 65, 80, 0.35)',  border: 'rgba(70, 65, 80, 0.6)',  texture: 'bed-slate',      label: 'Slate' },
  { bg: 'rgba(100, 75, 55, 0.35)', border: 'rgba(100, 75, 55, 0.6)', texture: 'bed-ironstone',  label: 'Ironstone' },
  { bg: 'rgba(55, 80, 90, 0.35)',  border: 'rgba(55, 80, 90, 0.6)',  texture: 'bed-texture',    label: 'Blue Clay' },
  { bg: 'rgba(90, 60, 55, 0.35)',  border: 'rgba(90, 60, 55, 0.6)',  texture: 'bed-ironstone',  label: 'Laterite' },
  { bg: 'rgba(65, 75, 85, 0.35)',  border: 'rgba(65, 75, 85, 0.6)',  texture: 'bed-shale',      label: 'Shale' },
];

const MAX_MARKS = 17;
const MIN_MARKS = 7;

export default async function Std11Page() {
  // Dramatic range: small beds are thin, big beds are very thick
  const MIN_HEIGHT_PX = 56;
  const MAX_HEIGHT_PX = 180;
  const RANGE = MAX_HEIGHT_PX - MIN_HEIGHT_PX;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-dvh pb-8">
      {/* Header */}
      <header className="px-5 pt-6 pb-5 relative">
        <div className="flex items-center justify-between mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-chalk-muted text-xs font-medium 
                       hover:text-chalk transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Home
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
          <span className="text-chalk">Std 11</span>
          <span className="text-chalk-muted ml-2 text-lg font-normal">Geology</span>
        </h1>
        <p className="text-chalk-dim text-sm mt-1.5 leading-relaxed">
          {TOTAL_MARKS_11} marks · 6 chapters
        </p>
        <p className="text-chalk-muted text-[10px] mt-1 uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
          Bed thickness = marks weightage
        </p>
      </header>

      {/* Core Drill Line + Strata Beds */}
      <div className="px-3 relative">
        {/* Core drill vertical line */}
        <div 
          className="absolute left-[22px] top-0 bottom-0 w-[2px] z-10"
          style={{ background: 'linear-gradient(180deg, var(--color-core) 0%, var(--color-core-dim) 50%, var(--color-oxide-dim) 100%)' }}
        />
        
        <div className="space-y-1 relative">
          {STD_11_CHAPTERS.map((chapter, i) => {
            const weight = chapter.marksWeightage ?? 10;
            // Proportional height: linear interpolation based on marks
            const normalized = (weight - MIN_MARKS) / (MAX_MARKS - MIN_MARKS);
            const heightPx = MIN_HEIGHT_PX + normalized * RANGE;
            const style = STRATA_STYLES[i];
            const isBigBed = weight >= 14;

            if (!chapter.available) {
              return (
                <div
                  key={chapter.slug}
                  className={`strata-band strata-animate rounded-lg pl-10 pr-4 flex items-center gap-3 opacity-40 cursor-not-allowed relative bed-texture ${style.texture}`}
                  style={{
                    minHeight: `${heightPx}px`,
                    backgroundColor: style.bg,
                    borderLeft: `3px solid ${style.border}`,
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  {/* Drill point */}
                  <div className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full border-2 border-chalk/10 bg-basalt-light z-20 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-chalk-muted" style={{ fontFamily: 'var(--font-mono)' }}>{chapter.chapterNumber}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2
                      className={`font-semibold text-chalk-muted truncate ${isBigBed ? 'text-base' : 'text-sm'}`}
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {chapter.title}
                    </h2>
                    {isBigBed && (
                      <p className="text-xs text-chalk-muted/60 line-clamp-1 mt-0.5">{chapter.summary}</p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[10px] text-chalk-muted/50 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      SOON
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={chapter.slug}
                href={`/11/${chapter.slug}`}
                className={`strata-band strata-animate block rounded-lg pl-10 pr-4 relative bed-texture
                           hover:brightness-125 active:brightness-110 active:scale-[0.995] transition-all duration-200 ${style.texture}`}
                style={{
                  minHeight: `${heightPx}px`,
                  backgroundColor: style.bg,
                  borderLeft: `3px solid ${style.border}`,
                  animationDelay: `${i * 60}ms`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                {/* Drill point — active */}
                <div className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full border-2 border-core/60 bg-core/15 z-20 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-core" style={{ fontFamily: 'var(--font-mono)' }}>{chapter.chapterNumber}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2
                      className={`font-semibold text-chalk truncate ${isBigBed ? 'text-base' : 'text-sm'}`}
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {chapter.title}
                    </h2>
                  </div>
                  {isBigBed && (
                    <p className="text-xs text-chalk-dim line-clamp-2 mt-0.5 max-w-[240px]">{chapter.summary}</p>
                  )}
                </div>

                {/* Marks badge — prominently sized proportional to weight */}
                <div className="shrink-0 flex flex-col items-end">
                  <span
                    className={`font-bold text-core block leading-none ${isBigBed ? 'text-2xl' : 'text-lg'}`}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {chapter.marksWeightage}
                  </span>
                  <span
                    className="text-[9px] text-chalk-muted block mt-0.5"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    marks
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Scale legend */}
      <div className="px-5 mt-6 flex items-center gap-3">
        <div className="flex items-end gap-[3px]">
          <div className="w-4 h-3 rounded-sm bg-chalk-muted/15" />
          <div className="w-4 h-5 rounded-sm bg-chalk-muted/15" />
          <div className="w-4 h-8 rounded-sm bg-chalk-muted/15" />
        </div>
        <p className="text-[10px] text-chalk-muted leading-relaxed" style={{ fontFamily: 'var(--font-mono)' }}>
          Thicker bed = more marks in exam
        </p>
      </div>
    </main>
  );
}
