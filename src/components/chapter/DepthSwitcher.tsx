'use client';

import { useState } from 'react';
import type { DepthView } from '@/lib/types';
import { DEPTH_VIEWS, getDepthViewLabel, getDepthViewDescription } from '@/lib/depth-filter';

interface DepthSwitcherProps {
  value: DepthView;
  onChange: (view: DepthView) => void;
}

const DEPTH_ICONS: Record<DepthView, React.ReactNode> = {
  'last-minute': (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="3" rx="1" fill="currentColor" opacity="1" />
      <rect x="2" y="7" width="12" height="3" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="2" y="12" width="12" height="3" rx="1" fill="currentColor" opacity="0.1" />
    </svg>
  ),
  'revision': (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="3" rx="1" fill="currentColor" opacity="1" />
      <rect x="2" y="7" width="12" height="3" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="2" y="12" width="12" height="3" rx="1" fill="currentColor" opacity="0.15" />
    </svg>
  ),
  'full': (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="3" rx="1" fill="currentColor" opacity="1" />
      <rect x="2" y="7" width="12" height="3" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="2" y="12" width="12" height="3" rx="1" fill="currentColor" opacity="0.6" />
    </svg>
  ),
};

export function DepthSwitcher({ value, onChange }: DepthSwitcherProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex rounded-lg bg-basalt-light border border-basalt-lighter p-0.5 gap-0.5"
        role="tablist"
        aria-label="Content depth"
      >
        {DEPTH_VIEWS.map((view) => {
          const isActive = value === view;
          return (
            <button
              key={view}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(view)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium
                transition-all duration-150 whitespace-nowrap
                ${
                  isActive
                    ? 'bg-fieldnote text-core shadow-sm border border-core/20'
                    : 'text-chalk-muted hover:text-chalk hover:bg-basalt-lighter/50'
                }
              `}
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {DEPTH_ICONS[view]}
              <span>{getDepthViewLabel(view)}</span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-[0.625rem] text-chalk-muted mt-1.5 px-1" style={{ fontFamily: 'var(--font-mono)' }}>
        {getDepthViewDescription(value)}
      </p>
    </div>
  );
}
