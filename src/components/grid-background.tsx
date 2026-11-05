"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";

// A wireframe plane in perspective, receding into fog, sliding toward the
// viewer and undulating. It is the only thing on the page besides the orb
// that moves, and the page reads the same without it: no WebGL, no canvas.
//
// Plain three.js rather than react-three-fiber on purpose. The orb is a fiber
// Canvas, and two fiber roots mounting and unmounting under React's dev
// StrictMode left the orb's WebGL context lost (black orb in `bun dev`, fine
// in production). One renderer owned by one effect has no such interplay.

const SIZE = 400;
const SEGMENTS = 80;
const CELL = SIZE / SEGMENTS; // the slide wraps every cell, where the lines repeat
const SLIDE_SPEED = 4;
const IDLE_OPACITY = 0.12;

type Props = { activityRef: React.RefObject<number> };

// Resolve a CSS color token (oklch) to something three understands by letting
// the browser paint it once. Falls back to a neutral if the token is missing.
function cssColor(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const ctx = document.createElement("canvas").getContext("2d");
  if (!value || !ctx) return fallback;
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

function hasWebGL(): boolean {
  if (typeof WebGLRenderingContext === "undefined") return false;
  try {
    return document.createElement("canvas").getContext("webgl") !== null;
  } catch {
    return false;
  }
}

export function GridBackground({ activityRef }: Props) {
  const reduced = useReducedMotion() ?? false;
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || !hasWebGL()) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(cssColor("--background", "rgb(22, 22, 24)"), 20, 180);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
    camera.position.set(0, 4, 40);

    const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
    const base = geometry.attributes.position.array.slice() as Float32Array;
    const material = new THREE.MeshBasicMaterial({
      color: cssColor("--foreground", "rgb(217, 217, 220)"),
      wireframe: true,
      transparent: true,
      opacity: IDLE_OPACITY,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -8;
    scene.add(mesh);

    // The wave is computed in world space (y minus the slide), so the mesh
    // can wrap every cell without the wave wrapping with it. The first mockup
    // tied it to local coordinates and the loop visibly stuttered.
    const update = (time: number, activity: number) => {
      const pos = geometry.attributes.position.array as Float32Array;
      const slide = (time * SLIDE_SPEED) % CELL;
      mesh.position.z = slide;
      for (let i = 0; i < pos.length; i += 3) {
        const x = base[i];
        const yw = base[i + 1] - slide;
        pos[i + 2] =
          Math.sin(x * 0.08 + time * 0.4) * 1.2 +
          Math.cos(yw * 0.1 + time * 0.3) * 1.2 +
          activity * Math.sin(Math.hypot(x, yw) * 0.3 - time * 5) * 2.5;
      }
      geometry.attributes.position.needsUpdate = true;
      material.opacity = IDLE_OPACITY + activity * IDLE_OPACITY;
    };

    // ResizeObserver rather than the window's resize event: a tab that loads
    // in the background has no layout yet, and gets none of those events when
    // it is finally shown.
    const resize = () => {
      if (el.clientWidth === 0 || el.clientHeight === 0) return;
      renderer.setSize(el.clientWidth, el.clientHeight, false);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      if (reduced) renderer.render(scene, camera);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);

    // Reduced motion: one static frame at phase zero, no parallax.
    if (reduced) {
      update(0, 0);
      renderer.render(scene, camera);
      return () => {
        observer.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        el.removeChild(renderer.domElement);
      };
    }

    const pointer = { x: 0, y: 0 };
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const reset = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("mouseleave", reset);
    window.addEventListener("blur", reset);

    let t = 0;
    let amp = 0;
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      // Accumulate clamped deltas rather than reading a clock, so a tab that
      // was in the background resumes where it left off instead of jumping.
      t += Math.min((now - last) / 1000, 0.05);
      last = now;
      amp += (activityRef.current - amp) * 0.05;
      update(t, amp);
      camera.rotation.y += (-pointer.x * 0.06 - camera.rotation.y) * 0.04;
      camera.rotation.x += (-pointer.y * 0.04 - camera.rotation.x) * 0.04;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", reset);
      window.removeEventListener("blur", reset);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [reduced, activityRef]);

  return <div ref={host} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
