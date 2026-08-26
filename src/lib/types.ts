/**
 * TypeScript types for geology.filtree.in content schema v1.0
 * Mirrors CONTENT_SCHEMA.md exactly. Do not add fields without updating the schema first.
 */

// ─── Source & Verification ───────────────────────────────────────────

export type SourceType = 'textbook' | 'notes' | 'questionBank' | 'external';

export interface Source {
  type: SourceType;
  ref: string;
  /** Required when type === 'external' */
  note?: string;
}

// ─── Blocks ──────────────────────────────────────────────────────────

export type Depth = 1 | 2 | 3;

export type BlockType =
  | 'definition'
  | 'explanation'
  | 'list'
  | 'steps'
  | 'callout'
  | 'mnemonic'
  | 'example'
  | 'formula'
  | 'diagramRef'
  | 'conflict';

export interface Block {
  id: string;
  type: BlockType;
  depth: Depth;
  title?: string;
  /** Inline markdown only — no headings, tables, images, or HTML */
  body?: string;
  /** For list and steps types */
  items?: string[];
  /** For diagramRef type — must match a Diagram.id */
  diagramId?: string;
  source: Source;
  verified: boolean;
  tags?: string[];
}

// ─── Topics ──────────────────────────────────────────────────────────

export interface Topic {
  id: string;
  title: string;
  slug: string;
  order: number;
  estimatedMinutes: number;
  blocks: Block[];
}

// ─── Diagrams ────────────────────────────────────────────────────────

export type DiagramFormat = 'svg' | 'image';

export interface Diagram {
  id: string;
  title: string;
  format: DiagramFormat;
  /** Required when format === 'svg' — full inline <svg> markup */
  svg?: string;
  /** Required when format === 'image' — path under /assets/ */
  src?: string;
  alt: string;
  caption?: string;
  /** Labels a student MUST write to score full marks */
  requiredLabels: string[];
  topicId: string;
  source: Source;
  verified: boolean;
}

// ─── Questions ───────────────────────────────────────────────────────

export type QuestionType =
  | 'mcq'
  | 'oddOneOut'
  | 'matchPairs'
  | 'shortAnswer'
  | 'diagramLabel'
  | 'distinguish';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Option {
  id: string;
  text: string;
}

export interface Pair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  topicId: string;
  type: QuestionType;
  marks: number;
  difficulty: Difficulty;
  prompt: string;
  /** Required for mcq and oddOneOut */
  options?: Option[];
  /** Required for matchPairs */
  pairs?: Pair[];
  /** Option id(s) — required for mcq, oddOneOut */
  correct?: string | string[];
  /** Model answer for shortAnswer / distinguish / diagramLabel */
  answer?: string;
  explanation: string;
  diagramId?: string;
  /** true if answerable one-handed on a phone with no writing */
  phoneFriendly: boolean;
  /** true if teacher flagged as likely exam question */
  teacherFlagged: boolean;
  source: Source;
  verified: boolean;
}

// ─── Distinguish Pairs ───────────────────────────────────────────────

export interface DistinguishRow {
  aspect: string;
  a: string;
  b: string;
}

export interface DistinguishPair {
  id: string;
  topicId: string;
  itemA: string;
  itemB: string;
  rows: DistinguishRow[];
  marks: number;
  source: Source;
  verified: boolean;
}

// ─── Glossary ────────────────────────────────────────────────────────

export interface GlossaryEntry {
  term: string;
  definition: string;
  topicId?: string;
  source: Source;
}

// ─── Meta ────────────────────────────────────────────────────────────

export type ReviewStatus = 'draft' | 'human-reviewed';

export interface Meta {
  schemaVersion: string;
  lastUpdated: string;
  authoredBy: string;
  reviewStatus: ReviewStatus;
  sourceDocuments: string[];
  openQuestions: string[];
}

// ─── Chapter (root object) ───────────────────────────────────────────

export interface Chapter {
  id: string;
  std: 11 | 12;
  chapterNumber: number;
  title: string;
  slug: string;
  textbookPages: string;
  marksWeightage: number | null;
  estimatedMinutes: number;
  summary: string;
  topics: Topic[];
  diagrams: Diagram[];
  questions: Question[];
  distinguishPairs: DistinguishPair[];
  glossary: GlossaryEntry[];
  meta: Meta;
}

// ─── View types ──────────────────────────────────────────────────────

export type DepthView = 'last-minute' | 'revision' | 'full';
