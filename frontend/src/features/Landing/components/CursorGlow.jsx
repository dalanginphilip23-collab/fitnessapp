import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { accentAlpha } from '../constants';

const MotionDiv = motion.div;

const CursorGlow = React.memo(({ enabled }) => {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  useEffect(() => {
    if (!enabled) return;
    const move = (e) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mx, my, enabled]);

  if (!enabled) return null;

  return (
    <MotionDiv className="pointer-events-none fixed z-[9999] top-0 left-0 hidden lg:block" style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}>
      <div className="w-64 h-64 rounded-full blur-[60px]" style={{ backgroundColor: accentAlpha(13) }} />
    </MotionDiv>
  );
});

export default CursorGlow;