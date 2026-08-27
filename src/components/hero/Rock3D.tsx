'use client';

/**
 * Rock3D — Lazy-loaded 3D boulder scene for the hero animation.
 *
 * Two independent motion signals drive the climax window:
 *  - a deliberate ease-out Y-axis rotation that sweeps to a held "hero angle"
 *  - a jitter envelope (near-imperceptible -> ramping shake -> settle) layered
 *    on top via useFrame, using the R3F clock so it never touches React state
 *
 * The 3D path never shatters — a "solid" object exploding reads as a
 * rendering glitch. The SVG fallback owns the shatter finale instead.
 *
 * The Canvas mounts as soon as WebGL is confirmed available and stays
 * mounted (invisible, via the `revealed` prop) through the whole sequence
 * instead of being created fresh at climax time. A brand-new WebGLRenderer
 * pays real, uncacheable-across-contexts costs — PBR shader compilation and
 * <Environment>'s PMREM generation — that a raw asset preload can't warm.
 * Mounting early lets those costs land during the typewriter/pause window
 * instead of stealing time from the 3000ms climax window.
 */

import { useRef, useMemo, useEffect, useState, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import type { Group } from 'three';

const DEG = Math.PI / 180;

// Hero-angle rotation sweep (spec: 20-30°, settling ~2600-2800ms into the
// 3000ms climax window). Tune ROCK_START_DEG/ROCK_SWEEP_DEG by eye against
// the actual rendered model to land on the most interesting facet.
const ROCK_START_DEG = -13;
const ROCK_SWEEP_DEG = 26;
const ROCK_END_DEG = ROCK_START_DEG + ROCK_SWEEP_DEG;
const ROCK_SETTLE_T = 0.9; // fraction of the 3s window where rotation locks in (~2700ms)

interface BoulderProps {
  /** true for the whole 3000ms climax window */
  active: boolean;
  /** If true, render at final hero angle, fully at rest */
  reducedMotion: boolean;
}

function Boulder({ active, reducedMotion }: BoulderProps) {
  const groupRef = useRef<Group>(null);
  const startTimeRef = useRef<number | null>(null);

  const { scene } = useGLTF('/models/namaqualand-boulder.glb');
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Re-latch the clock start each time a fresh climax window begins.
  useEffect(() => {
    if (active) startTimeRef.current = null;
  }, [active]);

  useFrame((state) => {
    if (!groupRef.current || reducedMotion || !active) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }
    const t = Math.min((state.clock.elapsedTime - startTimeRef.current) / 3, 1);

    // ── Deliberate rotation: ease-out sweep, locked by ROCK_SETTLE_T ──
    const rotT = Math.min(t / ROCK_SETTLE_T, 1);
    const eased = 1 - Math.pow(1 - rotT, 3);
    const rotationY = (ROCK_START_DEG + eased * ROCK_SWEEP_DEG) * DEG;

    // ── Vibration combo curve ──
    // 0 -> ~0.38 (≈1140ms): near-imperceptible jitter
    // ~0.38 -> ROCK_SETTLE_T: ramps to peak, cresting as rotation settles
    // ROCK_SETTLE_T -> 1: decays to zero — rock holds still before the cut
    const microEnd = 0.38;
    let amp: number;
    if (t < microEnd) {
      amp = (t / microEnd) * 0.06;
    } else if (t < ROCK_SETTLE_T) {
      amp = 0.06 + Math.pow((t - microEnd) / (ROCK_SETTLE_T - microEnd), 1.4) * 0.94;
    } else {
      amp = 1 - (t - ROCK_SETTLE_T) / (1 - ROCK_SETTLE_T);
    }

    const time = state.clock.elapsedTime;
    const jitterX = amp * 0.045 * (Math.sin(time * 47) * 0.7 + Math.sin(time * 71) * 0.3);
    const jitterY = amp * 0.035 * (Math.sin(time * 53 + 1.1) * 0.6 + Math.sin(time * 61 + 2.4) * 0.4);
    const jitterRotX = amp * 0.05 * Math.sin(time * 59 + 0.7);
    const jitterRotZ = amp * 0.045 * Math.sin(time * 43 + 1.9);

    groupRef.current.rotation.y = rotationY;
    groupRef.current.rotation.x = jitterRotX;
    groupRef.current.rotation.z = jitterRotZ;
    groupRef.current.position.x = jitterX;
    groupRef.current.position.y = jitterY;
  });

  const initialRotation: [number, number, number] = reducedMotion
    ? [0, ROCK_END_DEG * DEG, 0]
    : [0, ROCK_START_DEG * DEG, 0];

  return (
    <group ref={groupRef} rotation={initialRotation}>
      <primitive object={clonedScene} scale={2.5} position={[0, -0.5, 0]} />
    </group>
  );
}

// Fires onReady once mounted — placed inside the same inner Suspense
// boundary as <Environment> and <Boulder>, so React only commits (and
// therefore only runs this effect) once everything in that boundary,
// GLB + HDR alike, has actually finished loading.
function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

interface SceneBoundaryProps {
  onError: () => void;
  children: ReactNode;
}

class SceneErrorBoundary extends Component<SceneBoundaryProps, { errored: boolean }> {
  state = { errored: false };
  static getDerivedStateFromError() {
    return { errored: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.errored ? null : this.props.children;
  }
}

// ─── Main Scene Component ───────────────────────────────────────────

interface Rock3DSceneProps {
  /** true for the whole 3000ms climax window */
  active: boolean;
  /** true once the rock should actually be visible (pop-in through cut, or the reduced-motion resting pose) */
  revealed: boolean;
  reducedMotion: boolean;
  /** Fires once the GLB (fetched + Draco-decoded) and env HDR have both fully loaded */
  onReady: () => void;
  /** Fires if either load fails for any reason (network, decode, CORS, ...) */
  onError: () => void;
}

export function Rock3DScene({ active, revealed, reducedMotion, onReady, onError }: Rock3DSceneProps) {
  // Fully at rest (reduced motion) never needs a continuous render loop;
  // otherwise render continuously so the climax jitter/rotation is smooth
  // and so shader compilation + PMREM generation happen during warm-up
  // instead of stalling the first visible frame of the climax window.
  const [warmedUp, setWarmedUp] = useState(false);

  return (
    <div
      style={{
        width: 'clamp(180px, 55vw, 280px)',
        aspectRatio: '1',
        position: 'absolute',
        zIndex: 10,
        opacity: revealed ? 1 : 0,
        pointerEvents: revealed ? 'auto' : 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        style={{ background: 'transparent' }}
        frameloop={reducedMotion && warmedUp ? 'demand' : 'always'}
      >
        <SceneErrorBoundary onError={onError}>
          <Suspense fallback={null}>
            {/* Base ambient/IBL: warm built-in preset, no custom HDRI download */}
            <Environment preset="sunset" />

            {/* Key light: warm amber (oxide/core token range), raking angle for surface texture */}
            <directionalLight color="#C98A3E" intensity={2.5} position={[3, 4, 2]} castShadow={false} />

            {/* Rim/back light: cool neutral, separates silhouette from the dark basalt background */}
            <directionalLight color="#8899AA" intensity={1.2} position={[-3, 2, -3]} castShadow={false} />

            {/* Fill from below to soften harsh shadows */}
            <ambientLight intensity={0.3} />

            <Boulder active={active} reducedMotion={reducedMotion} />
            <ReadySignal
              onReady={() => {
                setWarmedUp(true);
                onReady();
              }}
            />
          </Suspense>
        </SceneErrorBoundary>
      </Canvas>
    </div>
  );
}
