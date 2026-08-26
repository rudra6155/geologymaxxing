'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TopicOutline {
  id: string;
  title: string;
}

interface ChapterSyllabus {
  slug: string;
  chapterNumber: number;
  title: string;
  available: boolean;
  totalTopics: number;
  topics: TopicOutline[];
}

interface ProfileViewProps {
  syllabus: ChapterSyllabus[];
}

export function ProfileView({ syllabus }: ProfileViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [maxStreakGlobal, setMaxStreakGlobal] = useState(0);
  const [gauntletClears, setGauntletClears] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.replace('/?login=true');
          return;
        }
        setUser(user);

        // Fetch parallel
        const [profRes, progRes, gauntletRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('topic_progress').select('*').eq('user_id', user.id),
          supabase.from('gauntlet_runs').select('*').eq('user_id', user.id)
        ]);

        if (profRes.data) setProfile(profRes.data);

        if (progRes.data) {
          const completed = new Set(progRes.data.filter((p: any) => p.status === 'completed').map((p: any) => p.topic_id));
          setCompletedTopics(completed);
        }

        if (gauntletRes.data) {
          const maxStreak = gauntletRes.data.reduce((max: number, run: any) => Math.max(max, run.max_streak), 0);
          const clears = gauntletRes.data.filter((r: any) => r.result === 'cleared').length;
          setMaxStreakGlobal(maxStreak);
          setGauntletClears(clears);
        }
        setOffline(false);
      } catch (error) {
        console.error('Failed to load profile data:', error);
        setOffline(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-core border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col pb-16">
      <header className="px-4 py-6 border-b border-basalt-lighter/30">
        <Link
          href="/12"
          className="inline-flex items-center gap-1 text-chalk-muted text-xs font-medium 
                     hover:text-chalk transition-colors mb-4"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold text-chalk" style={{ fontFamily: 'var(--font-display)' }}>
          {profile?.display_name || user?.email?.split('@')[0] || 'Student Profile'}
        </h1>
        <p className="text-sm text-chalk-dim" style={{ fontFamily: 'var(--font-mono)' }}>
          Std {profile?.std || 12} Geology
        </p>

        {offline && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-oxide/10 text-oxide text-xs font-medium rounded border border-oxide/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Offline Mode: Showing cached stats or unavailable
          </div>
        )}

        <form action="/auth/signout" method="post" className="mt-4">
          <button type="submit" className="text-xs text-oxide underline hover:text-oxide-bright transition-colors">
            Sign out
          </button>
        </form>
      </header>

      {/* Global Stats */}
      <section className="px-4 py-6">
        <div className="flex gap-4">
          <div className="flex-1 bg-fieldnote border border-fieldnote-lighter/50 rounded-lg p-4">
            <span className="block text-[0.625rem] text-chalk-muted font-bold tracking-widest uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Topics Cleared
            </span>
            <span className="text-2xl font-bold text-chalk" style={{ fontFamily: 'var(--font-mono)' }}>
              {completedTopics.size}
            </span>
          </div>
          <div className="flex-1 bg-fieldnote border border-fieldnote-lighter/50 rounded-lg p-4">
            <span className="block text-[0.625rem] text-chalk-muted font-bold tracking-widest uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Max Streak
            </span>
            <span className="text-2xl font-bold text-core" style={{ fontFamily: 'var(--font-mono)' }}>
              {maxStreakGlobal}
            </span>
          </div>
          <div className="flex-1 bg-fieldnote border border-fieldnote-lighter/50 rounded-lg p-4">
            <span className="block text-[0.625rem] text-chalk-muted font-bold tracking-widest uppercase mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Gauntlet Wins
            </span>
            <span className="text-2xl font-bold text-moss" style={{ fontFamily: 'var(--font-mono)' }}>
              {gauntletClears}
            </span>
          </div>
        </div>
      </section>

      {/* Core Sample Progress */}
      <section className="px-4 py-4">
        <h2 className="text-sm font-bold text-chalk mb-6 uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
          Syllabus Core Sample
        </h2>
        
        <div className="space-y-4">
          {syllabus.map(chapter => {
            if (!chapter.available || chapter.totalTopics === 0) return null;

            const completedCount = chapter.topics.filter(t => completedTopics.has(t.id)).length;

            return (
              <div key={chapter.slug} className="mb-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-semibold text-chalk" style={{ fontFamily: 'var(--font-display)' }}>
                    {chapter.chapterNumber}. {chapter.title}
                  </span>
                  <span className="text-[0.625rem] text-chalk-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                    {completedCount} / {chapter.totalTopics} topics
                  </span>
                </div>
                
                {/* The Core Sample Visualizer for this chapter */}
                <div className="h-4 bg-basalt-lighter rounded-sm overflow-hidden flex border border-basalt-lighter">
                  {chapter.topics.map(topic => {
                    const isCompleted = completedTopics.has(topic.id);
                    return (
                      <div 
                        key={topic.id}
                        className={`h-full border-r border-basalt last:border-r-0 transition-colors ${
                          isCompleted ? 'bg-core opacity-90' : 'bg-transparent'
                        }`}
                        style={{ width: `${100 / chapter.totalTopics}%` }}
                        title={topic.title}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
