import type { Metadata } from 'next';
import { STD_12_CHAPTERS } from '@/lib/chapter-registry';
import { loadChapter } from '@/lib/content-loader';
import { ProfileView } from '@/components/profile/ProfileView';

export const metadata: Metadata = {
  title: 'Student Profile',
  description: 'Your progress across the Geology syllabus.',
};

export default function ProfilePage() {
  // We can load the syllabus structure on the server statically at build time.
  // Because we do not use cookies() or headers() here, this page will be 
  // Statically Generated (SSG), making it available offline via PWA caching!
  
  const syllabus = STD_12_CHAPTERS.map(meta => {
    if (!meta.available) {
      return { ...meta, totalTopics: 0, topics: [] };
    }
    const chapter = loadChapter(meta.std, meta.slug);
    return {
      ...meta,
      totalTopics: chapter ? chapter.topics.length : 0,
      topics: chapter ? chapter.topics.map(t => ({ id: t.id, title: t.title })) : [],
    };
  });

  return <ProfileView syllabus={syllabus} />;
}
