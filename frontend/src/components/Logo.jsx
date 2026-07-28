const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeMap = { sm: 7, md: 9, lg: 11 };
  const iconSize = sizeMap[size] || 9;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl shrink-0"
        style={{
          width: iconSize * 4,
          height: iconSize * 4,
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
          boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent)',
        }}
      >
        <svg width={iconSize * 2.2} height={iconSize * 2.2} viewBox="0 0 32 32" fill="none">
          <path d="M16 4 L16 28" stroke="#0a0a0a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M8 12 L16 4 L24 12" stroke="#0a0a0a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 16 L16 12 L20 16" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {showText && (
        <span
          className="font-['Manrope'] font-black tracking-[0.15em] select-none"
          style={{
            fontSize: size === 'lg' ? '18px' : size === 'sm' ? '12px' : '14px',
            color: 'var(--accent)',
          }}
        >
          VITALIS
        </span>
      )}
    </div>
  );
};

export default Logo;