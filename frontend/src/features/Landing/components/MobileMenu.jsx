import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS, EASE_EXPO, THEME, ink } from '../constants';

const MotionDiv = motion.div;
const MotionA = motion.a;

const MobileMenu = React.memo(({ open, onClose, navigate, canHover }) => (
  <AnimatePresence>
    {open && (
      <MotionDiv
        initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
        exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
        transition={{ duration: 0.4, ease: EASE_EXPO }}
        className="lg:hidden fixed inset-0 z-99 flex flex-col pt-24 overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-menu, #ffffff)' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col px-6 sm:px-8 pt-8 gap-1">
          {NAV_LINKS.map(({ href, label }, i) => (
            <MotionA
              key={href}
              href={href}
              onClick={onClose}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: EASE_EXPO }}
              className="text-[15vw] xs:text-6xl sm:text-5xl font-black uppercase tracking-tighter transition-colors py-3 border-b"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: ink(0.2), borderColor: ink(0.05) }}
              onMouseEnter={e => { if (canHover) e.currentTarget.style.color = THEME.accent; }}
              onMouseLeave={e => { e.currentTarget.style.color = ink(0.2); }}
            >{label}</MotionA>
          ))}
        </div>
        <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
          className="px-6 sm:px-8 mt-auto pb-12 flex flex-col gap-3"
        >
          <button
            type="button"
            onClick={() => { navigate('/login'); onClose(); }}
            className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all"
            style={{ color: ink(0.5), borderColor: ink(0.1) }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { navigate('/register'); onClose(); }}
            className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all"
            style={{ backgroundColor: THEME.accent, color: '#0a1000' }}
          >
            Join the Lab
          </button>
        </MotionDiv>
      </MotionDiv>
    )}
  </AnimatePresence>
));

export default MobileMenu;