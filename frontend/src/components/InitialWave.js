import React, { useEffect, useRef } from 'react';
import './InitialWave.css';

const InitialWave = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    
    const ctx = canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true 
    });
    
    // canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    
    class WaveParticle {
      constructor(canvas) {
        this.canvas = canvas;
        this.trail = []; 
        this.maxTrailLength = 80; 
        this.reset();
        this.x = Math.random() * canvas.width;
      }

      reset() {
        this.x = -80; 
        this.baseY = this.canvas.height / 2 + (Math.random() - 0.5) * 200;
        this.y = this.baseY;
        this.size = Math.random() * 2 + 3; 
        this.speedX = Math.random() * 2 + 5; 
        this.opacity = Math.random() * 0.3 + 0.6; 
        this.hue = Math.random() * 30 + 15; 
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.03 + 0.05;
        
        this.waveAmplitude = Math.random() * 80 + 60; 
        this.waveFrequency = Math.random() * 0.004 + 0.002; 
        this.wavePhase = Math.random() * Math.PI * 2; 
        
        this.trail = []; 
      }

      update() {
        this.x += this.speedX;
        
        this.y = this.baseY + Math.sin(this.x * this.waveFrequency + this.wavePhase) * this.waveAmplitude;
        
        this.trail.push({ x: this.x, y: this.y });
        
        if (this.trail.length > this.maxTrailLength) {
          this.trail.shift();
        }
        
        this.pulsePhase += this.pulseSpeed;

        if (this.x > this.canvas.width + 100) {
          this.reset();
        }
      }

      draw(ctx) {
        if (this.trail.length < 2) return;
        
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const segmentSize = 5; 
        
        for (let i = 0; i < this.trail.length - 1; i += segmentSize) {
          const startIdx = i;
          const endIdx = Math.min(i + segmentSize, this.trail.length - 1);
          
          const progress = (startIdx + endIdx) / 2 / this.trail.length;
          const alpha = this.opacity * progress;
          
          if (progress > 0.7) { 
            ctx.shadowBlur = 25 * progress;
            ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, ${alpha})`;
          } else {
            ctx.shadowBlur = 0; 
          }
          
          ctx.strokeStyle = `hsla(${this.hue}, 90%, 65%, ${alpha})`;
          ctx.lineWidth = this.size * (0.5 + progress * 0.5);
          
          ctx.beginPath();
          ctx.moveTo(this.trail[startIdx].x, this.trail[startIdx].y);
          for (let j = startIdx + 1; j <= endIdx; j++) {
            ctx.lineTo(this.trail[j].x, this.trail[j].y);
          }
          ctx.stroke();
        }
        
        if (this.trail.length > 0) {
          const head = this.trail[this.trail.length - 1];
          
          ctx.shadowBlur = 30;
          ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, ${this.opacity})`;
          
          ctx.beginPath();
          ctx.arc(head.x, head.y, this.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.hue}, 95%, 70%, ${this.opacity})`;
          ctx.fill();
        }
        
        ctx.restore();
      }
    }

    const particleCount = Math.floor(Math.random() * 3) + 6; 
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new WaveParticle(canvas));
    }

    console.log(`InitialWave: ${particleCount} wave particles created (optimized)`);

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.15)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="initial-wave-container">
      <canvas ref={canvasRef} className="initial-wave-canvas" />
    </div>
  );
};

export default InitialWave;

