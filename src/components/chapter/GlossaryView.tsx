'use client';

import { useState } from 'react';
import type { GlossaryEntry } from '@/lib/types';

interface GlossaryViewProps {
  entries: GlossaryEntry[];
}

export function GlossaryView({ entries }: GlossaryViewProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  if (entries.length === 0) return null;

  const filtered = search
    ? entries.filter(
        (e) =>
          e.term.toLowerCase().includes(search.toLowerCase()) ||
          e.definition.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  return (
    <section className="mt-8">
      <h3
        className="text-lg font-semibold text-chalk mb-4 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <svg className="w-5 h-5 text-core" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Glossary
        <span
          className="text-xs text-chalk-muted font-normal ml-1"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          ({entries.length} terms)
        </span>
      </h3>

      {/* Search */}
      <div className="mb-3">
        <input
          type="search"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-basalt-light border border-basalt-lighter rounded-lg px-3 py-2 
                     text-sm text-chalk placeholder:text-chalk-muted/50
                     focus:outline-none focus:border-core/40 focus:ring-1 focus:ring-core/20
                     transition-colors"
        />
      </div>

      {/* Terms list */}
      <div className="space-y-1">
        {filtered.map((entry) => {
          const isExpanded = expanded === entry.term;
          return (
            <button
              key={entry.term}
              onClick={() => setExpanded(isExpanded ? null : entry.term)}
              className="w-full text-left rounded-lg px-3 py-2.5 transition-colors
                         bg-fieldnote/50 hover:bg-fieldnote border border-transparent
                         hover:border-fieldnote-lighter/30 focus-visible:outline-2 focus-visible:outline-core"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-core">{entry.term}</span>
                <svg
                  className={`w-4 h-4 text-chalk-muted transition-transform duration-150 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {isExpanded && (
                <div className="mt-2 text-sm text-chalk/85 leading-relaxed">
                  {entry.definition}
                  <div
                    className="mt-1.5 text-[0.5625rem] text-chalk-muted"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    <span className="uppercase tracking-wide">{entry.source.type}</span>
                    <span className="mx-1 opacity-40">·</span>
                    <span>{entry.source.ref}</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-chalk-muted text-center py-4">
            No terms matching &ldquo;{search}&rdquo;
          </p>
        )}
      </div>
    </section>
  );
}
