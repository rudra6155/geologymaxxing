import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'geology.filtree.in — Choose Your Standard',
};

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col relative overflow-hidden bg-basalt">
      
      {/* Geological cross-section background — layered strata gradients */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep mantle glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[rgba(168,69,47,0.08)] to-transparent" />
        {/* Upper crust cool tone */}
        <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-[rgba(55,80,90,0.06)] to-transparent" />
        {/* Core accent */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-core/5 rounded-full blur-[120px] mix-blend-screen" />
        {/* Horizontal strata lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            repeating-linear-gradient(
              180deg,
              transparent,
              transparent 80px,
              rgba(237,230,214,0.015) 80px,
              rgba(237,230,214,0.015) 81px
            )
          `
        }} />
        {/* Dot grain */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-chalk) 0.5px, transparent 0)', backgroundSize: '24px 24px' }} 
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-5 pt-safe">
        
        {/* Top Section — Branding + Badge */}
        <header className="pt-10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-core/15 bg-core/5 text-core text-[10px] font-mono uppercase tracking-[0.15em] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-core animate-pulse" />
            2026 Session
          </div>
          
          {/* Site name — rendered with geological weight */}
          <h1 className="mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="block text-[2.75rem] leading-[1.05] font-bold bg-clip-text text-transparent bg-gradient-to-br from-core via-core-bright to-chalk">
              geology
            </span>
            <span className="block text-xl text-chalk-muted font-light tracking-tight -mt-1">
              .filtree.in
            </span>
          </h1>
          
          <p className="text-chalk-dim text-[15px] leading-relaxed max-w-[320px]">
            Maharashtra State Board Geology — interactive revision, practice, and live quizzes.
          </p>
        </header>

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
        <div className="flex-1 flex flex-col justify-center gap-4 py-6">
          
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

          {/* Std 11 — Locked Fossil Imprint */}
          <div
            className="strata-animate relative w-full rounded-2xl overflow-hidden opacity-60"
            style={{ animationDelay: '250ms' }}
          >
            {/* Muted stone background */}
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
                    className="text-xl font-semibold text-chalk-dim mt-1 leading-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    FYJC Geology
                  </h2>
                </div>
                <span className="text-[10px] text-chalk-muted font-medium px-2.5 py-1 rounded-full bg-chalk/5 border border-chalk/8 mt-1"
                      style={{ fontFamily: 'var(--font-mono)' }}>
                  In Dev
                </span>
              </div>
              
              <p className="text-chalk-muted text-sm leading-relaxed max-w-[280px]">
                Foundation modules are being authored. Coming soon.
              </p>
              
              {/* Fossil imprint / locked indicator */}
              <div className="mt-5 flex items-center gap-2 text-chalk-muted/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="text-xs font-medium">Locked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Field Notebook Footer */}
        <footer className="pb-8 safe-bottom">
          <div className="relative bg-fieldnote/50 border border-fieldnote-lighter/30 rounded-xl px-4 py-3 backdrop-blur-sm">
            {/* Torn paper top edge */}
            <div className="absolute -top-[1px] left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-fieldnote-lighter/40 to-transparent" 
                 style={{ maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 2 Q5 0 10 2 Q15 4 20 2 Q25 0 30 2 Q35 4 40 2 Q45 0 50 2 Q55 4 60 2 Q65 0 70 2 Q75 4 80 2 Q85 0 90 2 Q95 4 100 2 Q105 0 110 2 Q115 4 120 2 Q125 0 130 2 Q135 4 140 2 Q145 0 150 2 Q155 4 160 2 Q165 0 170 2 Q175 4 180 2 Q185 0 190 2 Q195 4 200 2\' fill=\'white\'/%3E%3C/svg%3E")', WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 2 Q5 0 10 2 Q15 4 20 2 Q25 0 30 2 Q35 4 40 2 Q45 0 50 2 Q55 4 60 2 Q65 0 70 2 Q75 4 80 2 Q85 0 90 2 Q95 4 100 2 Q105 0 110 2 Q115 4 120 2 Q125 0 130 2 Q135 4 140 2 Q145 0 150 2 Q155 4 160 2 Q165 0 170 2 Q175 4 180 2 Q185 0 190 2 Q195 4 200 2\' fill=\'white\'/%3E%3C/svg%3E")' }} />
            
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
