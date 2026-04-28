// src/components/game/AnimatedGameCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';

export default function AnimatedGameCanvas({ multiplier, gameState, roundId }) {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [rocketY, setRocketY] = useState(0);
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrame;
    let lastTime = 0;

    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#2d3748');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        const opacity = Math.random() * 0.5 + 0.5;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (gameState === 'running') {
        // Draw crash curve
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const startX = canvas.width * 0.1;
        const startY = canvas.height * 0.8;
        const endX = canvas.width * 0.9;
        const endY = canvas.height * 0.2;
        
        // Create smooth curve using quadratic bezier
        const controlX = (startX + endX) / 2;
        const controlY = startY - (multiplier - 1) * 50;
        
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.stroke();

        // Draw rocket
        setRocketY(prev => {
          const newY = Math.max(startY - (multiplier - 1) * 50, endY);
          const rocketX = startX + (multiplier - 1) * (endX - startX);
          
          // Rocket body
          ctx.fillStyle = '#ff6b6b';
          ctx.beginPath();
          ctx.moveTo(rocketX - 10, newY);
          ctx.lineTo(rocketX + 10, newY);
          ctx.lineTo(rocketX + 5, newY - 20);
          ctx.lineTo(rocketX - 5, newY - 20);
          ctx.closePath();
          ctx.fill();
          
          // Rocket window
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(rocketX - 3, newY - 15, 6, 8);
          
          // Rocket flames
          const flameSize = 5 + Math.random() * 10;
          ctx.fillStyle = '#ffa500';
          ctx.beginPath();
          ctx.moveTo(rocketX - 5, newY);
          ctx.lineTo(rocketX, newY + flameSize);
          ctx.lineTo(rocketX + 5, newY);
          ctx.closePath();
          ctx.fill();
          
          return newY;
        });
      }

      // Draw multiplier
      if (gameState === 'running' || gameState === 'crashed') {
        ctx.fillStyle = gameState === 'crashed' ? '#ef4444' : '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(`${multiplier.toFixed(2)}x`, canvas.width / 2, canvas.height / 3);
        
        // Color based on multiplier value
        let color;
        if (multiplier < 2) {
          color = '#10b981'; // green
        } else if (multiplier < 5) {
          color = '#eab308'; // yellow
        } else if (multiplier < 10) {
          color = '#f97316'; // orange
        } else {
          color = '#ef4444'; // red
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 3, 60, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw crash text
      if (gameState === 'crashed') {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CRASHED!', canvas.width / 2, canvas.height / 2);
        
        // Create explosion particles
        setParticles(prev => {
          const newParticles = [];
          for (let i = 0; i < 30; i++) {
            newParticles.push({
              x: canvas.width / 2,
              y: canvas.height / 3,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              life: 1.0,
              color: ['#ef4444', '#f97316', '#fbbf24'][Math.floor(Math.random() * 3)]
            });
          }
          return [...prev, ...newParticles];
        });
      }
    };

    const startAnimation = () => {
      const loop = (timestamp) => {
        animate(timestamp);
        if (gameState !== 'running') {
          cancelAnimationFrame(animationFrame);
          return;
        }
        animationFrame = requestAnimationFrame(loop);
      };
      animationFrame = requestAnimationFrame(startAnimation);
    };

    if (gameState === 'running') {
      startAnimation();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [gameState, multiplier]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      setParticles(prev => {
        return prev.filter(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= 0.02;
          particle.vx *= 0.98;
          particle.vy *= 0.98;

          if (particle.life > 0) {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            ctx.fill();
            return true;
          }
          return false;
        });
      });
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, [particles]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="w-full h-full rounded-xl"
      />
      
      {/* Win animation overlay */}
      {showWinAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-6xl font-bold text-green-400 animate-bounce">
            🎉 WIN! 🎉
          </div>
        </div>
      )}
    </div>
  );
}
