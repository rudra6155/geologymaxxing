import fs from 'fs';
import path from 'path';
import type { Chapter } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Load a chapter JSON file at build time.
 * Returns null if the file doesn't exist (chapter not yet authored).
 */
export function loadChapter(std: number, slug: string): Chapter | null {
  const dir = path.join(CONTENT_DIR, String(std));

  if (!fs.existsSync(dir)) return null;

  // Find the JSON file matching the slug (filename format: NN-slug.json)
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const match = files.find((f) => {
    // Extract slug from filename: "04-structural-geology.json" -> "structural-geology"
    const parts = f.replace('.json', '').split('-');
    parts.shift(); // remove the chapter number prefix
    return parts.join('-') === slug;
  });

  if (!match) return null;

  try {
    const raw = fs.readFileSync(path.join(dir, match), 'utf-8');
    const chapter = JSON.parse(raw) as Chapter;
    return {
      ...chapter,
      topics: chapter.topics || [],
      diagrams: chapter.diagrams || [],
      questions: chapter.questions || [],
      distinguishPairs: chapter.distinguishPairs || [],
      glossary: chapter.glossary || [],
    };
  } catch {
    console.error(`Failed to parse chapter file: ${match}`);
    return null;
  }
}

/**
 * Load all available chapters for a standard.
 */
export function loadAllChapters(std: number): Chapter[] {
  const dir = path.join(CONTENT_DIR, String(std));

  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const chapters: Chapter[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const chapter = JSON.parse(raw) as Chapter;
      chapters.push({
        ...chapter,
        topics: chapter.topics || [],
        diagrams: chapter.diagrams || [],
        questions: chapter.questions || [],
        distinguishPairs: chapter.distinguishPairs || [],
        glossary: chapter.glossary || [],
      });
    } catch {
      console.error(`Failed to parse: ${file}`);
    }
  }

  return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
}

/**
 * Get a diagram by ID from a chapter's diagrams array.
 */
export function getDiagramById(chapter: Chapter, diagramId: string) {
  return chapter.diagrams.find((d) => d.id === diagramId) ?? null;
}
