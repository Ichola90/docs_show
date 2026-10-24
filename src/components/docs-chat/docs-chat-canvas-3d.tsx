"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface DocsChatCanvas3DProps {
  activeBotId?: string;
  isLoading?: boolean;
  theme?: string;
}

// Couleurs thématiques vibrantes par chatbot DOCS SHOW
const BOT_PALETTES: Record<string, { primary: string; secondary: string; glow: string }> = {
  assistant: { primary: "#2563eb", secondary: "#38bdf8", glow: "#1d4ed8" },
  "docs-core": { primary: "#f59e0b", secondary: "#ea580c", glow: "#b45309" },
  "docs-modern": { primary: "#10b981", secondary: "#06b6d4", glow: "#059669" },
  debate: { primary: "#ef4444", secondary: "#3b82f6", glow: "#8b5cf6" },
  "book-c": { primary: "#3b82f6", secondary: "#60a5fa", glow: "#1e40af" },
  "book-php": { primary: "#8b5cf6", secondary: "#ec4899", glow: "#6d28d9" },
  "book-cpu": { primary: "#f59e0b", secondary: "#eab308", glow: "#d97706" },
  "book-cleancode": { primary: "#06b6d4", secondary: "#14b8a6", glow: "#0891b2" },
};

export function DocsChatCanvas3D({
  activeBotId = "assistant",
  isLoading = false,
  theme = "dark",
}: DocsChatCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBotRef = useRef(activeBotId);
  const isLoadingRef = useRef(isLoading);
  const themeRef = useRef(theme);

  useEffect(() => {
    activeBotRef.current = activeBotId;
    isLoadingRef.current = isLoading;
    themeRef.current = theme;
  }, [activeBotId, isLoading, theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Détection de préférence pour la réduction de mouvement
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Dimensions initiales
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const initialBot = activeBotRef.current;
    const initialIsDark = themeRef.current === "dark";

    // 1. Scène, Caméra & Rendu WebGL transparent
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.z = 8.5;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn("WebGL non supporté pour DocsChatCanvas3D :", e);
      return;
    }

    // 2. Groupe Racine 3D
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Couleurs initiales
    const palette = BOT_PALETTES[initialBot] || BOT_PALETTES.assistant;
    const currentColor = new THREE.Color(palette.primary);
    const targetColor = new THREE.Color(palette.primary);
    const currentSecondary = new THREE.Color(palette.secondary);
    const targetSecondary = new THREE.Color(palette.secondary);

    // 3. Cœur 3D Géométrique : Icosaèdre Wireframe (Core Engine DOCS SHOW)
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: currentColor,
      wireframe: true,
      transparent: true,
      opacity: initialIsDark ? 0.45 : 0.28,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // 4. Noyau Cristallin Interne (Octaèdre pulsant)
    const nucleusGeo = new THREE.OctahedronGeometry(0.85, 0);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: currentSecondary,
      wireframe: true,
      transparent: true,
      opacity: initialIsDark ? 0.65 : 0.4,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    rootGroup.add(nucleusMesh);

    // 5. Anneaux Orbitaux Gyroscopiques
    const ringGeo1 = new THREE.TorusGeometry(2.5, 0.02, 16, 90);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: currentColor,
      transparent: true,
      opacity: initialIsDark ? 0.35 : 0.2,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    rootGroup.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(3.1, 0.015, 16, 90);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: currentSecondary,
      transparent: true,
      opacity: initialIsDark ? 0.3 : 0.16,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    ringMesh2.rotation.x = -Math.PI / 5;
    rootGroup.add(ringMesh2);

    // 6. Constellation de Nœuds et Particules Synaptiques
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
        z: (Math.random() - 0.5) * 0.003,
      });
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: currentSecondary,
      size: 0.08,
      transparent: true,
      opacity: initialIsDark ? 0.8 : 0.5,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // 7. Lignes Synaptiques Dynamiques entre Nœuds Proches
    const maxLines = 120;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3)
    );

    const lineMat = new THREE.LineBasicMaterial({
      color: currentColor,
      transparent: true,
      opacity: initialIsDark ? 0.22 : 0.12,
      blending: THREE.AdditiveBlending,
    });

    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    rootGroup.add(linesMesh);

    // 8. Gestion de l'interactivité souris / gyroscope
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseX = normX * 0.45;
      mouseY = normY * 0.35;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // 9. Boucle d'animation fluide 60fps
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Si l'onglet est en arrière-plan, suspendre le calcul lourd
      if (document.hidden) return;

      const delta = clock.getDelta();
      const isGenerating = isLoadingRef.current;
      const currentBot = activeBotRef.current;
      const activePalette = BOT_PALETTES[currentBot] || BOT_PALETTES.assistant;

      // Transition progressive des couleurs
      targetColor.set(activePalette.primary);
      targetSecondary.set(activePalette.secondary);
      currentColor.lerp(targetColor, 0.06);
      currentSecondary.lerp(targetSecondary, 0.06);

      coreMat.color.copy(currentColor);
      nucleusMat.color.copy(currentSecondary);
      ringMat1.color.copy(currentColor);
      ringMat2.color.copy(currentSecondary);
      particleMat.color.copy(currentSecondary);
      lineMat.color.copy(currentColor);

      // Ajustement des opacités selon le thème
      const isDark = themeRef.current === "dark";
      coreMat.opacity = isDark ? 0.45 : 0.25;
      nucleusMat.opacity = isDark ? 0.7 : 0.35;
      particleMat.opacity = isDark ? 0.85 : 0.45;

      if (!prefersReducedMotion) {
        // Vitesse de rotation : accélérée quand l'IA réfléchit / répond
        const speedMultiplier = isGenerating ? 3.2 : 1.0;

        // Rotation du cœur et des anneaux
        coreMesh.rotation.y += 0.35 * delta * speedMultiplier;
        coreMesh.rotation.x += 0.22 * delta * speedMultiplier;

        nucleusMesh.rotation.y -= 0.6 * delta * speedMultiplier;
        nucleusMesh.rotation.z += 0.4 * delta * speedMultiplier;

        ringMesh1.rotation.z += 0.25 * delta * speedMultiplier;
        ringMesh2.rotation.z -= 0.3 * delta * speedMultiplier;

        // Pulsation du noyau (breathe effect)
        const pulse = 1 + Math.sin(clock.getElapsedTime() * (isGenerating ? 6 : 2)) * 0.12;
        nucleusMesh.scale.set(pulse, pulse, pulse);

        // Déplacement interactif souple de la caméra / racine
        targetRotX += (mouseY - targetRotX) * 0.04;
        targetRotY += (mouseX - targetRotY) * 0.04;
        rootGroup.rotation.x = targetRotX;
        rootGroup.rotation.y = targetRotY + clock.getElapsedTime() * 0.06;

        // Animation des particules
        const positions = particleGeo.attributes.position.array as Float32Array;
        let lineIdx = 0;
        const linePos = lineGeo.attributes.position.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += particleVelocities[i].x * speedMultiplier;
          positions[i * 3 + 1] += particleVelocities[i].y * speedMultiplier;
          positions[i * 3 + 2] += particleVelocities[i].z * speedMultiplier;

          // Rebond sphérique pour garder la constellation regroupée
          const distSq =
            positions[i * 3] ** 2 +
            positions[i * 3 + 1] ** 2 +
            positions[i * 3 + 2] ** 2;

          if (distSq > 36 || distSq < 3.2) {
            particleVelocities[i].x *= -1;
            particleVelocities[i].y *= -1;
            particleVelocities[i].z *= -1;
          }

          // Tracé des liens synaptiques entre particules proches
          if (lineIdx < maxLines * 6) {
            for (let j = i + 1; j < particleCount; j++) {
              const dx = positions[i * 3] - positions[j * 3];
              const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
              const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
              const d2 = dx * dx + dy * dy + dz * dz;

              if (d2 < 2.8 && lineIdx < maxLines * 6) {
                linePos[lineIdx++] = positions[i * 3];
                linePos[lineIdx++] = positions[i * 3 + 1];
                linePos[lineIdx++] = positions[i * 3 + 2];
                linePos[lineIdx++] = positions[j * 3];
                linePos[lineIdx++] = positions[j * 3 + 1];
                linePos[lineIdx++] = positions[j * 3 + 2];
              }
            }
          }
        }

        // Effacer le reste du buffer des lignes
        for (let k = lineIdx; k < maxLines * 6; k++) {
          linePos[k] = 0;
        }

        particleGeo.attributes.position.needsUpdate = true;
        lineGeo.attributes.position.needsUpdate = true;
      }

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    // 10. Gestion du redimensionnement responsive
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener("resize", handleResize);

    // Nettoyage complet à la destruction pour libérer la mémoire WebGL
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }

      coreGeo.dispose();
      coreMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="docs-chat-canvas-3d-wrap"
      aria-hidden="true"
    />
  );
}

