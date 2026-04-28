// src/components/game/GameCanvas.jsx
import React, { useEffect, useRef } from 'react';

export default function GameCanvas({ multiplier, gameState, roundId }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw gradient glow at bottom
    const gradient = ctx.createRadialGradient(width * 0.8, height * 0.9, 0, width * 0.8, height * 0.9, width * 0.5);
    gradient.addColorStop(0, 'rgba(220, 38, 38, 0.3)');
    gradient.addColorStop(1, 'rgba(220, 38, 38, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw crash curve
    if (gameState === 'running' || gameState === 'crashed') {
      ctx.beginPath();
      ctx.strokeStyle = gameState === 'crashed' ? '#ef4444' : '#dc2626';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      // Calculate curve points
      const startX = width * 0.1;
      const startY = height * 0.9;
      const endX = width * 0.85;
      const endY = height * 0.15;

      ctx.moveTo(startX, startY);

      // Draw exponential curve
      const steps = 50;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const x = startX + (endX - startX) * t;
        const y = startY - (startY - endY) * Math.pow(t, 1.5);
        ctx.lineTo(x, y);
      }

      ctx.stroke();

      // Draw rocket/character at end of curve
      const rocketX = endX;
      const rocketY = endY;

      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚀', rocketX, rocketY);
    }

    // Draw multiplier text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${multiplier.toFixed(2)}x`, width / 2, height / 2);

    // Draw crash text
    if (gameState === 'crashed') {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('CRASHED!', width / 2, height / 2 + 60);
    }

    // Draw round ID
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`ROUND ID: ${roundId}`, width - 15, height - 15);

  }, [multiplier, gameState, roundId]);

  return (
    <div className="relative bg-black">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-64 sm:h-80 md:h-96 object-cover"
      />
    </div>
  );
}
