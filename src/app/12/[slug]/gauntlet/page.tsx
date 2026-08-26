import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadChapter } from '@/lib/content-loader';
import { getAllChapterSlugs, getChapterMeta } from '@/lib/chapter-registry';
import { GauntletView } from '@/components/practice/GauntletView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllChapterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getChapterMeta(slug);
  if (!meta) return { title: 'Gauntlet Not Found' };

  return {
    title: `Gauntlet — ${meta.title}`,
    description: `Lock-in drill gauntlet for ${meta.title}, Std ${meta.std} Geology.`,
  };
}

export default async function GauntletPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getChapterMeta(slug);

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
            Gauntlet — {meta.title}
          </h1>
          <p className="text-sm text-chalk-dim">
            No drill questions available for this chapter yet.
          </p>
        </div>
      </main>
    );
  }

  return <GauntletView chapter={chapter} />;
}
