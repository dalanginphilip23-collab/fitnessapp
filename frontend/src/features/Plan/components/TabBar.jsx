import Icon from '../../../components/ui/Icon';
import { TABS } from '../constants';

export default function TabBar({ active, onChange, enrolledCount }) {
  return (
    <div
      className="flex gap-1 rounded-xl p-1 w-full overflow-x-auto mb-6 sm:mb-10 border"
      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)', scrollbarWidth: 'none' }}
    >
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="relative flex flex-1 min-w-0 whitespace-nowrap items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all"
          style={{
            background: active === tab.id ? 'var(--accent)' : 'transparent',
            color:      active === tab.id ? '#161f00'       : 'var(--text-muted)',
          }}
        >
          <Icon name={tab.icon} className="text-[14px] sm:text-[16px] flex-shrink-0" fill={active === tab.id ? 1 : 0} />
          <span className="truncate">{tab.label}</span>
          {tab.id === 'my-plans' && enrolledCount > 0 && (
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: active === tab.id ? 'rgba(0,0,0,0.20)' : 'var(--accent-bg)',
                color:      active === tab.id ? '#161f00'           : 'var(--accent)',
              }}
            >
              {enrolledCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}