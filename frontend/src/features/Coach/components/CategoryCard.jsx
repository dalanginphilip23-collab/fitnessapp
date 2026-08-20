import { CATEGORY_META } from '../constants';

export default function CategoryCard({ categoryKey, onClick }) {
  const { title, subtitle, description, Icon, theme } = CATEGORY_META[categoryKey];
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-6 sm:p-7 rounded-3xl bg-(--bg-hover) border border-(--border-medium) hover:border-(--border-heavy) hover:shadow-(--shadow-lg) hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-5 group"
    >
      <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl ${theme.bgSoft} ${theme.bgSoftHover} flex items-center justify-center transition-colors`}>
        <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${theme.text}`} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-(--text-primary)">{title}</h3>
        <p className={`text-xs sm:text-sm font-semibold ${theme.text} mb-1`}>{subtitle}</p>
        <p className="text-xs sm:text-sm text-(--text-muted) leading-relaxed">{description}</p>
      </div>

      <div className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full ${theme.bgSoft} ${theme.bgSoftHover} flex items-center justify-center transition-colors`}>
        <svg className={`w-4 h-4 ${theme.text} group-hover:translate-x-0.5 transition-transform`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}