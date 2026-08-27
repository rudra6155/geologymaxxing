'use client';

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import Link from 'next/link';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'motion/react';

// ─── Lazy-load the 3D scene (NOT in initial bundle) ─────────────────
const Rock3DScene = lazy(() =>
  import('./Rock3D').then(mod => ({ default: mod.Rock3DScene }))
);

// ─── Shard Data (SVG fallback path) ─────────────────────────────────
// 12 SVG polygon shards that tile together to form a rock silhouette.
// viewBox is 200×200. Each shard has exit trajectory for the shatter.

interface Shard {
  id: number;
  points: string;
  fill: string;
  exitX: number;
  exitY: number;
  exitRotation: number;
  delay: number;
}

const SHARDS: Shard[] = [
  // Top cluster (lighter core tones)
  { id: 0,  points: '100,5 130,15 120,45 85,40',           fill: '#D4A04A', exitX: 20,   exitY: -120, exitRotation: 35,  delay: 0 },
  { id: 1,  points: '130,15 165,30 155,60 120,45',         fill: '#C98A3E', exitX: 100,  exitY: -100, exitRotation: -45, delay: 0.02 },
  { id: 2,  points: '85,40 120,45 110,80 75,70',           fill: '#B87A35', exitX: -60,  exitY: -80,  exitRotation: 25,  delay: 0.04 },
  // Mid-left (oxide rust tones)
  { id: 3,  points: '50,50 85,40 75,70 60,85 40,75',       fill: '#A8452F', exitX: -130, exitY: -30,  exitRotation: -50, delay: 0.01 },
  { id: 4,  points: '40,75 60,85 55,115 30,105',           fill: '#8B3825', exitX: -140, exitY: 40,   exitRotation: 40,  delay: 0.05 },
  // Center mass (darkest)
  { id: 5,  points: '75,70 110,80 115,110 95,125 65,110',  fill: '#9A6B2A', exitX: -20,  exitY: 50,   exitRotation: -30, delay: 0.03 },
  { id: 6,  points: '110,80 155,60 165,95 145,115 115,110',fill: '#C55640', exitX: 80,   exitY: -50,  exitRotation: 55,  delay: 0.02 },
  // Mid-right
  { id: 7,  points: '165,30 185,55 175,90 165,95 155,60',  fill: '#A67230', exitX: 140,  exitY: -60,  exitRotation: -35, delay: 0.04 },
  { id: 8,  points: '165,95 175,90 180,130 160,145 145,115',fill: '#B87A35', exitX: 130,  exitY: 50,   exitRotation: 45,  delay: 0.01 },
  // Bottom cluster
  { id: 9,  points: '65,110 95,125 90,160 55,155 30,130',  fill: '#8B3825', exitX: -100, exitY: 110,  exitRotation: -40, delay: 0.03 },
  { id: 10, points: '95,125 115,110 145,115 140,155 110,170 90,160', fill: '#A8452F', exitX: 30, exitY: 130, exitRotation: 25, delay: 0.05 },
  { id: 11, points: '145,115 160,145 155,170 140,175 110,170 140,155',fill: '#C98A3E', exitX: 110, exitY: 100, exitRotation: -55, delay: 0.02 },
];

const TYPEWRITER_TEXT = 'Hi Vandana AI! what is physical weathering of rocks?';
const CHAR_DELAY_MS = 50;

// ─── Phase Enum ─────────────────────────────────────────────────────
// idle → typing → sent → pause → climax → reveal → done
// The 3D pop-in + 3000ms vibrate/shake window IS the "climax" phase —
// there's no separate rock-in step, so the pop-in lands at the very
// start of the climax clock instead of stealing time before it.

type Phase = 'idle' | 'typing' | 'sent' | 'pause' | 'climax' | 'reveal' | 'done';

// ─── WebGL Feature Detection ────────────────────────────────────────

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!gl;
  } catch {
    return false;
  }
}

// ─── Component ──────────────────────────────────────────────────────

export function HeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('idle');
  const [typedChars, setTypedChars] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  // 3D / SVG path selection.
  // 'probing' mounts the real Rock3DScene early (invisible via `revealed`)
  // so it runs its own useGLTF/useEnvironment hooks well ahead of the
  // climax window — true completion (fetch + Draco decode + HDR parse +
  // shader/PMREM compile on that same WebGL context) can only be observed
  // by actually rendering past its Suspense boundary, not by fetching raw
  // bytes or warming a separate throwaway canvas.
  const [glbState, setGlbState] = useState<'checking' | 'probing' | 'ready' | 'unavailable'>('checking');
  const glbReadyRef = useRef(false); // non-stale read for the pause-end deadline check
  const [renderPath, setRenderPath] = useState<'3d' | 'svg' | 'undecided'>('undecided');

  // ─── WebGL detection, started at mount ─────────────────────────────
  useEffect(() => {
    setGlbState(detectWebGL() ? 'probing' : 'unavailable');
  }, []);

  useEffect(() => {
    if (glbState === 'unavailable') setRenderPath('svg');
  }, [glbState]);

  const handleGlbReady = useCallback(() => {
    glbReadyRef.current = true;
    setGlbState('ready');
  }, []);
  const handleGlbError = useCallback(() => {
    glbReadyRef.current = false;
    setGlbState('unavailable');
  }, []);

  // Reduced motion has no 4800ms deadline — as soon as the probe confirms
  // the 3D asset is actually ready, commit to it for the static final pose.
  useEffect(() => {
    if (glbState === 'ready' && prefersReducedMotion && renderPath === 'undecided') {
      setRenderPath('3d');
    }
  }, [glbState, prefersReducedMotion, renderPath]);

  // ─── Trigger sequence on first view ───────────────────────────────
  useEffect(() => {
    if (!isInView || hasTriggered) return;
    setHasTriggered(true);

    if (prefersReducedMotion) {
      setPhase('done');
      setTypedChars(TYPEWRITER_TEXT.length);
      return;
    }

    setPhase('typing');
  }, [isInView, hasTriggered, prefersReducedMotion]);

  // ─── Beat 1: Typewriter ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'typing') return;

    if (typedChars < TYPEWRITER_TEXT.length) {
      const timer = setTimeout(() => {
        setTypedChars(prev => prev + 1);
      }, CHAR_DELAY_MS);
      return () => clearTimeout(timer);
    }

    // Typing complete — brief settle before "send"
    const sendTimer = setTimeout(() => {
      setPhase('sent');
    }, 200);
    return () => clearTimeout(sendTimer);
  }, [phase, typedChars]);

  // ─── Beat 1b: Sent → Pause (200ms for bubble animation to play) ──
  useEffect(() => {
    if (phase !== 'sent') return;
    const timer = setTimeout(() => setPhase('pause'), 200);
    return () => clearTimeout(timer);
  }, [phase]);

  // ─── PAUSE: 2000ms of true stillness. Nothing animates. ──────────
  // At the end of it we decide the render path and go straight into the
  // climax window — the rock's pop-in plays as the climax clock starts,
  // not as a separate timed step before it.
  useEffect(() => {
    if (phase !== 'pause') return;
    const timer = setTimeout(() => {
      if (renderPath === 'undecided') {
        setRenderPath(glbReadyRef.current ? '3d' : 'svg');
      }
      setPhase('climax');
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase, renderPath]);

  // ─── Climax: 3000ms emotional core ────────────────────────────────
  // Duration only — the actual rotation/jitter math lives inside Rock3D's
  // useFrame (R3F clock, no React state churn) or the rock-shaking CSS
  // class for the SVG path.
  useEffect(() => {
    if (phase !== 'climax') return;
    const timer = setTimeout(() => setPhase('reveal'), 3000);
    return () => clearTimeout(timer);
  }, [phase]);

  // ─── Reveal → Done ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'reveal') return;
    const timer = setTimeout(() => setPhase('done'), 1200);
    return () => clearTimeout(timer);
  }, [phase]);

  // ─── Derived state ────────────────────────────────────────────────
  const showChat = phase === 'typing' || phase === 'sent' || phase === 'pause';
  // 3D never shatters — it cuts to the wordmark the instant climax ends.
  // SVG needs to stay mounted through reveal so the shatter can play out.
  const showRock = phase === 'climax' || (renderPath === 'svg' && phase === 'reveal');
  const showWordmark = phase === 'reveal' || phase === 'done';
  const isClimaxing = phase === 'climax';
  const showWobble = phase === 'climax';

  // SVG-specific: shatter fires at the END of the 3s climax window
  const svgShattering = renderPath === 'svg' && (phase === 'reveal' || phase === 'done');

  // CSS shake for SVG path — ramping amplitude is baked into the keyframes
  const svgShaking = renderPath === 'svg' && isClimaxing;

  // Mount the 3D canvas as soon as it's worth attempting (WebGL confirmed,
  // haven't already fallen back to SVG) and unmount it once the animated
  // (non-reduced-motion) sequence is fully done — it will never be shown
  // again, so there's no reason to keep an idle WebGL context alive.
  const sequenceFinishedWithout3D = !prefersReducedMotion && phase === 'done';
  const mount3D =
    (glbState === 'probing' || glbState === 'ready') && renderPath !== 'svg' && !sequenceFinishedWithout3D;
  // Visible either during the animated climax cut, or as the reduced-motion resting pose.
  const reveal3D = renderPath === '3d' && (showRock || (!!prefersReducedMotion && phase === 'done'));

  return (
    <section
      ref={containerRef}
      className={`relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-basalt px-5 ${
        showWobble ? 'hero-wobbling' : ''
      }`}
    >
      {/* Subtle background glow during sequence */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,138,62,0.08) 0%, transparent 70%)' }}
          animate={{
            opacity: showRock || showWordmark ? 1 : 0.3,
            scale: showWordmark ? 1.5 : 1,
          }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* ─── Beat 1: Chat Mockup ─────────────────────────────────── */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            key="chat"
            className="hero-chat-glass relative z-10 w-full max-w-[340px] rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35 }}
          >
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-chalk/5 flex items-center gap-2.5">
              {/* Crystal avatar */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-core to-core-dim flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/15 to-transparent" />
                <svg className="w-4 h-4 text-basalt relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 12l10 10 10-10L12 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-chalk" style={{ fontFamily: 'var(--font-display)' }}>Vandana AI</p>
                <p className="text-[8px] text-chalk-muted uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>Geology Tutor</p>
              </div>
            </div>

            {/* Chat body */}
            <div className="px-4 py-6 min-h-[80px]">
              {/* Sent message bubble — appears after typing, stays during pause */}
              <AnimatePresence>
                {(phase === 'sent' || phase === 'pause') && (
                  <motion.div
                    className="flex justify-end"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="bg-gradient-to-br from-core to-core-dim text-basalt text-[13px] font-medium px-3.5 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] leading-relaxed"
                    >
                      {TYPEWRITER_TEXT}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input area */}
            <div className="px-3 pb-3">
              <div className="relative flex items-center bg-basalt/60 border border-chalk/6 rounded-full">
                <div className="flex-1 px-4 py-3 text-[13px] text-chalk min-h-[44px] flex items-center">
                  {phase === 'typing' && (
                    <>
                      <span>{TYPEWRITER_TEXT.slice(0, typedChars)}</span>
                      <span className="typewriter-cursor inline-block w-[2px] h-[14px] bg-core ml-[1px] -mb-[1px]" />
                    </>
                  )}
                  {phase !== 'typing' && typedChars === 0 && (
                    <span className="text-chalk-muted/40">Ask a question...</span>
                  )}
                </div>
                {/* Send button */}
                <motion.button
                  className="mr-1.5 p-2 rounded-full bg-core/80 text-basalt flex-shrink-0"
                  animate={phase === 'sent' ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Rock: 3D Path ───────────────────────────────────────────
          Mounted early (invisible) so the WebGL context, shader compile,
          and PMREM env-map generation all warm up well before the climax
          window — see mount3D/reveal3D above. Visibility is animated via
          `animate`, not mount/unmount, so the canvas is never recreated. */}
      {mount3D && (
        <motion.div
          className="absolute z-10 flex items-center justify-center"
          initial={false}
          animate={reveal3D ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : reveal3D
                ? { type: 'spring', stiffness: 300, damping: 18, mass: 0.8 }
                : { duration: 0.15 } // cut, not a springy fade-out
          }
          style={{ pointerEvents: reveal3D ? 'auto' : 'none' }}
        >
          <Suspense fallback={null}>
            <Rock3DScene
              active={phase === 'climax'}
              revealed={reveal3D}
              reducedMotion={!!prefersReducedMotion}
              onReady={handleGlbReady}
              onError={handleGlbError}
            />
          </Suspense>
        </motion.div>
      )}

      {/* ─── Rock: SVG Fallback Path ─────────────────────────────── */}
      <AnimatePresence>
        {showRock && renderPath === 'svg' && (
          <motion.div
            key="rocksvg"
            className={`absolute z-10 ${svgShaking ? 'rock-shaking' : ''}`}
            style={{ width: 'clamp(160px, 50vw, 240px)', aspectRatio: '1' }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 18,
              mass: 0.8,
            }}
          >
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
            >
              {SHARDS.map((shard) => (
                <motion.polygon
                  key={shard.id}
                  points={shard.points}
                  fill={shard.fill}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth={0.5}
                  initial={false}
                  animate={
                    svgShattering
                      ? {
                          x: shard.exitX,
                          y: shard.exitY,
                          rotate: shard.exitRotation,
                          opacity: 0,
                        }
                      : {
                          x: 0,
                          y: 0,
                          rotate: 0,
                          opacity: 1,
                        }
                  }
                  transition={
                    svgShattering
                      ? {
                          duration: 0.55,
                          delay: shard.delay,
                          ease: 'easeOut',
                        }
                      : { duration: 0 }
                  }
                  style={{ transformOrigin: 'center center' }}
                />
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Rock: Reduced Motion (static final state, SVG) ────────── */}
      {phase === 'done' && prefersReducedMotion && renderPath === 'svg' && (
        <div
          className="absolute z-10"
          style={{ width: 'clamp(160px, 50vw, 240px)', aspectRatio: '1' }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
          >
            {SHARDS.map((shard) => (
              <polygon
                key={shard.id}
                points={shard.points}
                fill={shard.fill}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth={0.5}
              />
            ))}
          </svg>
        </div>
      )}

      {/* ─── Wordmark Reveal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showWordmark && (
          <motion.div
            key="wordmark"
            className="relative z-20 text-center"
            initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <h1 style={{ fontFamily: 'var(--font-display)' }}>
              <span className="block text-[2.75rem] leading-[1.05] font-bold bg-clip-text text-transparent bg-gradient-to-br from-core via-core-bright to-chalk">
                geology
              </span>
              <span className="block text-xl text-chalk-muted font-light tracking-tight -mt-1">
                .filtree.in
              </span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll cue — only visible after reveal is done */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-chalk-muted/40"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <span className="text-[9px] uppercase tracking-[0.2em] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
              Scroll
            </span>
            <motion.svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Beat 6: Headline Section (scroll-triggered, unchanged) ─────────

export function HeroHeadline() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section ref={ref} className="px-5 py-20 flex flex-col items-center text-center">
      <motion.h2
        className="text-chalk max-w-[600px]"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 12vw, 6rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 0.95,
        }}
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        Dig deeper.
        <br />
        Score higher.
      </motion.h2>

      <motion.p
        className="mt-6 text-chalk-dim text-lg leading-relaxed max-w-[480px]"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        Std 12 Geology, broken into depth-adjustable chapters with an AI tutor,
        streak drills, and live quizzes — everything you need before the board
        exam. Works offline, so revision never waits on a signal.
      </motion.p>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-9"
      >
        <Link
          href="/12"
          className="group inline-flex items-center gap-2 text-core-bright font-semibold text-sm"
        >
          <span className="relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-core-bright after:scale-x-0 after:origin-left group-hover:after:scale-x-100 after:transition-transform after:duration-300">
            Start Std 12 Geology
          </span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
