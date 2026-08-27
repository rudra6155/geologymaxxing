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
      {/* Floating mineral crystal button */}
      <button
        onClick={() => setIsOpen(true)}
        className="crystal-btn fixed bottom-6 right-5 z-40 group"
        aria-label="Open Vandana AI"
      >
        {/* Crystal shape — diamond/hexagonal with amber gradient */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-core via-core-bright to-core rotate-45 opacity-90" />
          
          {/* Inner crystal face */}
          <div className="absolute inset-[2px] rounded-[14px] bg-gradient-to-br from-[#D4A04A] via-core to-[#8B6425] rotate-45" />
          
          {/* Crystal highlight facet */}
          <div className="absolute top-[3px] left-[3px] w-[55%] h-[55%] rounded-tl-[12px] rounded-br-[4px] bg-gradient-to-br from-white/20 to-transparent rotate-45" />
          
          {/* Icon (not rotated) */}
          <div className="relative z-10 text-basalt">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              {/* Crystal/mineral icon */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 12l10 10 10-10L12 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20" />
            </svg>
          </div>
        </div>
        
        {/* Label — always visible on mobile */}
        <span 
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-core whitespace-nowrap tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Vandana AI
        </span>
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
