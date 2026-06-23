"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  ox: number; // original x
  oy: number; // original y
  color: string;
  vx: number;
  vy: number;
  size: number;
}

interface ParticleImageProps {
  src: string;
  className?: string;
}

export interface ParticleImageRef {
  setProgress: (progress: number) => void;
}

export const ParticleImage = forwardRef<ParticleImageRef, ParticleImageProps>(
  ({ src, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const progressRef = useRef<number>(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Expose setProgress to parent
    useImperativeHandle(ref, () => ({
      setProgress: (progress: number) => {
        progressRef.current = progress;
        draw();
      },
    }));

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const progress = progressRef.current;
      const particles = particlesRef.current;

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Higher scatter distance (140px) so the scatter is extremely obvious
        const distMultiplier = 140 * progress;

        // Gentle wave motion that doesn't distort the face details
        const waveX = Math.sin(p.oy * 0.05 + progress * 5) * 6 * progress;
        const waveY = Math.cos(p.ox * 0.05 + progress * 5) * 6 * progress;

        const curX = p.ox + p.vx * distMultiplier + waveX;
        const curY = p.oy + p.vy * distMultiplier + waveY;

        // Keep opacity higher (min 0.5) so the image details are never lost
        const alpha = 1 - progress * 0.5;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(curX - p.size / 2, curY - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1.0;
    };

    useEffect(() => {
      const image = new window.Image();
      image.src = src;
      image.crossOrigin = "anonymous";
      imageRef.current = image;

      image.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const canvasSize = 500;
        const imageSize = 280;
        const offset = (canvasSize - imageSize) / 2; // 110px offset

        canvas.width = canvasSize;
        canvas.height = canvasSize;

        // Draw image temporarily at the center offset to extract pixels
        ctx.drawImage(image, offset, offset, imageSize, imageSize);

        // Get pixel data from the drawn area
        const imgData = ctx.getImageData(0, 0, canvasSize, canvasSize);
        const data = imgData.data;
        const step = 3; // Step 3 offers high visual fidelity (~6,500 particles) while maintaining 60fps
        const particles: Particle[] = [];

        // Center of the image relative to canvas
        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;
        const radius = imageSize / 2;

        for (let y = offset; y < offset + imageSize; y += step) {
          for (let x = offset; x < offset + imageSize; x += step) {
            const index = (y * canvasSize + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];

            // Circular mask boundary check
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= radius && a > 50) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 0.3 + Math.random() * 0.7;

              // Direction is outward from center
              const vx = (dx / dist) * 0.7 + Math.cos(angle) * 0.3;
              const vy = (dy / dist) * 0.7 + Math.sin(angle) * 0.3;

              particles.push({
                x: x,
                y: y,
                ox: x,
                oy: y,
                color: `rgb(${r},${g},${b})`,
                vx: vx * speed,
                vy: vy * speed,
                size: step - 0.5, // slightly larger particles for a more filled/clear image
              });
            }
          }
        }

        particlesRef.current = particles;
        setIsLoaded(true);
        draw();
      };
    }, [src]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          display: "block",
          pointerEvents: "none",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
    );
  }
);

ParticleImage.displayName = "ParticleImage";
