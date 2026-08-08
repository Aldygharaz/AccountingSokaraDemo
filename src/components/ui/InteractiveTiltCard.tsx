import React, { useRef, useState } from 'react';

interface InteractiveTiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
  onClick?: () => void;
  'data-testid'?: string;
}

export const InteractiveTiltCard: React.FC<InteractiveTiltCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(0, 89, 181, 0.15)',
  maxTilt = 8,
  onClick,
  'data-testid': testId,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const rX = ((y / rect.height) - 0.5) * -maxTilt;
    const rY = ((x / rect.width) - 0.5) * maxTilt;

    setRotateX(rX);
    setRotateY(rY);
    setSpotlightPos({ x: xPercent, y: yPercent, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setSpotlightPos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-testid={testId}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      className={`relative overflow-hidden transition-shadow ${className}`}
    >
      {/* 3D Cursor Radial Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: spotlightPos.opacity,
          background: `radial-gradient(circle 180px at ${spotlightPos.x}% ${spotlightPos.y}%, ${glowColor}, transparent 80%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
