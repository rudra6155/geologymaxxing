'use client';

import { useState } from 'react';
import { AskAiModal } from './AskAiModal';

interface AskAiButtonProps {
  chapterSlug: string;
}

export function AskAiButton({ chapterSlug }: AskAiButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-core text-basalt rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-center gap-2 pl-4 pr-5 py-3 hover:scale-105 active:scale-95 transition-transform border border-core-bright/20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="font-bold text-sm tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Ask AI</span>
      </button>

      {isOpen && (
        <AskAiModal 
          chapterSlug={chapterSlug} 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
