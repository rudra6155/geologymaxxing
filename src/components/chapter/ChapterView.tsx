'use client';

import { useMemo, useState } from 'react';
import type { Chapter, DepthView } from '@/lib/types';
import { DEPTH_VIEWS, filterTopicsByDepth } from '@/lib/depth-filter';
import { CoreSampleRail } from './CoreSampleRail';
import { ChapterOverview } from './ChapterOverview';
import { StudyMode } from './StudyMode';
import { AskAiButton } from '@/components/chat/AskAiButton';

type Mode = 'overview' | 'study';

interface ChapterViewProps {
  chapter: Chapter;
}

export function ChapterView({ chapter }: ChapterViewProps) {
  const [mode, setMode] = useState<Mode>('overview');
  const [depthView, setDepthView] = useState<DepthView>('revision');

  // Per-depth stats (sections/topics/rough reading time) for the overview cards.
  const depthStats = useMemo(() => {
    const totalBlocks = chapter.topics.reduce((sum, t) => sum + t.blocks.length, 0);
    const result = {} as Record<DepthView, { topics: number; blocks: number; minutes: number }>;
    for (const view of DEPTH_VIEWS) {
      const topics = filterTopicsByDepth(chapter.topics, view);
      const blocks = topics.reduce((sum, t) => sum + t.blocks.length, 0);
      result[view] = {
        topics: topics.length,
        blocks,
        minutes:
          view === 'full'
            ? chapter.estimatedMinutes
            : Math.max(1, Math.round((chapter.estimatedMinutes * blocks) / Math.max(1, totalBlocks))),
      };
    }
    return result;
  }, [chapter]);

  const filteredTopics = useMemo(
    () => filterTopicsByDepth(chapter.topics, depthView),
    [chapter.topics, depthView]
  );

  function enterStudy(depth: DepthView) {
    setDepthView(depth);
    setMode('study');
    window.scrollTo(0, 0);
  }

  function exitStudy() {
    setMode('overview');
    window.scrollTo(0, 0);
  }

  return (
    <>
      <CoreSampleRail />
      {mode === 'overview' ? (
        <ChapterOverview chapter={chapter} depthStats={depthStats} onSelectDepth={enterStudy} />
      ) : (
        <StudyMode
          chapter={chapter}
          depthView={depthView}
          topics={filteredTopics}
          onExit={exitStudy}
          onChangeDepth={setDepthView}
        />
      )}
      <AskAiButton chapterSlug={chapter.slug} />
    </>
  );
}
