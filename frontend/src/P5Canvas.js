import React from 'react';
import Sketch from 'react-p5';

const P5Canvas = ({ sentiment, keywords }) => {
  let particles = [];
  let attractors = [];  
  
  
  let noiseScale = 0.006;  
  let flowFieldResolution = 18;
  
  const NOISE_PARAMS = {
    POSITIVE: {
      scale: 0.005,        
      octaves: 3,          
      persistence: 0.4,    
      resolution: 16
    },
    NEGATIVE: {
      scale: 0.008,        
      octaves: 5,          
      persistence: 0.7,    
      resolution: 22
    },
    NEUTRAL: {
      scale: 0.006,        
      octaves: 4,          
      persistence: 0.5,    
      resolution: 18
    }
  };
  
  const COLOR_PALETTES = {
    // positive- like Monet's Sunrise: bright, warm
    POSITIVE: [
      { h: 35, s: 75, b: 95 },  
      { h: 355, s: 45, b: 90 }, 
      { h: 200, s: 35, b: 92 }, 
      { h: 165, s: 30, b: 85 }, 
      { h: 40, s: 70, b: 98 },  
      { h: 280, s: 30, b: 95 }, 
      { h: 60, s: 20, b: 95 },  
      { h: 15, s: 60, b: 90 }   
    ],
    
    // negative- like foggy dark: deep, dark, depressing
    NEGATIVE: [
      { h: 270, s: 40, b: 25 }, 
      { h: 0, s: 65, b: 29 },   
      { h: 200, s: 40, b: 36 }, 
      { h: 160, s: 50, b: 18 }, 
      { h: 0, s: 0, b: 24 },    
      { h: 230, s: 30, b: 18 }, 
      { h: 210, s: 20, b: 28 }, 
      { h: 280, s: 35, b: 22 }  
    ],
    
    // neutral- like marble water: soft, balanced, peaceful
    NEUTRAL: [
      { h: 60, s: 8, b: 96 },   
      { h: 0, s: 0, b: 83 },    
      { h: 214, s: 15, b: 87 }, 
      { h: 40, s: 12, b: 75 },  
      { h: 0, s: 0, b: 75 },    
      { h: 180, s: 7, b: 94 }   
    ]
  };
  
  const VISUAL_CONFIG = {
    PARTICLE_COUNT: {
      NEUTRAL: 500,       
      POSITIVE_MAX: 800,  
      NEGATIVE_MIN: 400
    },
    
    TRAIL_ALPHA: {
      STRONG_EMOTION: 1,  
      NEUTRAL: 2,
      WEAK_EMOTION: 4
    },
    
    TIME_SPEED: {
      POSITIVE_MAX: 0.006,
      NEGATIVE_MIN: 0.0008,
      NEUTRAL: 0.002
    },
    
    GLOW_INTENSITY: {
      POSITIVE_MAX: 25,  
      NEGATIVE_MIN: 2,   
      NEUTRAL: 5         
    },
    
    GLOW_PARTICLE_RATIO: {
      POSITIVE: 0.5,   
      NEGATIVE: 0.1,   
      NEUTRAL: 0.2     
    },
    
    FLOW_INTENSITY: {
      POSITIVE_MAX: 2.5,
      NEGATIVE_MIN: 0.5,
      NEUTRAL: 1.2
    },
    
    
    PARTICLE_SIZE: {
      POSITIVE: { MIN: 5, MAX: 12 },  // positive- like clouds, sunflowers
      NEGATIVE: { MIN: 3, MAX: 9 },   // negative- like raindrops, fog blocks
      NEUTRAL: { MIN: 2, MAX: 5 }     // neutral- like marble texture
    },
    
    BACKGROUND_COLOR: {
      POSITIVE: { R: 15, G: 12, B: 8 },   
      NEGATIVE: { R: 5, G: 5, B: 10 },    
      NEUTRAL: { R: 12, G: 12, B: 15 }    
    }
  };

  const getColorPalette = (sentiment) => {
    if (sentiment === null) return COLOR_PALETTES.NEUTRAL;
    if (sentiment > 0.2) return COLOR_PALETTES.POSITIVE;
    if (sentiment < -0.2) return COLOR_PALETTES.NEGATIVE;
    return COLOR_PALETTES.NEUTRAL;
  };

  const getParticleSizeRange = (sentiment) => {
    if (sentiment === null) return VISUAL_CONFIG.PARTICLE_SIZE.NEUTRAL;
    if (sentiment > 0.2) return VISUAL_CONFIG.PARTICLE_SIZE.POSITIVE;
    if (sentiment < -0.2) return VISUAL_CONFIG.PARTICLE_SIZE.NEGATIVE;
    return VISUAL_CONFIG.PARTICLE_SIZE.NEUTRAL;
  };

  const generateAttractors = (p5, sentiment) => {
    attractors = [];
    
    if (sentiment === null || (sentiment >= -0.2 && sentiment <= 0.2)) {
      const vortexCount = 3 + Math.floor(p5.random(5)); 
      for (let i = 0; i < vortexCount; i++) {
        attractors.push({
          x: p5.random(p5.width * 0.2, p5.width * 0.8),
          y: p5.random(p5.height * 0.2, p5.height * 0.8),
          strength: p5.random(0.1, 0.2),
          rotation: p5.random(-0.02, 0.02) 
        });
      }
    } else if (sentiment > 0.2) {
      const vortexCount = 5 + Math.floor(p5.random(8)); 
      for (let i = 0; i < vortexCount; i++) {
        attractors.push({
          x: p5.random(p5.width * 0.15, p5.width * 0.85),
          y: p5.random(p5.height * 0.15, p5.height * 0.85),
          strength: p5.random(0.15, 0.35),
          rotation: p5.random(-0.05, 0.05) 
        });
      }
    } else {
      const vortexCount = 2 + Math.floor(p5.random(4)); 
      for (let i = 0; i < vortexCount; i++) {
        attractors.push({
          x: p5.random(p5.width * 0.25, p5.width * 0.75),
          y: p5.random(p5.height * 0.25, p5.height * 0.75),
          strength: p5.random(0.25, 0.45),
          rotation: p5.random(0.03, 0.08) * (p5.random() > 0.5 ? 1 : -1) 
        });
      }
    }
  };

  const getShapeType = (sentiment, random) => {
    if (sentiment === null) {
      return random < 0.7 ? 'line' : 'circle';
    }
    
    if (sentiment > 0.2) {
      if (random < 0.4) return 'circle';
      if (random < 0.7) return 'ellipse';
      if (random < 0.9) return 'line';
      return 'rect';
    } else if (sentiment < -0.2) {
      if (random < 0.4) return 'triangle';
      if (random < 0.7) return 'line';
      if (random < 0.85) return 'rect';
      return 'dash';
    }
    
    return 'line';
  };

  const getParticleCount = (sentiment) => {
    if (sentiment === null) return VISUAL_CONFIG.PARTICLE_COUNT.NEUTRAL;
    
    if (sentiment > 0) {
      return Math.floor(
        VISUAL_CONFIG.PARTICLE_COUNT.NEUTRAL + 
        sentiment * (VISUAL_CONFIG.PARTICLE_COUNT.POSITIVE_MAX - VISUAL_CONFIG.PARTICLE_COUNT.NEUTRAL)
      );
    } else if (sentiment < 0) {
      return Math.floor(
        VISUAL_CONFIG.PARTICLE_COUNT.NEUTRAL + 
        sentiment * (VISUAL_CONFIG.PARTICLE_COUNT.NEUTRAL - VISUAL_CONFIG.PARTICLE_COUNT.NEGATIVE_MIN)
      );
    }
    
    return VISUAL_CONFIG.PARTICLE_COUNT.NEUTRAL;
  };

  class Particle {
    constructor(p5, sentiment) {
      this.p5 = p5;
      this.pos = p5.createVector(
        p5.random(p5.width),
        p5.random(p5.height)
      );
      this.vel = p5.createVector(0, 0);
      this.acc = p5.createVector(0, 0);
      this.maxSpeed = 2;
      this.prevPos = this.pos.copy();
      
      this.stability = 0;  
      this.targetReached = false;
      
      const palette = getColorPalette(sentiment);
      this.colorIndex = p5.floor(p5.random(palette.length));
      
      this.shape = getShapeType(sentiment, p5.random());
      
      const sizeRange = getParticleSizeRange(sentiment);
      this.size = p5.random(sizeRange.MIN, sizeRange.MAX);
      
      let glowRatio;
      if (sentiment > 0.2) {
        glowRatio = VISUAL_CONFIG.GLOW_PARTICLE_RATIO.POSITIVE;
      } else if (sentiment < -0.2) {
        glowRatio = VISUAL_CONFIG.GLOW_PARTICLE_RATIO.NEGATIVE;
      } else {
        glowRatio = VISUAL_CONFIG.GLOW_PARTICLE_RATIO.NEUTRAL;
      }
      this.hasGlow = p5.random() < glowRatio;
      
      this.lifespan = 255;
      this.maxLifespan = 255;
    }

    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }

    follow(flowField) {
      const p5 = this.p5;
      const x = p5.floor(this.pos.x / flowFieldResolution);
      const y = p5.floor(this.pos.y / flowFieldResolution);
      const cols = p5.floor(p5.width / flowFieldResolution);
      const index = x + y * cols;
      
      if (flowField[index]) {
        const force = flowField[index];
        const noiseInfluence = 0.7 * (1 - this.stability * 0.8);
        force.mult(noiseInfluence);
        this.applyForce(force);
      }
    }

    attractTo(attractors) {
      if (!attractors || attractors.length === 0) return;
      
      const p5 = this.p5;
      
      let closestAttractor = null;
      let closestDist = Infinity;
      
      for (let attractor of attractors) {
        const d = p5.dist(this.pos.x, this.pos.y, attractor.x, attractor.y);
        if (d < closestDist) {
          closestDist = d;
          closestAttractor = attractor;
        }
      }
      
      if (closestAttractor) {
        const stabilityRadius = 80;  
        
        if (closestDist < stabilityRadius) {
          this.stability = p5.min(1, this.stability + 0.01);
          
          const speedMultiplier = 1 - (this.stability * 0.9); 
          this.maxSpeed = 2 * speedMultiplier;
          
          if (this.stability > 0.7) {
            this.targetReached = true;
          }
        } else {
          this.stability = p5.max(0, this.stability - 0.005);
          this.maxSpeed = 2;
          this.targetReached = false;
        }
        
        if (this.stability < 0.8 && closestDist > 5) {
          const dx = closestAttractor.x - this.pos.x;
          const dy = closestAttractor.y - this.pos.y;
          
          const tangent = p5.createVector(-dy, dx); 
          tangent.normalize();
          tangent.mult(closestAttractor.rotation * closestDist * 0.05 * (1 - this.stability));
          
          const radial = p5.createVector(dx, dy);
          radial.normalize();
          radial.mult(closestAttractor.strength * 0.5 * (1 - this.stability));
          
          const combinedForce = p5.constructor.Vector.add(tangent, radial);
          this.applyForce(combinedForce);
        }
      }
    }

    applyForce(force) {
      this.acc.add(force);
    }

    show(palette, glowIntensity) {
      const p5 = this.p5;
      const colorData = palette[this.colorIndex];
      
      p5.colorMode(p5.HSB);
      const particleColor = p5.color(colorData.h, colorData.s, colorData.b);
      
      if (this.hasGlow) {
        p5.drawingContext.shadowBlur = glowIntensity;
        p5.drawingContext.shadowColor = particleColor.toString('#rrggbb');
      } else {
        p5.drawingContext.shadowBlur = 0;
      }
      
      switch(this.shape) {
        case 'line':
          this.drawLine(particleColor);
          break;
        case 'circle':
          this.drawCircle(particleColor);
          break;
        case 'ellipse':
          this.drawEllipse(particleColor);
          break;
        case 'triangle':
          this.drawTriangle(particleColor);
          break;
        case 'rect':
          this.drawRect(particleColor);
          break;
        case 'dash':
          this.drawDash(particleColor);
          break;
        default:
          this.drawLine(particleColor);
      }
      
      this.updatePrev();
      p5.colorMode(p5.RGB);
    }

    drawLine(color) {
      const p5 = this.p5;
      p5.stroke(color);
      p5.strokeWeight(this.size);
      p5.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    }

    drawCircle(color) {
      const p5 = this.p5;
      p5.fill(color);
      p5.noStroke();
      p5.circle(this.pos.x, this.pos.y, this.size);
    }

    drawEllipse(color) {
      const p5 = this.p5;
      p5.fill(color);
      p5.noStroke();
      const angle = this.vel.heading();
      p5.push();
      p5.translate(this.pos.x, this.pos.y);
      p5.rotate(angle);
      p5.ellipse(0, 0, this.size * 1.5, this.size * 0.7);
      p5.pop();
    }

    drawTriangle(color) {
      const p5 = this.p5;
      p5.fill(color);
      p5.noStroke();
      const angle = this.vel.heading();
      p5.push();
      p5.translate(this.pos.x, this.pos.y);
      p5.rotate(angle);
      const s = this.size;
      p5.triangle(0, -s, -s*0.6, s*0.5, s*0.6, s*0.5);
      p5.pop();
    }

    drawRect(color) {
      const p5 = this.p5;
      p5.fill(color);
      p5.noStroke();
      const angle = this.vel.heading();
      p5.push();
      p5.translate(this.pos.x, this.pos.y);
      p5.rotate(angle);
      p5.rect(-this.size/2, -this.size/2, this.size, this.size * 1.5);
      p5.pop();
    }

    drawDash(color) {
      const p5 = this.p5;
      p5.stroke(color);
      p5.strokeWeight(this.size * 0.8);
      const dx = this.pos.x - this.prevPos.x;
      const dy = this.pos.y - this.prevPos.y;
      p5.line(
        this.pos.x - dx * 0.3, 
        this.pos.y - dy * 0.3, 
        this.pos.x, 
        this.pos.y
      );
    }

    updatePrev() {
      this.prevPos.x = this.pos.x;
      this.prevPos.y = this.pos.y;
    }

    edges() {
      const p5 = this.p5;
      if (this.pos.x > p5.width) {
        this.pos.x = 0;
        this.updatePrev();
      }
      if (this.pos.x < 0) {
        this.pos.x = p5.width;
        this.updatePrev();
      }
      if (this.pos.y > p5.height) {
        this.pos.y = 0;
        this.updatePrev();
      }
      if (this.pos.y < 0) {
        this.pos.y = p5.height;
        this.updatePrev();
      }
    }
  }

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.colorMode(p5.HSB);
    p5.background(
      VISUAL_CONFIG.BACKGROUND_COLOR.R,
      VISUAL_CONFIG.BACKGROUND_COLOR.G,
      VISUAL_CONFIG.BACKGROUND_COLOR.B
    );
    
    particles = [];
    const initialCount = VISUAL_CONFIG.PARTICLE_COUNT.NEUTRAL;
    for (let i = 0; i < initialCount; i++) {
      particles.push(new Particle(p5, null));
    }
    
    generateAttractors(p5, null);
    
    console.log('P5Canvas (Van Gogh Artistic Mode) initialized:', {
      size: `${p5.width}x${p5.height}`,
      particles: initialCount,
      vortexCenters: attractors.length,
      glowRatio: `${VISUAL_CONFIG.GLOW_PARTICLE_RATIO * 100}%`,
      noiseScale: noiseScale,
      style: 'Starry Night - Organic Flow with Random Vortices'
    });
  };

  
  let lastSentiment = null;

  const draw = (p5) => {
    const currentSentiment = sentiment;
    const sentimentChanged = (
      (lastSentiment === null && currentSentiment !== null) ||
      (lastSentiment !== null && currentSentiment === null) ||
      (lastSentiment !== null && currentSentiment !== null && 
       Math.sign(lastSentiment) !== Math.sign(currentSentiment)) ||
      (lastSentiment !== null && currentSentiment !== null &&
       Math.abs(lastSentiment - currentSentiment) > 0.3)
    );
    
    if (sentimentChanged) {
      generateAttractors(p5, currentSentiment);
      lastSentiment = currentSentiment;
      console.log('Vortex centers regenerated:', attractors.length, 'organic vortices');
    }
    
    const targetParticleCount = getParticleCount(sentiment);
    if (particles.length < targetParticleCount) {
      for (let i = particles.length; i < targetParticleCount; i++) {
        particles.push(new Particle(p5, sentiment));
      }
    } else if (particles.length > targetParticleCount) {
      particles.splice(targetParticleCount);
    }

    const emotionalIntensity = sentiment !== null ? Math.abs(sentiment) : 0.5;
    
    let trailAlpha;
    if (sentiment === null) {
      trailAlpha = VISUAL_CONFIG.TRAIL_ALPHA.NEUTRAL;
    } else if (emotionalIntensity > 0.7) {
      trailAlpha = VISUAL_CONFIG.TRAIL_ALPHA.STRONG_EMOTION;
    } else if (emotionalIntensity < 0.3) {
      trailAlpha = VISUAL_CONFIG.TRAIL_ALPHA.WEAK_EMOTION;
    } else {
      trailAlpha = p5.map(emotionalIntensity, 0.3, 0.7, 
        VISUAL_CONFIG.TRAIL_ALPHA.WEAK_EMOTION, 
        VISUAL_CONFIG.TRAIL_ALPHA.STRONG_EMOTION
      );
    }
    
    p5.colorMode(p5.RGB);
    let bgColor;
    if (sentiment > 0.2) {
      bgColor = VISUAL_CONFIG.BACKGROUND_COLOR.POSITIVE;
    } else if (sentiment < -0.2) {
      bgColor = VISUAL_CONFIG.BACKGROUND_COLOR.NEGATIVE;
    } else {
      bgColor = VISUAL_CONFIG.BACKGROUND_COLOR.NEUTRAL;
    }
    p5.fill(bgColor.R, bgColor.G, bgColor.B, trailAlpha);
    p5.noStroke();
    p5.rect(0, 0, p5.width, p5.height);

    let timeSpeed;
    if (sentiment === null) {
      timeSpeed = VISUAL_CONFIG.TIME_SPEED.NEUTRAL;
    } else if (sentiment > 0) {
      timeSpeed = p5.map(sentiment, 0, 1, 
        VISUAL_CONFIG.TIME_SPEED.NEUTRAL, 
        VISUAL_CONFIG.TIME_SPEED.POSITIVE_MAX
      );
    } else {
      timeSpeed = p5.map(sentiment, 0, -1, 
        VISUAL_CONFIG.TIME_SPEED.NEUTRAL, 
        VISUAL_CONFIG.TIME_SPEED.NEGATIVE_MIN
      );
    }
    const zoff = p5.frameCount * timeSpeed;

    let noiseInfluence;
    if (sentiment === null) {
      noiseInfluence = VISUAL_CONFIG.FLOW_INTENSITY.NEUTRAL;
    } else if (sentiment > 0) {
      noiseInfluence = p5.map(sentiment, 0, 1, 
        VISUAL_CONFIG.FLOW_INTENSITY.NEUTRAL, 
        VISUAL_CONFIG.FLOW_INTENSITY.POSITIVE_MAX
      );
    } else {
      noiseInfluence = p5.map(sentiment, 0, -1, 
        VISUAL_CONFIG.FLOW_INTENSITY.NEUTRAL, 
        VISUAL_CONFIG.FLOW_INTENSITY.NEGATIVE_MIN
      );
    }

    const keywordComplexity = keywords && keywords.length > 0 
      ? 1 + keywords.length * 0.08
      : 1;

    let currentNoiseParams;
    if (sentiment > 0.2) {
      currentNoiseParams = NOISE_PARAMS.POSITIVE;
    } else if (sentiment < -0.2) {
      currentNoiseParams = NOISE_PARAMS.NEGATIVE;
    } else {
      currentNoiseParams = NOISE_PARAMS.NEUTRAL;
    }
    
    noiseScale = currentNoiseParams.scale;
    flowFieldResolution = currentNoiseParams.resolution;
    
    const flowField = [];
    const cols = p5.floor(p5.width / flowFieldResolution);
    const rows = p5.floor(p5.height / flowFieldResolution);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const angle = p5.noise(
          x * noiseScale,
          y * noiseScale,
          zoff
        ) * p5.TWO_PI * noiseInfluence * keywordComplexity;
        
        const v = p5.constructor.Vector.fromAngle(angle);
        v.setMag(0.5);
        flowField[x + y * cols] = v;
      }
    }

    let glowIntensity;
    if (sentiment === null) {
      glowIntensity = VISUAL_CONFIG.GLOW_INTENSITY.NEUTRAL;
    } else if (sentiment > 0) {
      glowIntensity = p5.map(sentiment, 0, 1, 
        VISUAL_CONFIG.GLOW_INTENSITY.NEUTRAL, 
        VISUAL_CONFIG.GLOW_INTENSITY.POSITIVE_MAX
      );
    } else {
      glowIntensity = p5.map(sentiment, 0, -1, 
        VISUAL_CONFIG.GLOW_INTENSITY.NEUTRAL, 
        VISUAL_CONFIG.GLOW_INTENSITY.NEGATIVE_MIN
      );
    }

    const currentPalette = getColorPalette(sentiment);

    for (let particle of particles) {
      particle.follow(flowField);      
      particle.attractTo(attractors);  
      particle.update();
      particle.edges();
      particle.show(currentPalette, glowIntensity);
    }

    p5.drawingContext.shadowBlur = 0;
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    generateAttractors(p5, sentiment);
    console.log('Canvas resized:', `${p5.width}x${p5.height}`, 'Vortices regenerated');
  };

  return (
    <div className="p5-canvas-container">
      <Sketch setup={setup} draw={draw} windowResized={windowResized} />
    </div>
  );
};

export default P5Canvas;
