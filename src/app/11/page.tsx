import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Std 11 — Coming Soon',
  description: 'Std 11 Geology content is being authored. Check back soon.',
};

export default function Std11Page() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="absolute top-6 left-4 inline-flex items-center gap-1 text-chalk-muted text-xs font-medium 
                   hover:text-chalk transition-colors"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-full bg-basalt-lighter flex items-center justify-center 
                      text-2xl font-bold text-chalk-muted mx-auto mb-4"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          11
        </div>
        <h1
          className="text-xl font-bold text-chalk mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Standard 11 — FYJC Geology
        </h1>
        <p className="text-sm text-chalk-dim leading-relaxed mb-6">
          Content for Std 11 is being authored. We&apos;ll add chapters here as they&apos;re ready.
        </p>
        <div className="inline-flex items-center gap-2 text-core text-sm font-medium px-4 py-2 
                        bg-core/10 border border-core/20 rounded-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Coming soon
        </div>
      </div>
    </main>
  );
}
