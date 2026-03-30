'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
}

const COLORS = [
  '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

export default function ConfettiEffect() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 80; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 200,
        velocityY: -(Math.random() * 300 + 200),
      });
    }
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: `${piece.x}vw`,
              y: '-10px',
              rotate: piece.rotation,
              opacity: 1,
            }}
            animate={{
              y: '110vh',
              x: `${piece.x + (Math.random() - 0.5) * 30}vw`,
              rotate: piece.rotation + 720,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: Math.random() * 2 + 2,
              delay: piece.delay,
              ease: 'easeIn',
            }}
            className="absolute"
            style={{
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
