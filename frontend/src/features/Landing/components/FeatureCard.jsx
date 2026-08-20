import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/ui/Icon';
import { EASE_EXPO, THEME, ink, accentAlpha } from '../constants';

const MotionDiv = motion.div;

const FeatureCard = React.memo(({ icon, title, desc, num, index, canHover }) => {
  const [hovered, setHovered] = useState(false);
  const active = canHover && hovered;
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: Math.min(index, 5) * 0.08, ease: EASE_EXPO }}
      onMouseEnter={() => canHover && setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative group rounded-2xl p-6 sm:p-7 lg:p-8 overflow-hidden cursor-default transition-all duration-500 border"
      style={{
        backgroundColor: THEME.bgSecondary,
        borderColor: active ? accentAlpha(30) : ink(0.06),
      }}
    >
      <MotionDiv
        animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.8 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${accentAlpha(8)}, ${accentAlpha(3)}, transparent)` }}
      />
      <div
        className="absolute top-4 right-5 text-[44px] sm:text-[60px] font-black leading-none select-none pointer-events-none"
        style={{ fontFamily: "'Bebas Neue', sans-serif", color: ink(0.05) }}
      >{num}</div>
      <div className="relative z-10">
        <motion.div
          animate={{ backgroundColor: active ? THEME.accent : ink(0.05), color: active ? '#000' : ink(0.5) }}
          transition={{ duration: 0.3 }}
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 sm:mb-7"
        >
          <Icon name={icon} className="text-xl" />
        </motion.div>
        <h3
          className="font-black mb-3 uppercase"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: '0.02em', color: THEME.textStrong }}
        >{title}</h3>
        <p className="leading-relaxed text-sm font-medium" style={{ color: ink(0.4) }}>{desc}</p>
      </div>
    </MotionDiv>
  );
});

export default FeatureCard;