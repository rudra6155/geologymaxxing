# geology.filtree.in — Content Schema Specification

**Version 1.0**

This document is the contract between the content pipeline (Antigravity agents) and
the website build (Claude Code). Both sides must obey it exactly.

Content agents FILL this schema. The website RENDERS this schema. Neither side may
invent fields, rename fields, or change types without this document being updated first.

---

## 1. The core design decision — read this before anything else

There are **no separate files** for the lesson sheet, revision sheet, and last-minute
sheet. Writing three versions of the same chapter would triple the work and guarantee
they drift out of sync.

Instead, **every content block carries a `depth` value**, and the site derives all
three views by filtering:

| depth | Meaning | Appears in |
|---|---|---|
| `1` | Absolutely must know. Would lose marks without it. | Last-minute sheet, Revision sheet, Lesson sheet |
| `2` | Standard exam material. Expected in a full answer. | Revision sheet, Lesson sheet |
| `3` | Depth, context, examples, extra detail. | Lesson sheet only |

- **Last-minute sheet** = `depth === 1`
- **Revision sheet** = `depth <= 2`
- **Lesson sheet / one-shot** = everything

A fact is written **once**, tagged with its depth. This is non-negotiable — it is the
reason the whole system stays maintainable.

---

## 2. File layout

```
content/
  12/
    01-the-dynamic-earth.json
    02-petrology.json
    03-palaeontology-and-stratigraphy.json
    04-structural-geology.json
    05-economic-minerals-and-rocks.json
    06-hydrogeology.json
    07-geohazards.json
    08-remote-sensing-and-gis.json
  11/
    (coming soon — not yet authored)
```

One JSON file per chapter. Filename is `{2-digit chapter number}-{slug}.json`.

Assets (scanned handwritten notes, photographs) live in
`public/assets/12/{chapter-slug}/` and are referenced by path.

---

## 3. Chapter object

The root of every chapter file.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | e.g. `"12-04"` |
| `std` | `11` \| `12` | yes | |
| `chapterNumber` | number | yes | 1–8 |
| `title` | string | yes | Exactly as printed in the textbook |
| `slug` | string | yes | kebab-case, matches filename |
| `textbookPages` | string | yes | e.g. `"44-55"` |
| `marksWeightage` | number \| null | yes | From the official marks distribution; `null` if unknown |
| `estimatedMinutes` | number | yes | Realistic full read-through time |
| `summary` | string | yes | One sentence, max 160 chars. Shown on the chapter card. |
| `topics` | Topic[] | yes | The teaching units. See §4. |
| `diagrams` | Diagram[] | yes | May be empty array |
| `questions` | Question[] | yes | May be empty array |
| `distinguishPairs` | DistinguishPair[] | yes | May be empty array |
| `glossary` | GlossaryEntry[] | yes | May be empty array |
| `meta` | Meta | yes | See §9 |

---

## 4. Topic object

A topic is **the unit a teacher selects** when she says "I taught this today."
The Lock-In Gauntlet and the live quiz both filter by `topic.id`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | e.g. `"12-04-folds"` |
| `title` | string | yes | e.g. `"Folds"` |
| `slug` | string | yes | kebab-case |
| `order` | number | yes | Display order within the chapter, starting at 1 |
| `estimatedMinutes` | number | yes | |
| `blocks` | Block[] | yes | The actual content. See §5. |

---

## 5. Block object

The atomic unit of content. Everything a student reads is a block.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Unique within the chapter |
| `type` | BlockType | yes | See table below |
| `depth` | `1` \| `2` \| `3` | yes | See §1. Get this right — it drives three views. |
| `title` | string | no | Short heading |
| `body` | string | no | Markdown. Inline formatting only: `**bold**`, `*italic*`, `` `code` ``. No headings, no tables, no images. |
| `items` | string[] | no | For `list` and `steps` types. Markdown inline formatting allowed. |
| `diagramId` | string | no | For `diagramRef` type. Must match a `Diagram.id`. |
| `source` | Source | yes | See §8. Every block must be traceable. |
| `verified` | boolean | yes | See §8. |
| `tags` | string[] | no | Free-form, for search and RAG retrieval |

### BlockType values

| Value | Use for |
|---|---|
| `definition` | A term and its meaning. `title` = the term. |
| `explanation` | Prose explaining a concept. |
| `list` | Bulleted points. Use `items`. |
| `steps` | Ordered procedure. Use `items`. |
| `callout` | Something to emphasise — an exam tip, a warning, a memory hook. |
| `mnemonic` | A memory aid. |
| `example` | A named real-world instance (a place, a formation, a case). |
| `formula` | An equation or numeric relationship. |
| `diagramRef` | Places a diagram inline at this point in the flow. Use `diagramId`. |
| `conflict` | **Notes and textbook disagree.** See below — this type is mandatory when they do. |

### The `conflict` block type

Where the teacher's notes contradict the textbook, this must be recorded explicitly,
never silently resolved. Use `body` to state both positions and which one to write in
the exam.

The teacher's version always wins for exam-writing purposes, because she grades it.
The block must still say what the textbook claims, so the student isn't blindsided if a
question tests the textbook's distinction directly.

Two known conflicts already identified in Structural Geology:
1. Normal fault dip angle — notes say 0°–45°, textbook is inconsistent/higher.
2. Reverse fault vs Thrust fault — notes treat as synonymous, textbook splits them by dip angle.

---

## 6. Diagram object

Geology is graded on labelled diagrams. `requiredLabels` is the highest-value field in
this entire schema — it is the difference between full marks and partial marks.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Referenced by `Block.diagramId` |
| `title` | string | yes | |
| `format` | `"svg"` \| `"image"` | yes | |
| `svg` | string | conditional | Required when `format === "svg"`. Full inline `<svg>` markup. Must use `viewBox`, no fixed pixel width/height, no external fonts. |
| `src` | string | conditional | Required when `format === "image"`. Path under `/assets/`. |
| `alt` | string | yes | Accessibility description |
| `caption` | string | no | |
| `requiredLabels` | string[] | yes | The labels a student **must** write to score full marks. May be empty array only if genuinely none. |
| `topicId` | string | yes | |
| `source` | Source | yes | |
| `verified` | boolean | yes | |

Known required labels already confirmed by the teacher:
- Any **fold** diagram: `axial plane`, `left limb`, `right limb`
- Any **fault** diagram: `foot wall`, `hanging wall`, `arrow`, `fault plane`

---

## 7. Question, DistinguishPair, GlossaryEntry

### Question

One pool serves practice mode, the Lock-In Gauntlet, and the live quiz. Do not create
separate question sets per feature.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | |
| `topicId` | string | yes | Must match a `Topic.id` |
| `type` | QuestionType | yes | `mcq` \| `oddOneOut` \| `matchPairs` \| `shortAnswer` \| `diagramLabel` \| `distinguish` |
| `marks` | number | yes | 1, 2, 3, or 4 |
| `difficulty` | `"easy"` \| `"medium"` \| `"hard"` | yes | |
| `prompt` | string | yes | The question text |
| `options` | Option[] | conditional | Required for `mcq` and `oddOneOut`. Each: `{ id: string, text: string }`. Minimum 4 for `mcq`. |
| `pairs` | Pair[] | conditional | Required for `matchPairs`. Each: `{ left: string, right: string }`. |
| `correct` | string \| string[] | conditional | Option `id`(s). Required for `mcq`, `oddOneOut`. |
| `answer` | string | conditional | Model answer for `shortAnswer` / `distinguish` / `diagramLabel`. |
| `explanation` | string | yes | Why the answer is right. Shown after answering. Never leave blank. |
| `diagramId` | string | no | For `diagramLabel` questions |
| `phoneFriendly` | boolean | yes | `true` if answerable one-handed on a phone with no writing. Drives the commute/travel mode. |
| `teacherFlagged` | boolean | yes | `true` if the teacher indicated it is likely to appear in the exam |
| `source` | Source | yes | |
| `verified` | boolean | yes | |

### DistinguishPair

| Field | Type | Required |
|---|---|---|
| `id` | string | yes |
| `topicId` | string | yes |
| `itemA` | string | yes |
| `itemB` | string | yes |
| `rows` | `{ aspect: string, a: string, b: string }[]` | yes |
| `marks` | number | yes |
| `source` | Source | yes |
| `verified` | boolean | yes |

### GlossaryEntry

| Field | Type | Required |
|---|---|---|
| `term` | string | yes |
| `definition` | string | yes |
| `topicId` | string | no |
| `source` | Source | yes |

---

## 8. Source and verification

This site will be used by students preparing for a board exam. A hallucinated
definition costs someone marks. Every single content object carries provenance.

### Source object

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `"textbook"` \| `"notes"` \| `"questionBank"` \| `"external"` | yes | |
| `ref` | string | yes | e.g. `"p.47"`, `"notes p.12"`, `"QB Ch4 Q3"` |
| `note` | string | no | Required when `type === "external"` — state where it came from and why it was added |

### The `verified` flag

- `verified: true` — the statement is directly supported by the cited source.
- `verified: false` — the agent inferred, expanded, rephrased beyond the source, or is
  uncertain.

Anything with `verified: false` renders on the site with a visible "unverified" marker.
Content agents must **not** mark something `true` to make the output look cleaner. A
`false` flag is a feature, not a failure — it tells us exactly what a human needs to check.

**External content is allowed but must be flagged.** If the textbook and notes are both
silent on something genuinely useful, it can be added with `type: "external"`,
`verified: false`, and an explanatory `note`.

---

## 9. Meta object

| Field | Type | Required | Notes |
|---|---|---|---|
| `schemaVersion` | string | yes | `"1.0"` |
| `lastUpdated` | string | yes | ISO 8601 date |
| `authoredBy` | string | yes | e.g. `"antigravity"` |
| `reviewStatus` | `"draft"` \| `"human-reviewed"` | yes | Starts as `"draft"` |
| `sourceDocuments` | string[] | yes | Which files were used |
| `openQuestions` | string[] | yes | Anything the agent could not resolve. Empty array if none. Do not leave problems silent. |

---

## 10. Illustrative example

An abbreviated Structural Geology file, showing shape only — not complete content.

```json
{
  "id": "12-04",
  "std": 12,
  "chapterNumber": 4,
  "title": "Structural Geology",
  "slug": "structural-geology",
  "textbookPages": "44-55",
  "marksWeightage": 17,
  "estimatedMinutes": 55,
  "summary": "Folds, faults, joints and unconformities — how rocks deform and how to read them in the field.",
  "topics": [
    {
      "id": "12-04-folds",
      "title": "Folds",
      "slug": "folds",
      "order": 3,
      "estimatedMinutes": 18,
      "blocks": [
        {
          "id": "12-04-b021",
          "type": "definition",
          "depth": 1,
          "title": "Anticline",
          "body": "A fold that is **convex upward**, with limbs dipping away from each other. The **oldest** beds lie at the core.",
          "source": { "type": "notes", "ref": "notes p.6" },
          "verified": true,
          "tags": ["fold", "anticline"]
        },
        {
          "id": "12-04-b027",
          "type": "conflict",
          "depth": 1,
          "title": "Normal fault dip angle",
          "body": "**Write the notes' version:** normal faults dip at **0°-45°**. The textbook gives a different and internally inconsistent range. The teacher grades against her notes.",
          "source": { "type": "notes", "ref": "notes p.14" },
          "verified": true,
          "tags": ["fault", "conflict"]
        },
        {
          "id": "12-04-b031",
          "type": "diagramRef",
          "depth": 1,
          "diagramId": "12-04-d004",
          "source": { "type": "notes", "ref": "notes p.7" },
          "verified": true
        }
      ]
    }
  ],
  "diagrams": [
    {
      "id": "12-04-d004",
      "title": "Symmetrical anticline",
      "format": "svg",
      "svg": "<svg viewBox=\"0 0 320 140\">...</svg>",
      "alt": "A symmetrical anticline with a vertical axial plane and two limbs dipping away at equal angles.",
      "caption": "Note the vertical axial plane and equal limb dips.",
      "requiredLabels": ["axial plane", "left limb", "right limb"],
      "topicId": "12-04-folds",
      "source": { "type": "notes", "ref": "notes p.7" },
      "verified": true
    }
  ],
  "questions": [
    {
      "id": "12-04-q012",
      "topicId": "12-04-folds",
      "type": "mcq",
      "marks": 1,
      "difficulty": "easy",
      "prompt": "In an anticline, the oldest beds are found at the:",
      "options": [
        { "id": "a", "text": "Core" },
        { "id": "b", "text": "Limbs" },
        { "id": "c", "text": "Axial plane" },
        { "id": "d", "text": "Crest only" }
      ],
      "correct": "a",
      "explanation": "An anticline arches upward, so erosion of the crest exposes the oldest beds at the centre.",
      "phoneFriendly": true,
      "teacherFlagged": false,
      "source": { "type": "textbook", "ref": "p.48" },
      "verified": true
    }
  ],
  "distinguishPairs": [
    {
      "id": "12-04-dp002",
      "topicId": "12-04-folds",
      "itemA": "Symmetrical fold",
      "itemB": "Asymmetrical fold",
      "rows": [
        { "aspect": "Axial plane", "a": "Vertical", "b": "Inclined" },
        { "aspect": "Limb dip", "a": "Equal angles", "b": "Unequal angles" }
      ],
      "marks": 3,
      "source": { "type": "notes", "ref": "notes p.8" },
      "verified": true
    }
  ],
  "glossary": [
    {
      "term": "Axial plane",
      "definition": "The imaginary plane that divides a fold as symmetrically as possible.",
      "topicId": "12-04-folds",
      "source": { "type": "notes", "ref": "notes p.6" }
    }
  ],
  "meta": {
    "schemaVersion": "1.0",
    "lastUpdated": "2026-08-26",
    "authoredBy": "antigravity",
    "reviewStatus": "draft",
    "sourceDocuments": ["GEO_12th.pdf pp.44-55", "handwritten notes pp.1-19"],
    "openQuestions": []
  }
}
```

---

## 11. Hard rules

1. Valid JSON. No trailing commas. No comments. UTF-8.
2. Every `id` unique within its chapter file.
3. Every `topicId` resolves to a real `Topic.id`. Every `diagramId` resolves to a real `Diagram.id`.
4. Every block, diagram, question, distinguish pair and glossary entry has a `source`.
5. No `verified: true` without direct support from the cited source.
6. `body` is inline markdown only — no headings, tables, images, or HTML.
7. SVG diagrams use `viewBox`, scale to container width, use no external fonts, and no fixed pixel dimensions.
8. Where notes and textbook disagree, a `conflict` block is mandatory.
9. Anything unresolved goes in `meta.openQuestions`. Never silently guess.