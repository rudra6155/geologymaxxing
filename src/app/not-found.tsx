import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: "This page doesn't exist — head back to geology.filtree.in.",
};

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden bg-basalt">
      <div className="absolute inset-0 bed-texture bed-slate opacity-60 pointer-events-none" />

      <div className="relative text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-oxide/10 border border-oxide/20 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-oxide" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l4-7 4 9 4-9 4 7h2" />
          </svg>
        </div>

        <p
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-oxide mb-2"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          404 · Fault Line
        </p>
        <h1
          className="text-2xl font-bold text-chalk mb-3 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          This ground hasn&apos;t been mapped.
        </h1>
        <p className="text-sm text-chalk-dim leading-relaxed mb-7">
          The page you&apos;re looking for shifted, eroded, or never existed.
          Let&apos;s get you back to solid rock.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-basalt font-semibold text-sm bg-core hover:bg-core-bright transition-colors px-5 py-2.5 rounded-full"
        >
          Back to base camp
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
