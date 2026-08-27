import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Std 11 — Coming Soon',
  description: 'Std 11 Geology content is being authored. Check back soon.',
};

export default function Std11Page() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden bg-basalt">
      <div className="absolute inset-0 bed-texture bed-ironstone opacity-70 pointer-events-none" />

      <Link
        href="/"
        className="absolute top-6 left-4 z-10 inline-flex items-center gap-1 text-chalk-muted text-xs font-medium
                   hover:text-chalk transition-colors"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="relative text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-full bg-fieldnote border border-fieldnote-lighter/60 flex items-center justify-center
                      text-2xl font-bold text-chalk-muted mx-auto mb-5"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          11
        </div>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-core mb-2"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          FYJC · In the field
        </p>
        <h1
          className="text-xl font-bold text-chalk mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Standard 11 Geology
        </h1>
        <p className="text-sm text-chalk-dim leading-relaxed mb-6">
          The foundation chapters are still being surveyed. Std 12&apos;s full
          syllabus, AI tutor, and streak drills are live right now if you want
          to start there instead.
        </p>
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 text-core text-sm font-medium px-4 py-2
                          bg-core/10 border border-core/20 rounded-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Coming soon
          </div>
          <Link
            href="/12"
            className="group inline-flex items-center gap-1.5 text-chalk-muted text-xs font-medium hover:text-chalk transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Go to Std 12 instead
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
