'use client';

import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface MagicBentoProps {
  children?: ReactNode;
  className?: string;
  enableSpotlight?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  enableStars?: boolean;
  enableBorderGlow?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
  particleCount?: number;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

export function MagicBento({
  children,
  className,
  enableSpotlight = true,
  enableTilt = true,
  enableMagnetism = true,
  enableStars = true,
  enableBorderGlow = true,
  clickEffect = true,
  spotlightRadius = 300,
  glowColor = '255, 255, 255',
  particleCount = 12,
}: MagicBentoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  const [clickParticles, setClickParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (enableStars && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newStars: Star[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 2 + 1,
      }));
      setStars(newStars);
    }
  }, [enableStars, particleCount]);

  // Animate stars
  useEffect(() => {
    if (!enableStars || stars.length === 0 || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const interval = setInterval(() => {
      setStars(prev =>
        prev.map(star => ({
          ...star,
          y: star.y <= 0 ? rect.height : star.y - star.speed,
          opacity: Math.sin(Date.now() / 1000 + star.id) * 0.3 + 0.5,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [enableStars, stars.length]);

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });

    // Spotlight effect
    if (enableSpotlight && spotlightRef.current) {
      spotlightRef.current.style.background = `radial-gradient(${spotlightRadius}px circle at ${x}px ${y}px, rgba(${glowColor}, 0.15), transparent 40%)`;
    }

    // Tilt effect
    if (enableTilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      gsap.to(containerRef.current, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    // Magnetism effect
    if (enableMagnetism) {
      const magnetStrength = 10;
      const offsetX = (x - rect.width / 2) / rect.width * magnetStrength;
      const offsetY = (y - rect.height / 2) / rect.height * magnetStrength;

      gsap.to(containerRef.current, {
        x: offsetX,
        y: offsetY,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    if (spotlightRef.current) {
      spotlightRef.current.style.background = 'transparent';
    }
  };

  // Handle click effect
  const handleClick = (e: React.MouseEvent) => {
    if (!clickEffect || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));

    setClickParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setClickParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl transition-all duration-300',
        enableBorderGlow && isHovered && 'shadow-[0_0_30px_rgba(255,255,255,0.1)]',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Border glow effect */}
      {enableBorderGlow && (
        <div
          className={cn(
            'absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            background: `linear-gradient(135deg, rgba(${glowColor}, 0.1) 0%, transparent 50%, rgba(${glowColor}, 0.1) 100%)`,
          }}
        />
      )}

      {/* Spotlight effect */}
      {enableSpotlight && (
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
          style={{ opacity: isHovered ? 1 : 0 }}
        />
      )}

      {/* Stars */}
      {enableStars && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {stars.map(star => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                transition: 'top 0.05s linear, opacity 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Click particles */}
      {clickEffect && clickParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none z-20"
          style={{ left: particle.x, top: particle.y }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white animate-[particle_0.6s_ease-out_forwards]"
              style={{
                transform: `rotate(${i * 45}deg) translateX(0)`,
                animation: `particle-${i} 0.6s ease-out forwards`,
              }}
            />
          ))}
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes particle-0 { to { transform: rotate(0deg) translateX(30px); opacity: 0; } }
        @keyframes particle-1 { to { transform: rotate(45deg) translateX(30px); opacity: 0; } }
        @keyframes particle-2 { to { transform: rotate(90deg) translateX(30px); opacity: 0; } }
        @keyframes particle-3 { to { transform: rotate(135deg) translateX(30px); opacity: 0; } }
        @keyframes particle-4 { to { transform: rotate(180deg) translateX(30px); opacity: 0; } }
        @keyframes particle-5 { to { transform: rotate(225deg) translateX(30px); opacity: 0; } }
        @keyframes particle-6 { to { transform: rotate(270deg) translateX(30px); opacity: 0; } }
        @keyframes particle-7 { to { transform: rotate(315deg) translateX(30px); opacity: 0; } }
      `}</style>
    </div>
  );
}

