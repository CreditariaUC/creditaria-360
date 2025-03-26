import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import React from 'react';

const createHexagonPoints = (size: number): string => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180;
    points.push(`${size * Math.cos(angle)},${size * Math.sin(angle)}`);
  }
  return points.join(' ');
};

export const LoginVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // Create a progress value that goes from 0 to 1 over the duration
  const progress = (frame % durationInFrames) / durationInFrames;
  // Convert to radians for smooth looping (0 to 2π)
  const angle = progress * Math.PI * 2;

  return (
    <AbsoluteFill className="bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Hexagon Grid */}
      {[...Array(12)].map((_, row) =>
        [...Array(24)].map((_, col) => {
          const offset = row % 2 ? 50 : 0;
          // Use sine waves that complete exactly one cycle
          const x = col * 100 + offset + Math.sin(angle + (row + col) * 0.5) * 10;
          const y = row * 86 + Math.cos(angle + (row + col) * 0.5) * 10;
          const scale = 0.8 + Math.sin(angle * 2 + row * col * 0.1) * 0.2;
          const rotation = Math.sin(angle * 3 + (row + col) * 0.2) * 15;

          return (
            <svg
              key={`${row}-${col}`}
              className="absolute"
              width="60"
              height="60"
              style={{
                left: x,
                top: y,
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                opacity: 0.1 + Math.sin(angle * 2 + row * col * 0.1) * 0.1,
              }}
            >
              <polygon
                points={createHexagonPoints(25)}
                className="fill-none stroke-primary-500"
                strokeWidth="2"
                transform="translate(30,30)"
              />
            </svg>
          );
        })
      )}

{/* Floating Orbs */}
{[...Array(5)].map((_, i) => {
  const orbAngle = angle + (i * Math.PI * 2) / 5;
  return (
    <div
      key={i}
      className="absolute rounded-full bg-primary-500/30 blur-md"
      style={{
        width: 100 + i * 20, // Tamaño del orbe
        height: 100 + i * 20,
        left: `${50 + Math.sin(orbAngle) * 20}%`, // Centrado y radio ajustado
        top: `${50 + Math.cos(orbAngle) * 20}%`,  // Centrado y radio ajustado
        transform: `scale(${1 + Math.sin(angle * 2 + i) * 0.2})`, // Escalado dinámico
      }}
    />
  );
})}

     
    </AbsoluteFill>
  );
};