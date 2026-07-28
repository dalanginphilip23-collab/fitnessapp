import { useState, useEffect } from 'react';
import Icon from './Icon';

const RadialProgress = ({
  value = 0,
  goal = 100,
  size = 88,
  strokeWidth = 7,
  color = 'var(--accent)',
  trackColor = 'var(--bg-hover)',
  displayValue,
  label,
}) => {
  const safeGoal = goal > 0 ? goal : 1;
  const pct = Math.min(Math.max((value / safeGoal) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const shown = displayValue ?? `${Math.round(pct)}%`;

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={`grad_${color.replace(/[^a-zA-Z]/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-extrabold text-(--text-primary) tracking-tight"
            style={{ fontSize: size * 0.19 }}
          >
            {shown}
          </span>
        </div>
      </div>

      {label && (
        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-(--text-muted)">
          {label}
        </span>
      )}
    </div>
  );
};

export default RadialProgress;