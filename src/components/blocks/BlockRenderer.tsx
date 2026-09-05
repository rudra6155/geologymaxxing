import type { Block, Diagram } from '@/lib/types';

interface BlockRendererProps {
  block: Block;
  diagrams?: Diagram[];
}

/** Render inline markdown (bold, italic, code) — no full parser needed */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Split on **bold**, *italic*, and `code` patterns
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Code: `text`
    const codeMatch = remaining.match(/`(.+?)`/);
    // Italic: *text* (not preceded by *)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    // Find the earliest match
    const matches = [
      boldMatch ? { type: 'bold', match: boldMatch } : null,
      codeMatch ? { type: 'code', match: codeMatch } : null,
      italicMatch ? { type: 'italic', match: italicMatch } : null,
    ]
      .filter(Boolean)
      .sort((a, b) => (a!.match.index ?? 0) - (b!.match.index ?? 0));

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    const idx = first.match.index ?? 0;

    if (idx > 0) {
      parts.push(remaining.slice(0, idx));
    }

    switch (first.type) {
      case 'bold':
        parts.push(
          <strong key={key++} className="text-core-bright font-bold">
            {first.match[1]}
          </strong>
        );
        remaining = remaining.slice(idx + first.match[0].length);
        break;
      case 'code':
        parts.push(
          <code
            key={key++}
            className="text-[0.875em] bg-basalt-light px-1 py-0.5 rounded"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {first.match[1]}
          </code>
        );
        remaining = remaining.slice(idx + first.match[0].length);
        break;
      case 'italic':
        parts.push(
          <em key={key++} className="italic">
            {first.match[1]}
          </em>
        );
        remaining = remaining.slice(idx + first.match[0].length);
        break;
    }
  }

  return <>{parts}</>;
}

function BlockHeader({ block }: { block: Block }) {
  return (
    <div className="flex items-start gap-2 mb-2">
      {block.title && (
        <h4
          className="text-base font-semibold text-chalk leading-tight flex-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {block.title}
        </h4>
      )}
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        <span className="depth-badge" data-depth={block.depth}>
          D{block.depth}
        </span>
        {!block.verified && (
          <span className="badge-unverified">⚠ Unverified</span>
        )}
      </div>
    </div>
  );
}

function BlockSource({ block }: { block: Block }) {
  return (
    <div
      className="mt-2 text-[0.625rem] text-chalk-muted"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span className="uppercase tracking-wide">{block.source.type}</span>
      <span className="mx-1 opacity-40">·</span>
      <span>{block.source.ref}</span>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const labels: Record<string, { text: string; color: string }> = {
    definition: { text: 'DEF', color: 'text-core' },
    explanation: { text: 'EXPLAIN', color: 'text-chalk-dim' },
    list: { text: 'LIST', color: 'text-chalk-dim' },
    steps: { text: 'STEPS', color: 'text-moss' },
    callout: { text: 'NOTE', color: 'text-core' },
    mnemonic: { text: 'MEMORY', color: 'text-moss' },
    example: { text: 'EXAMPLE', color: 'text-moss' },
    formula: { text: 'FORMULA', color: 'text-core' },
    conflict: { text: 'CONFLICT', color: 'text-oxide' },
  };

  const label = labels[type] ?? { text: type.toUpperCase(), color: 'text-chalk-muted' };

  return (
    <span
      className={`text-[0.5625rem] font-bold tracking-widest ${label.color} opacity-70`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {label.text}
    </span>
  );
}

export function BlockRenderer({ block, diagrams }: BlockRendererProps) {
  // Conflict blocks get special treatment
  if (block.type === 'conflict') {
    return (
      <div className="block-conflict rounded-r-lg py-3 pr-3 my-3" id={block.id}>
        <TypeBadge type="conflict" />
        <BlockHeader block={block} />
        {block.body && (
          <div className="text-sm text-chalk leading-relaxed block-content">
            {renderInlineMarkdown(block.body)}
          </div>
        )}
        <BlockSource block={block} />
      </div>
    );
  }

  // DiagramRef blocks
  if (block.type === 'diagramRef' && block.diagramId) {
    const diagram = diagrams?.find((d) => d.id === block.diagramId);
    if (!diagram) return null;

    return (
      <div className="my-4" id={block.id}>
        <div className="rounded-lg bg-basalt-light border border-basalt-lighter p-3 overflow-hidden">
          {/* Diagram title */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[0.5625rem] font-bold tracking-widest text-chalk-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              DIAGRAM
            </span>
            <span className="text-xs text-chalk-dim font-medium">{diagram.title}</span>
          </div>

          {/* SVG or image */}
          {diagram.format === 'svg' && diagram.svg ? (
            <div
              className="diagram-container w-full"
              dangerouslySetInnerHTML={{ __html: diagram.svg }}
              aria-label={diagram.alt}
              role="img"
            />
          ) : diagram.format === 'image' && diagram.src ? (
            <div className="tape-corner rounded overflow-hidden">
              <img
                src={diagram.src}
                alt={diagram.alt}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          ) : null}

          {/* Caption */}
          {diagram.caption && (
            <p className="text-xs text-chalk-dim mt-2 italic">{diagram.caption}</p>
          )}

          {/* Required labels */}
          {diagram.requiredLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span
                className="text-[0.5625rem] text-core-dim font-semibold uppercase tracking-wide mr-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Must label:
              </span>
              {diagram.requiredLabels.map((label) => (
                <span
                  key={label}
                  className="text-[0.625rem] px-1.5 py-0.5 rounded bg-core/10 text-core-bright border border-core/20"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard block types
  return (
    <div
      className="rounded-lg bg-fieldnote border border-fieldnote-lighter/50 p-3 my-2.5"
      id={block.id}
    >
      <TypeBadge type={block.type} />
      <BlockHeader block={block} />

      {/* Body text */}
      {block.body && (
        <div className="text-sm text-chalk/90 leading-relaxed block-content">
          {renderInlineMarkdown(block.body)}
        </div>
      )}

      {/* List items */}
      {block.items && block.type === 'steps' && (
        <ol className="space-y-2 mt-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-chalk/90 leading-relaxed">
              <span
                className="shrink-0 w-5 h-5 rounded-full bg-moss/15 text-moss text-[0.625rem] 
                           font-bold flex items-center justify-center mt-0.5"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {i + 1}
              </span>
              <span className="block-content flex-1">{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>
      )}

      {block.items && block.type !== 'steps' && (
        <ul className="space-y-1.5 mt-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-chalk/90 leading-relaxed">
              <span className="shrink-0 w-1 h-1 rounded-full bg-core/60 mt-2" />
              <span className="block-content flex-1">{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      )}

      <BlockSource block={block} />
    </div>
  );
}
