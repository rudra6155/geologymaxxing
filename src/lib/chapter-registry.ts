/**
 * Chapter registry — metadata for all chapters in the syllabus.
 * 
 * This provides the strata display data even when JSON files don't exist yet.
 * When a chapter's JSON is authored, the content loader reads it;
 * this registry only provides the shell (title, slug, marks, etc.).
 */

export interface ChapterMeta {
  std: 11 | 12;
  chapterNumber: number;
  title: string;
  slug: string;
  marksWeightage: number | null;
  summary: string;
  available: boolean;
}

export const STD_12_CHAPTERS: ChapterMeta[] = [
  {
    std: 12,
    chapterNumber: 1,
    title: 'The Dynamic Earth',
    slug: 'the-dynamic-earth',
    marksWeightage: 7,
    summary: "Earth's interior, plate tectonics, earthquakes, and volcanoes.",
    available: false,
  },
  {
    std: 12,
    chapterNumber: 2,
    title: 'Petrology',
    slug: 'petrology',
    marksWeightage: 17,
    summary: 'Classification, identification, and origin of igneous, sedimentary, and metamorphic rocks.',
    available: false,
  },
  {
    std: 12,
    chapterNumber: 3,
    title: 'Palaeontology and Stratigraphy',
    slug: 'palaeontology-and-stratigraphy',
    marksWeightage: 16,
    summary: 'Fossils, geological time scale, and the stratigraphic record of India.',
    available: false,
  },
  {
    std: 12,
    chapterNumber: 4,
    title: 'Structural Geology',
    slug: 'structural-geology',
    marksWeightage: 17,
    summary: 'Folds, faults, joints and unconformities — how rocks deform and how to read them in the field.',
    available: true,
  },
  {
    std: 12,
    chapterNumber: 5,
    title: 'Economic Minerals and Rocks',
    slug: 'economic-minerals-and-rocks',
    marksWeightage: 16,
    summary: 'Ore minerals, industrial rocks, and their economic importance in Maharashtra and India.',
    available: false,
  },
  {
    std: 12,
    chapterNumber: 6,
    title: 'Hydrogeology',
    slug: 'hydrogeology',
    marksWeightage: 11,
    summary: 'Groundwater occurrence, movement, quality, and management.',
    available: false,
  },
  {
    std: 12,
    chapterNumber: 7,
    title: 'Geohazards',
    slug: 'geohazards',
    marksWeightage: 7,
    summary: 'Earthquakes, landslides, floods, and volcanic hazards — causes, effects, and mitigation.',
    available: false,
  },
  {
    std: 12,
    chapterNumber: 8,
    title: 'Remote Sensing and GIS',
    slug: 'remote-sensing-and-gis',
    marksWeightage: 7,
    summary: 'Satellite imagery, aerial photographs, and geographic information systems in geology.',
    available: false,
  },
];

/** Total marks across all chapters — used for proportional strata sizing */
export const TOTAL_MARKS_12 = STD_12_CHAPTERS.reduce(
  (sum, ch) => sum + (ch.marksWeightage ?? 0),
  0
);

/** Get a chapter's metadata by slug */
export function getChapterMeta(slug: string): ChapterMeta | undefined {
  return STD_12_CHAPTERS.find((ch) => ch.slug === slug);
}

/** Get all available chapter slugs (for generateStaticParams) */
export function getAvailableChapterSlugs(): string[] {
  return STD_12_CHAPTERS.filter((ch) => ch.available).map((ch) => ch.slug);
}

/** Get all chapter slugs (including coming-soon, for generateStaticParams) */
export function getAllChapterSlugs(): string[] {
  return STD_12_CHAPTERS.map((ch) => ch.slug);
}
