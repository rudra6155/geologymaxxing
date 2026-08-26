'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LiveJoinPage() {
  const router = useRouter();
  const supabase = createClient();
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode || !displayName) return;

    setLoading(true);
    setError(null);

    try {
      const code = roomCode.toUpperCase().trim();
      const { data, error: joinError } = await supabase.rpc('join_live_session', {
        p_room_code: code,
        p_display_name: displayName.trim()
      });

      if (joinError) throw joinError;

      // Store participant tokens so they can reconnect/re-enter seamlessly
      sessionStorage.setItem(`live_participant_${code}`, JSON.stringify(data));
      router.push(`/live/${code}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-basalt">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-chalk mb-2" style={{ fontFamily: 'var(--font-display)' }}>Join Quiz</h1>
          <p className="text-chalk-muted text-sm">Enter the code on the board</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-chalk-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="e.g. AB12"
              maxLength={6}
              autoComplete="off"
              className="w-full bg-fieldnote border border-fieldnote-lighter/50 rounded-xl p-4 text-chalk text-2xl font-bold text-center tracking-widest focus:outline-none focus:border-core/50 transition-colors uppercase placeholder:text-chalk-muted/30"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-chalk-muted uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={15}
              autoComplete="off"
              className="w-full bg-fieldnote border border-fieldnote-lighter/50 rounded-xl p-4 text-chalk text-lg font-medium text-center focus:outline-none focus:border-core/50 transition-colors placeholder:text-chalk-muted/30"
            />
          </div>

          {error && (
            <p className="text-oxide text-sm text-center bg-oxide/10 border border-oxide/20 rounded-lg p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !roomCode || !displayName}
            className="w-full py-4 mt-4 bg-core text-basalt font-bold text-lg rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform flex justify-center"
          >
            {loading ? (
               <svg className="animate-spin h-6 w-6 text-basalt" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              'Join'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
