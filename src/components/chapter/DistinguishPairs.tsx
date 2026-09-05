import type { DistinguishPair } from '@/lib/types';

interface DistinguishPairsViewProps {
  pairs: DistinguishPair[];
}

export function DistinguishPairsView({ pairs }: DistinguishPairsViewProps) {
  if (!pairs || pairs.length === 0) return null;

  return (
    <section className="mt-8">
      <h3
        className="text-lg font-semibold text-chalk mb-4 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <svg className="w-5 h-5 text-core" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Distinguish Between
      </h3>

      <div className="space-y-4">
        {pairs.map((pair) => (
          <div
            key={pair.id}
            className="rounded-lg bg-fieldnote border border-fieldnote-lighter/50 overflow-hidden"
            id={pair.id}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-basalt-light/50 border-b border-fieldnote-lighter/30">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-chalk" style={{ fontFamily: 'var(--font-display)' }}>
                  {pair.itemA} <span className="text-chalk-muted font-normal mx-1">vs</span> {pair.itemB}
                </span>
              </div>
              <span
                className="text-[0.625rem] text-core font-bold"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {pair.marks}M
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-fieldnote-lighter/30">
                    <th
                      className="text-left px-3 py-2 text-[0.625rem] uppercase tracking-widest text-chalk-muted font-semibold w-1/4"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Aspect
                    </th>
                    <th
                      className="text-left px-3 py-2 text-[0.625rem] uppercase tracking-widest text-core font-semibold"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {pair.itemA}
                    </th>
                    <th
                      className="text-left px-3 py-2 text-[0.625rem] uppercase tracking-widest text-moss font-semibold"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {pair.itemB}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pair.rows.map((row, i) => (
                    <tr
                      key={i}
                      className={i < pair.rows.length - 1 ? 'border-b border-fieldnote-lighter/20' : ''}
                    >
                      <td className="px-3 py-2 text-chalk-dim font-medium text-xs">{row.aspect}</td>
                      <td className="px-3 py-2 text-chalk/90 text-xs leading-relaxed">{row.a}</td>
                      <td className="px-3 py-2 text-chalk/90 text-xs leading-relaxed">{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Source */}
            <div
              className="px-3 py-1.5 text-[0.5625rem] text-chalk-muted bg-basalt-light/30 border-t border-fieldnote-lighter/20"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span className="uppercase tracking-wide">{pair.source.type}</span>
              <span className="mx-1 opacity-40">·</span>
              <span>{pair.source.ref}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
