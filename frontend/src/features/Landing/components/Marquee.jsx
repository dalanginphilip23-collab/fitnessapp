import React from 'react';
import { MARQUEE_LOOP, ink, accentAlpha, THEME } from '../constants';

const Marquee = React.memo(() => (
  <div
    className="relative overflow-hidden py-5 border-y"
    style={{ borderColor: ink(0.05), backgroundColor: THEME.bgMarquee }}
  >
    <div className="flex animate-marquee whitespace-nowrap gap-0">
      {MARQUEE_LOOP.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-6 px-8">
          <span className="text-[11px] font-black uppercase tracking-[0.35em]" style={{ color: ink(0.25) }}>{item}</span>
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: THEME.accent, boxShadow: `0 0 6px ${accentAlpha(60)}` }}
          />
        </span>
      ))}
    </div>
  </div>
));

export default Marquee;