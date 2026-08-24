import Icon from '../../../components/ui/Icon';

export default function DailyActivityCard({ steps = { value: 0, goal: 10000 }, onExpand }) {
  const pct = Math.min(100, Math.round((Number(steps.value) || 0) / (steps.goal || 10000) * 100));
  const size = 52;
  const sw = 5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (pct / 100) * circ;

  // Bar heights Mon-Sun, Fri peak like reference (lime), relative to steps
  const pattern = [0.62, 0.42, 0.55, 0.58, 0.92, 0.68, 0.74];
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sud'];

  return (
    <div className="bg-[#0F0F0F] rounded-[20px] p-4 flex flex-col gap-3 border border-white/5 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-white/80">
            <Icon name="footprint" className="text-[14px]" />
            <span className="text-[11px] font-bold tracking-wide">Step</span>
          </div>
          <div className="text-white font-black text-[22px] leading-none mt-1">{Number(steps.value || 0).toLocaleString()}</div>
          <div className="text-white/50 text-[11px] font-medium">Steps</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={sw} />
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#fff" strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-black">{pct}%</span>
          </div>
          {onExpand && (
            <button type="button" onClick={onExpand} className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
              <Icon name="chevron_right" className="text-[16px]" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-[64px] pt-2">
        {pattern.map((p, i) => {
          const isPeak = i === 4;
          const h = Math.round(p * 52) + 8;
          return (
            <div key={days[i]} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-full max-w-[28px] rounded-full transition-all ${isPeak ? 'bg-[var(--accent)]' : 'bg-white/15'}`} style={{ height: h }} />
              <span className={`text-[10px] leading-none ${isPeak ? 'text-white font-bold' : 'text-white/40 font-medium'}`}>{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
