import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EASE_EXPO, THEME, ink, accentAlpha } from '../constants';

const MotionDiv = motion.div;

const StatCounter = React.memo(({ value, label }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center relative">
      <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-8" style={{ backgroundColor: accentAlpha(20) }} />
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE_EXPO }}
        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none mb-2"
        style={{ fontFamily: "'Bebas Neue', sans-serif", color: THEME.textStrong }}
      >{value}</MotionDiv>
      <div className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: ink(0.3) }}>{label}</div>
    </div>
  );
});

export default StatCounter;