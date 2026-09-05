import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadChapter } from '@/lib/content-loader';
import { getAllChapterSlugs, getChapterMeta } from '@/lib/chapter-registry';
import { PracticeView } from '@/components/practice/PracticeView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllChapterSlugs(12).map((slug: string) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getChapterMeta(12, slug);
  if (!meta) return { title: 'Practice Not Found' };

  return {
    title: `Practice — ${meta.title}`,
    description: `Practice questions for ${meta.title}, Std ${meta.std} Geology.`,
  };
}

export default async function PracticePage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getChapterMeta(12, slug);

  if (!meta) {
    notFound();
  }

  const chapter = loadChapter(meta.std, slug);

  if (!chapter || chapter.questions.length === 0) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4">
        <Link
          href={chapter ? `/12/${chapter.slug}` : '/12'}
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
          <h1
            className="text-xl font-bold text-chalk mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Practice — {meta.title}
          </h1>
          <p className="text-sm text-chalk-dim">
            {chapter
              ? 'No practice questions available for this chapter yet.'
              : 'This chapter has not been authored yet. Check back soon.'}
          </p>
        </div>
      </main>
    );
  }

  return <PracticeView chapter={chapter} />;
}
