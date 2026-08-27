export default function Loading() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-basalt">
      <div className="w-7 h-7 border-2 border-core border-t-transparent rounded-full animate-spin" />
      <p
        className="text-[10px] uppercase tracking-[0.3em] text-chalk-muted"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Drilling down
      </p>
    </main>
  );
}
