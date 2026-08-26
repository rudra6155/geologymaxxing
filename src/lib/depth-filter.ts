import type { Block, Topic, DepthView } from './types';

/**
 * The ONE depth-filtering function. Used everywhere the depth switcher appears.
 * 
 * - last-minute: depth === 1 (absolutely must know)
 * - revision:    depth <= 2  (standard exam material)
 * - full:        all blocks  (depth, context, examples)
 */
export function filterBlocksByDepth(blocks: Block[], view: DepthView): Block[] {
  switch (view) {
    case 'last-minute':
      return blocks.filter((b) => b.depth === 1);
    case 'revision':
      return blocks.filter((b) => b.depth <= 2);
    case 'full':
      return blocks;
  }
}

/**
 * Filter an entire topic's blocks by depth view.
 * Returns a new topic with filtered blocks. If all blocks are filtered out,
 * returns null (the topic should be hidden in that view).
 */
export function filterTopicByDepth(topic: Topic, view: DepthView): Topic | null {
  const filtered = filterBlocksByDepth(topic.blocks, view);
  if (filtered.length === 0) return null;
  return { ...topic, blocks: filtered };
}

/**
 * Filter all topics in a chapter by depth view.
 * Returns only topics that have at least one block at the requested depth.
 */
export function filterTopicsByDepth(topics: Topic[], view: DepthView): Topic[] {
  return topics
    .map((t) => filterTopicByDepth(t, view))
    .filter((t): t is Topic => t !== null);
}

/**
 * Get human-readable labels for each depth view.
 */
export function getDepthViewLabel(view: DepthView): string {
  switch (view) {
    case 'last-minute':
      return 'Last-minute';
    case 'revision':
      return 'Revision';
    case 'full':
      return 'Full lesson';
  }
}

/**
 * Get a short description for the depth view.
 */
export function getDepthViewDescription(view: DepthView): string {
  switch (view) {
    case 'last-minute':
      return 'Only the essentials — what you\'d lose marks without';
    case 'revision':
      return 'Standard exam material — everything expected in a full answer';
    case 'full':
      return 'Complete lesson with depth, context, and extra examples';
  }
}

export const DEPTH_VIEWS: DepthView[] = ['last-minute', 'revision', 'full'];
