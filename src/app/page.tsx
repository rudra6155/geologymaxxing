import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'geology.filtree.in — Choose Your Standard',
};

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden bg-basalt">
      
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle radial gradient to highlight center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-core/5 rounded-full blur-3xl opacity-50 mix-blend-screen" />
        
        {/* Subtle dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-chalk) 1px, transparent 0)', backgroundSize: '32px 32px' }} 
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-core/20 bg-core/5 text-core text-xs font-mono uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-core animate-pulse" />
            2026 Academic Year
          </div>
          
          <h1
            className="text-5xl sm:text-7xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-core via-core-bright to-chalk">
              geology
            </span>
            <span className="text-chalk-muted font-light">.filtree.in</span>
          </h1>
          
          <p className="text-chalk-dim text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            The definitive study guide for Maharashtra State Board Geology. Master the earth sciences with interactive revision sheets and practice modules.
          </p>
        </div>

        {/* Standard Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Std 12 — Available */}
          <Link
            href="/12"
            className="group relative w-full rounded-2xl border border-basalt-lighter bg-gradient-to-b from-basalt-light to-basalt p-8 
                       transition-all duration-500 hover:border-core/40 hover:shadow-2xl hover:shadow-core/10 hover:-translate-y-1
                       focus-visible:outline-2 focus-visible:outline-core focus-visible:outline-offset-2 overflow-hidden"
          >
            {/* Hover gradient layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-core/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative flex items-center justify-between mb-6">
              <span
                className="text-sm font-semibold uppercase tracking-widest text-core"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Standard 12
              </span>
              <span className="text-xs text-moss-bright font-semibold px-3 py-1 rounded-full bg-moss/15 border border-moss/20 backdrop-blur-sm">
                8 Chapters
              </span>
            </div>
            
            <h2 className="relative text-chalk text-3xl font-semibold mb-3 transition-colors group-hover:text-core-bright" style={{ fontFamily: 'var(--font-display)' }}>
              HSC Geology
            </h2>
            
            <p className="relative text-chalk-dim text-base leading-relaxed mb-8">
              Complete board exam preparation — interactive lessons, revision sheets, last-minute notes, and comprehensive practice questions.
            </p>
            
            <div className="relative mt-auto flex items-center gap-3 text-core-bright font-medium group-hover:gap-5 transition-all duration-300">
              <span className="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-core-bright after:scale-x-0 after:origin-left group-hover:after:scale-x-100 after:transition-transform after:duration-300">
                Begin exploration
              </span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          {/* Std 11 — Coming Soon */}
          <div
            className="relative w-full rounded-2xl border border-basalt-lighter bg-basalt-light/40 p-8 opacity-75 backdrop-blur-sm transition-all duration-300 hover:opacity-100"
          >
            <div className="flex items-center justify-between mb-6">
              <span
                className="text-sm font-semibold uppercase tracking-widest text-chalk-muted"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Standard 11
              </span>
              <span className="text-xs text-chalk-muted font-medium px-3 py-1 rounded-full bg-chalk/5 border border-chalk/10">
                In Development
              </span>
            </div>
            
            <h2 className="text-chalk-dim text-3xl font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              FYJC Geology
            </h2>
            
            <p className="text-chalk-muted text-base leading-relaxed">
              Curriculum for Standard 11 is currently being authored and verified. The foundational modules will be available shortly.
            </p>
            
            {/* Decorative locked icon */}
            <div className="mt-8 flex items-center gap-2 text-chalk-muted/50">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
               </svg>
               <span className="text-sm font-medium">Locked</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-20 flex items-center justify-center gap-3 text-sm text-chalk-muted bg-basalt-light/50 px-5 py-3 rounded-full border border-basalt-lighter">
          <svg className="w-4 h-4 text-core-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <p>
            Works offline once loaded. Study anywhere, anytime.
          </p>
        </div>
      </div>
    </main>
  );
}
