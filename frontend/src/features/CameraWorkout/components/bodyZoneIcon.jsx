const ZONE_PATHS = {
  chest:     ['torsoTop'],
  shoulders: ['torsoTop', 'armsTop'],
  arms:      ['armsTop', 'armsBottom'],
  core:      ['torsoBottom'],
  back:      ['torsoTop', 'torsoBottom'],
  legs:      ['legs'],
  full:      ['torsoTop', 'torsoBottom', 'armsTop', 'armsBottom', 'legs'],
};

export default function BodyZoneIcon({ zone = 'full', size = 44 }) {
  const active = new Set(ZONE_PATHS[zone] ?? []);
  const dim = 'var(--text-disabled)';
  const hi = 'var(--text-primary)';

  const fill = (key) => (active.has(key) ? hi : dim);

  return (
    <svg width={size} height={size} viewBox="0 0 40 48" fill="none">
      {/* head */}
      <circle cx="20" cy="6" r="5" fill={dim} />
      {/* torso top (chest/shoulders) */}
      <rect x="12" y="13" width="16" height="10" rx="3" fill={fill('torsoTop')} />
      {/* torso bottom (core) */}
      <rect x="13" y="23" width="14" height="9" rx="3" fill={fill('torsoBottom')} />
      {/* arms upper */}
      <rect x="4"  y="14" width="6" height="10" rx="3" fill={fill('armsTop')} />
      <rect x="30" y="14" width="6" height="10" rx="3" fill={fill('armsTop')} />
      {/* arms lower */}
      <rect x="3"  y="24" width="5" height="10" rx="2.5" fill={fill('armsBottom')} />
      <rect x="32" y="24" width="5" height="10" rx="2.5" fill={fill('armsBottom')} />
      {/* legs */}
      <rect x="13" y="33" width="6" height="14" rx="3" fill={fill('legs')} />
      <rect x="21" y="33" width="6" height="14" rx="3" fill={fill('legs')} />
    </svg>
  );
}