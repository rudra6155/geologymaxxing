import Link from 'next/link';
import type { Metadata } from 'next';
import { HeroAnimation, HeroHeadline } from '@/components/hero/HeroAnimation';

export const metadata: Metadata = {
  title: 'geology.filtree.in — Maharashtra Board Geology Study Guide',
};

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-basalt">

      {/* ─── Hero Animation (viewport 1) ──────────────────────────── */}
      <HeroAnimation />

      {/* ─── Beat 6: Headline + Description (on scroll) ───────────── */}
      <HeroHeadline />

      {/* ─── Page Content (below the fold) ────────────────────────── */}
      <div className="relative z-10 flex flex-col px-5">

        {/* Core Sample Divider — visual geology motif */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-basalt-lighter to-transparent" />
          <div className="flex flex-col gap-[2px]">
            <div className="w-6 h-1.5 rounded-sm bg-[rgba(95,80,65,0.5)]" />
            <div className="w-6 h-2.5 rounded-sm bg-[rgba(75,85,72,0.5)]" />
            <div className="w-6 h-1 rounded-sm bg-[rgba(70,65,80,0.5)]" />
            <div className="w-6 h-2 rounded-sm bg-core/30" />
            <div className="w-6 h-1.5 rounded-sm bg-[rgba(90,60,55,0.5)]" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-basalt-lighter to-transparent" />
        </div>

        {/* Standard Cards */}
        <div className="flex flex-col gap-4 py-6">
          
          {/* Std 12 — Big Rock Slab */}
          <Link
            href="/12"
            className="strata-animate group relative w-full rounded-2xl overflow-hidden
                       transition-all duration-300 active:scale-[0.98]"
            style={{ animationDelay: '100ms' }}
          >
            {/* Rock slab background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(89,73,55,0.4)] via-fieldnote to-[rgba(95,80,65,0.35)]" />
            <div className="absolute inset-0 bed-texture bed-sandstone" />
            {/* Gold vein accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-core/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-core/20 to-transparent" />
            
            <div className="relative px-5 py-7">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-core"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Standard 12
                  </span>
                  <h2 
                    className="text-[1.75rem] font-bold text-chalk mt-1 leading-tight group-hover:text-core-bright transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    HSC Geology
                  </h2>
                </div>
                <span className="text-[10px] text-moss-bright font-semibold px-2.5 py-1 rounded-full bg-moss/15 border border-moss/20 mt-1"
                      style={{ fontFamily: 'var(--font-mono)' }}>
                  8 Chapters
                </span>
              </div>
              
              <p className="text-chalk-dim text-sm leading-relaxed mb-6 max-w-[280px]">
                Complete board exam prep — revision sheets, practice, live quizzes, and Vandana AI doubt solver.
              </p>
              
              {/* Strata preview — mini bed visualization */}
              <div className="flex gap-[3px] mb-6 h-3 rounded-sm overflow-hidden">
                <div className="flex-[7] bg-[rgba(89,73,55,0.6)] rounded-sm" title="Ch1: 7m" />
                <div className="flex-[17] bg-[rgba(75,85,72,0.6)] rounded-sm" title="Ch2: 17m" />
                <div className="flex-[16] bg-[rgba(95,80,65,0.6)] rounded-sm" title="Ch3: 16m" />
                <div className="flex-[17] bg-core/30 rounded-sm" title="Ch4: 17m" />
                <div className="flex-[16] bg-[rgba(100,75,55,0.6)] rounded-sm" title="Ch5: 16m" />
                <div className="flex-[11] bg-[rgba(55,80,90,0.6)] rounded-sm" title="Ch6: 11m" />
                <div className="flex-[7] bg-[rgba(90,60,55,0.6)] rounded-sm" title="Ch7: 7m" />
                <div className="flex-[7] bg-[rgba(65,75,85,0.6)] rounded-sm" title="Ch8: 7m" />
              </div>
              
              <div className="flex items-center gap-2 text-core-bright font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                <span className="relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-core-bright after:scale-x-0 after:origin-left group-hover:after:scale-x-100 after:transition-transform after:duration-300">
                  Begin exploration
                </span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Std 11 — Active Rock Slab */}
          <Link
            href="/11"
            className="strata-animate group relative w-full rounded-2xl overflow-hidden
                       transition-all duration-300 active:scale-[0.98]"
            style={{ animationDelay: '250ms' }}
          >
            {/* Rock slab background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-basalt-light to-basalt" />
            <div className="absolute inset-0 bed-texture bed-shale" />
            
            <div className="relative px-5 py-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-chalk-muted"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Standard 11
                  </span>
                  <h2 
                    className="text-xl font-semibold text-chalk mt-1 leading-tight group-hover:text-chalk transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    FYJC Geology
                  </h2>
                </div>
                <span className="text-[10px] text-chalk-muted font-medium px-2.5 py-1 rounded-full bg-chalk/5 border border-chalk/8 mt-1"
                      style={{ fontFamily: 'var(--font-mono)' }}>
                  6 Chapters
                </span>
              </div>
              
              <p className="text-chalk-dim text-sm leading-relaxed mb-6 max-w-[280px]">
                Foundation modules including Mineralogy, Rock Forming Processes, and Geological Agents.
              </p>
              
              <div className="flex items-center gap-2 text-chalk-muted font-semibold text-sm group-hover:text-chalk transition-all duration-300">
                <span className="relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-chalk after:scale-x-0 after:origin-left group-hover:after:scale-x-100 after:transition-transform after:duration-300">
                  Begin exploration
                </span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Field Notebook Footer */}
        <footer className="pb-8 safe-bottom">
          <div className="relative bg-fieldnote/50 border border-fieldnote-lighter/30 rounded-xl px-4 py-3 backdrop-blur-sm">
            <div className="absolute -top-[1px] left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-fieldnote-lighter/40 to-transparent" />
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-core-dim shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <p className="text-chalk-muted text-xs leading-relaxed">
                Works offline once loaded. Study anywhere, anytime.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
