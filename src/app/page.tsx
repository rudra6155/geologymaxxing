import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'geology.filtree.in — Choose Your Standard',
};

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col px-6 py-12 md:py-24 bg-basalt selection:bg-core/30">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
        
        {/* Header / Brand */}
        <header className="mb-12 md:mb-16">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="text-core">geology</span>
            <span className="text-chalk-muted">.filtree.in</span>
          </h1>
          <p className="text-chalk-dim text-base md:text-lg max-w-md leading-relaxed">
            Free, open-source study guide for Maharashtra State Board Geology.
          </p>
        </header>

        {/* Standard Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
          
          {/* Std 12 — Available */}
          <Link
            href="/12"
            className="group flex flex-col justify-between w-full rounded-2xl border border-basalt-lighter bg-basalt-light p-6 md:p-8
                       transition-all duration-200 hover:border-core/40 hover:bg-basalt-lighter
                       focus-visible:outline-2 focus-visible:outline-core focus-visible:outline-offset-2"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span
                  className="text-xs font-semibold uppercase tracking-widest text-core"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Standard 12
                </span>
                <span className="text-xs text-moss font-medium px-2.5 py-1 rounded-full bg-moss/10 border border-moss/20">
                  8 Chapters
                </span>
              </div>
              
              <h2 className="text-chalk text-2xl md:text-3xl font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                HSC Geology
              </h2>
              
              <p className="text-chalk-dim text-sm md:text-base leading-relaxed">
                Complete board exam preparation including lessons, revision sheets, and practice modules.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-core text-sm font-medium transition-transform group-hover:translate-x-1">
              <span>Open curriculum</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          {/* Std 11 — Coming Soon */}
          <div
            className="flex flex-col justify-between w-full rounded-2xl border border-basalt-lighter/50 bg-basalt-light/30 p-6 md:p-8 opacity-60"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span
                  className="text-xs font-semibold uppercase tracking-widest text-chalk-muted"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Standard 11
                </span>
                <span className="text-xs text-chalk-muted font-medium px-2.5 py-1 rounded-full bg-chalk/5 border border-chalk/10">
                  Authoring
                </span>
              </div>
              
              <h2 className="text-chalk-dim text-2xl md:text-3xl font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                FYJC Geology
              </h2>
              
              <p className="text-chalk-muted text-sm md:text-base leading-relaxed">
                Foundational content for Std 11 is currently being authored. Check back later.
              </p>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="mt-auto pt-16">
          <div className="inline-flex items-center gap-2 text-xs text-chalk-muted bg-basalt-light/50 px-3 py-1.5 rounded-md border border-basalt-lighter/50">
            <div className="w-1.5 h-1.5 rounded-full bg-moss/80"></div>
            <p>Works offline. Install the app or cache a chapter to study anywhere.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
