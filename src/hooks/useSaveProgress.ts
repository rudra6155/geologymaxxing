'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export function useSaveProgress() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const promptLogin = () => {
    router.push(`${pathname}?login=true`);
  };

  const saveAttempts = async (topicId: string, attempts: { questionId: string; correct: boolean }[]) => {
    if (!user) return false;
    if (attempts.length === 0) return true;

    try {
      const { error } = await supabase.from('question_attempts').insert(
        attempts.map(a => ({
          user_id: user.id,
          topic_id: topicId,
          question_id: a.questionId,
          is_correct: a.correct,
        }))
      );
      if (error) throw error;

      // Update topic status
      await supabase.from('topic_progress').upsert(
        {
          user_id: user.id,
          topic_id: topicId,
          status: 'completed',
          last_viewed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,topic_id' }
      );

      return true;
    } catch (err) {
      console.error('Failed to save attempts:', err);
      return false;
    }
  };

  const saveGauntletRun = async (
    topicId: string, 
    startedAt: string, 
    endedAt: string, 
    result: 'cleared' | 'broken', 
    maxStreak: number
  ) => {
    if (!user) {
      // Store locally if not logged in to save post-login?
      // For now, return false.
      return false;
    }
    
    try {
      const { error } = await supabase.from('gauntlet_runs').insert({
        user_id: user.id,
        topic_id: topicId,
        started_at: startedAt,
        ended_at: endedAt,
        result,
        max_streak: maxStreak,
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to save gauntlet run:', err);
      return false;
    }
  };

  return {
    user,
    loading,
    promptLogin,
    saveAttempts,
    saveGauntletRun,
  };
}
