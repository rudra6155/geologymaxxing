'use client';

import { useEffect, useState } from 'react';

export function CoreSampleRail() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(100);
        return;
      }
      setProgress(Math.min(100, (scrollTop / docHeight) * 100));
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="core-rail" aria-hidden="true">
      <div
        className="core-rail-fill"
        style={{ height: `${progress}%` }}
      />
    </div>
  );
}
