import React, { useEffect, useRef } from 'react';
import './RecordingWave.css';

const RecordingWave = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class WaveParticle {
      constructor(canvas) {
        this.canvas = canvas;
        this.reset();
        this.x = Math.random() * canvas.width;
      }

      reset() {
        this.x = -50;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 4 + 6;
        this.speedX = Math.random() * 1.5 + 2; 
        this.speedY = (Math.random() - 0.5) * 1; 
        this.opacity = Math.random() * 0.5 + 1; 
        this.hue = Math.random() * 30 + 25; 
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.05 + 0.02;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        this.pulsePhase += this.pulseSpeed;
        const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5;
        this.currentSize = this.size * (0.7 + pulse * 0.6);

        if (this.x > this.canvas.width + 50) {
          this.reset();
        }

        if (this.y < 0 || this.y > this.canvas.height) {
          this.speedY *= -1;
        }
      }

      draw(ctx) {
        ctx.save();
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, ${this.opacity})`;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 90%, 65%, ${this.opacity})`;
        ctx.fill();

        ctx.beginPath();
        const gradient = ctx.createLinearGradient(
          this.x - 20, this.y,
          this.x, this.y
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 90%, 65%, 0)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 90%, 65%, ${this.opacity * 0.3})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - 20, this.y - this.currentSize / 2, 20, this.currentSize);
        
        ctx.restore();
      }
    }

    const particleCount = 20;
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new WaveParticle(canvas));
    }

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
    <div className="recording-wave-container">
      <canvas ref={canvasRef} className="recording-wave-canvas" />
      <div className="recording-wave-overlay">
        <div className="recording-pulse"></div>
        <p className="recording-text">Recording...</p>
      </div>
    </div>
  );
};

export default RecordingWave;

