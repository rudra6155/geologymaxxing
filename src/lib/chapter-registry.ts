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

export const STD_11_CHAPTERS: ChapterMeta[] = [
  {
    std: 11,
    chapterNumber: 1,
    title: 'Introduction to Geology',
    slug: 'introduction-to-geology',
    marksWeightage: 3,
    summary: "Basics of Earth's interior and branches of geology.",
    available: false,
  },
  {
    std: 11,
    chapterNumber: 2,
    title: 'Earth\'s Surface Processes',
    slug: 'earths-surface-processes',
    marksWeightage: 8,
    summary: 'Weathering and soil formation.',
    available: false,
  },
  {
    std: 11,
    chapterNumber: 3,
    title: 'Earth Surface: Landforms',
    slug: 'earth-surface-landforms',
    marksWeightage: 14,
    summary: 'Geological work of wind, glaciers, rivers, and sea — erosional and depositional landforms.',
    available: false,
  },
  {
    std: 11,
    chapterNumber: 4,
    title: 'Rock Forming Processes',
    slug: 'rock-forming-processes',
    marksWeightage: 12,
    summary: 'Origin and formation of igneous, sedimentary, and metamorphic rocks.',
    available: true,
  },
  {
    std: 11,
    chapterNumber: 5,
    title: 'Mineralogy',
    slug: 'mineralogy',
    marksWeightage: 15,
    summary: 'Study of minerals, physical properties, and rock-forming mineral groups.',
    available: true,
  },
  {
    std: 11,
    chapterNumber: 6,
    title: 'Geology of Maharashtra',
    slug: 'geology-of-maharashtra',
    marksWeightage: 18,
    summary: 'Stratigraphy and economic minerals of Maharashtra.',
    available: false,
  }
];

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
    available: true,
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

export const TOTAL_MARKS_11 = STD_11_CHAPTERS.reduce(
  (sum, ch) => sum + (ch.marksWeightage ?? 0),
  0
);

/** Get a chapter's metadata by slug and std */
export function getChapterMeta(std: 11 | 12, slug: string): ChapterMeta | undefined {
  const chapters = std === 11 ? STD_11_CHAPTERS : STD_12_CHAPTERS;
  return chapters.find((ch) => ch.slug === slug);
}

/** Get all available chapter slugs (for generateStaticParams) */
export function getAvailableChapterSlugs(std: 11 | 12): string[] {
  const chapters = std === 11 ? STD_11_CHAPTERS : STD_12_CHAPTERS;
  return chapters.filter((ch) => ch.available).map((ch) => ch.slug);
}

/** Get all chapter slugs (including coming-soon, for generateStaticParams) */
export function getAllChapterSlugs(std: 11 | 12): string[] {
  const chapters = std === 11 ? STD_11_CHAPTERS : STD_12_CHAPTERS;
  return chapters.map((ch) => ch.slug);
}
