'use client';

import * as React from 'react';

const CONFETTI_COLORS = ['#EF4444', '#F97316', '#FBBF24', '#84CC16', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];

const ConfettiPiece = ({ style }: { style: React.CSSProperties }) => {
  return <div className="confetti-piece" style={style}></div>;
};

const Confetti = () => {
  const [pieces, setPieces] = React.useState<React.ReactNode[]>([]);

  React.useEffect(() => {
    const newPieces = Array.from({ length: 50 }).map((_, index) => {
      const style: React.CSSProperties = {
        background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        '--translateX': `${(Math.random() - 0.5) * 400}px`,
        animationDelay: `${Math.random() * 0.2}s`,
      };
      return <ConfettiPiece key={index} style={style} />;
    });

    setPieces(newPieces);
  }, []);

  return <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">{pieces}</div>;
};

export default Confetti;
