import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loadChapter } from '@/lib/content-loader';
import { LiveParticipantView } from '@/components/live/LiveParticipantView';

interface PageProps {
  params: Promise<{ room_code: string }>;
}

export default async function LiveSessionPage({ params }: PageProps) {
  const { room_code } = await params;
  const code = room_code.toUpperCase();
  
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('live_sessions')
    .select('chapter_slug, topic_id')
    .eq('room_code', code)
    .single();

  if (!session) {
    notFound();
  }

  // Load chapter questions
  // Assuming std is 12 for now as all current content is 12. 
  // In a multi-std future, std should be added to live_sessions.
  const chapter = loadChapter(12, session.chapter_slug);

  if (!chapter) {
    notFound();
  }

  // We only need to pass down the questions that belong to this topic and are phone friendly
  const questions = chapter.questions
    .filter(q => q.topicId === session.topic_id && q.phoneFriendly)
    .slice(0, 8); // Max 8

  return <LiveParticipantView initialQuestions={questions} roomCode={code} />;
}
