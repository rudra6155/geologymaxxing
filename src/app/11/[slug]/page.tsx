import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadChapter } from '@/lib/content-loader';
import { getAllChapterSlugs, getChapterMeta } from '@/lib/chapter-registry';
import { ChapterView } from '@/components/chapter/ChapterView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllChapterSlugs(11).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getChapterMeta(11, slug);
  if (!meta) return { title: 'Chapter Not Found' };

  return {
    title: `${meta.title} — Std ${meta.std} Geology`,
    description: meta.summary,
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getChapterMeta(11, slug);

  if (!meta) {
    notFound();
  }

  const chapter = loadChapter(meta.std, slug);

  // Coming soon state — chapter exists in registry but JSON not yet authored
  if (!chapter) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4">
        <Link
          href="/11"
          className="self-start mb-8 inline-flex items-center gap-1 text-chalk-muted text-xs font-medium 
                     hover:text-chalk transition-colors absolute top-6 left-4"
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
            {meta.chapterNumber}
          </div>
          <h1
            className="text-xl font-bold text-chalk mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {meta.title}
          </h1>
          <p className="text-sm text-chalk-dim mb-6 leading-relaxed">
            {meta.summary}
          </p>
          <div className="inline-flex items-center gap-2 text-core text-sm font-medium px-4 py-2 
                          bg-core/10 border border-core/20 rounded-full">
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Content being authored — check back soon
          </div>
          {meta.marksWeightage && (
            <p
              className="mt-4 text-xs text-chalk-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {meta.marksWeightage} marks in board exam
            </p>
          )}
        </div>
      </main>
    );
  }

  return <ChapterView chapter={chapter} />;
}
