"use client";

/**
 * WovenCanvas — animated Three.js particle torus-knot, used as an
 * interactive background on the landing hero.
 *
 * Adapted from the original 'woven-light-hero' reference — we only
 * keep the Three.js canvas (no nav, no text, no Playfair fonts), fit
 * it to the parent container instead of the window, and force
 * dark-mode particle styling so it reads on a dark-blue gradient.
 *
 * Mouse interaction: particles repel from the cursor within a 1.5-unit
 * radius, damped spring back to their original torus-knot positions.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function WovenCanvas({
  className = "",
  particleCount = 18000,
}: {
  className?: string;
  particleCount?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Respect reduced-motion users — skip the expensive animation loop.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();

    // ── Particles along a torus-knot surface ──────────────────────────
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const geometry = new THREE.BufferGeometry();
    const torusKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 32);

    for (let i = 0; i < particleCount; i++) {
      const vertexIndex = i % torusKnot.attributes.position.count;
      const x = torusKnot.attributes.position.getX(vertexIndex);
      const y = torusKnot.attributes.position.getY(vertexIndex);
      const z = torusKnot.attributes.position.getZ(vertexIndex);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      const color = new THREE.Color();
      // Soft pastel palette — slight variance, mid-brightness, so the
      // particles feel luminous on the dark-blue gradient without
      // turning into neon confetti.
      color.setHSL(0.55 + Math.random() * 0.3, 0.55, 0.62);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ── Mouse interaction: repel within 1.5 units ─────────────────────
    const handleMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      // Normalize mouse to the canvas container, not the window, so
      // the repel effect is accurate even when the hero isn't full-screen.
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };
    mount.addEventListener("mousemove", handleMouseMove);

    // ── Resize observer (container-sized, not window-sized) ───────────
    const resize = () => {
      const w = mount.clientWidth;
      const h = Math.max(mount.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    // ── Animation loop ───────────────────────────────────────────────
    let animationId = 0;
    const tmpPos = new THREE.Vector3();
    const tmpOrig = new THREE.Vector3();
    const tmpVel = new THREE.Vector3();
    const tmpDir = new THREE.Vector3();
    const tmpReturn = new THREE.Vector3();
    const mouseWorld = new THREE.Vector3();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      mouseWorld.set(mouse.x * 3, mouse.y * 3, 0);

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        tmpPos.set(positions[ix], positions[iy], positions[iz]);
        tmpOrig.set(
          originalPositions[ix],
          originalPositions[iy],
          originalPositions[iz],
        );
        tmpVel.set(velocities[ix], velocities[iy], velocities[iz]);

        if (!reduced) {
          const dist = tmpPos.distanceTo(mouseWorld);
          if (dist < 1.5) {
            const force = (1.5 - dist) * 0.01;
            tmpDir.subVectors(tmpPos, mouseWorld).normalize();
            tmpVel.add(tmpDir.multiplyScalar(force));
          }
        }

        tmpReturn.subVectors(tmpOrig, tmpPos).multiplyScalar(0.001);
        tmpVel.add(tmpReturn);
        tmpVel.multiplyScalar(0.95);

        positions[ix] += tmpVel.x;
        positions[iy] += tmpVel.y;
        positions[iz] += tmpVel.z;

        velocities[ix] = tmpVel.x;
        velocities[iy] = tmpVel.y;
        velocities[iz] = tmpVel.z;
      }
      (
        geometry.attributes.position as THREE.BufferAttribute
      ).needsUpdate = true;

      points.rotation.y = elapsed * 0.05;
      points.rotation.x = Math.sin(elapsed * 0.03) * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ──────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      mount.removeEventListener("mousemove", handleMouseMove);
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      torusKnot.dispose();
      renderer.dispose();
    };
  }, [particleCount]);

  return <div ref={mountRef} className={className} aria-hidden />;
}
