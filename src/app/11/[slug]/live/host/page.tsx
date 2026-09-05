import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadChapter } from '@/lib/content-loader';
import { getAllChapterSlugs, getChapterMeta } from '@/lib/chapter-registry';
import { LiveHostView } from '@/components/live/LiveHostView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllChapterSlugs(11).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getChapterMeta(11, slug);
  if (!meta) return { title: 'Live Host Not Found' };

  return {
    title: `Host Live Quiz — ${meta.title}`,
    description: `Host a live classroom quiz for ${meta.title}, Std ${meta.std} Geology.`,
  };
}

export default async function LiveHostPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getChapterMeta(11, slug);

  if (!meta) {
    notFound();
  }

  const chapter = loadChapter(meta.std, slug);

  if (!chapter || chapter.questions.length === 0) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-chalk mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Live Quiz — {meta.title}
          </h1>
          <p className="text-sm text-chalk-dim">
            No quiz questions available for this chapter yet.
          </p>
        </div>
      </main>
    );
  }

  return <LiveHostView chapter={chapter} />;
}
