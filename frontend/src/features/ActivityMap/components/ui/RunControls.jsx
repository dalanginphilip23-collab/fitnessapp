import React from 'react';

const RunControls = ({ isRecording, hasPaused, metricsTime, onStart, onPauseResume, onFinish }) => (
  <div
    className="fixed md:absolute z-[1000] left-0 right-0 flex justify-center px-4"
    style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
  >
    {!isRecording && !hasPaused && metricsTime === 0 ? (
      <button
        onClick={onStart}
        className="bg-[var(--accent)] text-black px-8 sm:px-10 md:px-12 py-3 sm:py-4 rounded-full font-black uppercase italic tracking-tighter
          hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(209,253,82,0.25)] text-sm sm:text-base"
      >
        Start Activity
      </button>
    ) : (
      <div className="flex items-center gap-2 sm:gap-3 bg-[var(--bg-tertiary)]/90 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-[var(--border-medium)] shadow-2xl">
        <button
          onClick={onPauseResume}
          className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[var(--bg-hover)] flex items-center justify-center hover:bg-[var(--bg-active)] active:scale-95 transition-all"
        >
          <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-primary)]">
            {isRecording ? 'PAUSE' : 'RESUME'}
          </span>
        </button>
        <button
          onClick={onFinish}
          className="bg-red-500/20 text-red-400 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-bold uppercase text-[9px] sm:text-[10px] tracking-widest hover:bg-red-500 hover:text-white active:scale-95 transition-all"
        >
          Finish
        </button>
      </div>
    )}
  </div>
);

export default RunControls;