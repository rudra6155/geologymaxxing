import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'geology.filtree.in — Choose Your Standard',
};

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-12">
      {/* Logo / Brand */}
      <div className="text-center mb-12">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="text-core">geology</span>
          <span className="text-chalk-muted">.filtree.in</span>
        </h1>
        <p className="text-chalk-dim text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
          Free study guide for Maharashtra State Board Geology
        </p>
      </div>

      {/* Standard Cards */}
      <div className="w-full max-w-sm space-y-4">
        {/* Std 12 — Available */}
        <Link
          href="/12"
          className="group block w-full rounded-xl border border-basalt-lighter bg-basalt-light p-6 
                     transition-all duration-200 hover:border-core/40 hover:bg-basalt-lighter
                     focus-visible:outline-2 focus-visible:outline-core focus-visible:outline-offset-2"
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-semibold uppercase tracking-widest text-core"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Standard 12
            </span>
            <span className="text-xs text-moss font-medium px-2 py-0.5 rounded-full bg-moss/10 border border-moss/20">
              8 chapters
            </span>
          </div>
          <p className="text-chalk text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            HSC Geology
          </p>
          <p className="text-chalk-dim text-sm leading-relaxed">
            Board exam preparation — lessons, revision sheets, last-minute notes, and practice questions.
          </p>
          <div className="mt-4 flex items-center gap-2 text-core text-sm font-medium group-hover:gap-3 transition-all duration-200">
            <span>Start studying</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </Link>

        {/* Std 11 — Coming Soon */}
        <div
          className="block w-full rounded-xl border border-basalt-lighter/50 bg-basalt-light/50 p-6 opacity-60 cursor-not-allowed"
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-semibold uppercase tracking-widest text-chalk-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Standard 11
            </span>
            <span className="text-xs text-chalk-muted font-medium px-2 py-0.5 rounded-full bg-chalk/5 border border-chalk/10">
              Coming soon
            </span>
          </div>
          <p className="text-chalk-dim text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            FYJC Geology
          </p>
          <p className="text-chalk-muted text-sm leading-relaxed">
            Content for Std 11 is being authored. Check back soon.
          </p>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-12 text-xs text-chalk-muted text-center max-w-xs">
        Works offline once loaded. Open a chapter on WiFi, study anywhere after.
      </p>
    </main>
  );
}
