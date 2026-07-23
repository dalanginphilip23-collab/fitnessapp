import React from 'react';
import { STEPS } from '../constants/steps';

const StepBar = ({ current }) => (
  <div className="flex items-center gap-2 mb-8">
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300
              ${done ? 'bg-[#c7f248] text-[#161f00]' : ''}
              ${active ? 'bg-[#c7f248]/15 border border-[#c7f248]/50 text-[#c7f248]' : ''}
              ${!done && !active ? 'bg-white/5 border border-white/10 text-white/20' : ''}
            `}>
              {done ? (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-[9px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300
              ${active ? 'text-[#c7f248]' : done ? 'text-[#c7f248]/50' : 'text-white/15'}
            `}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px transition-colors duration-500 ${i < current ? 'bg-[#c7f248]/30' : 'bg-white/5'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default StepBar;
