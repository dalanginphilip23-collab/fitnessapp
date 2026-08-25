// Shared spinner — replaces 9+ inline border-2 animate-spin duplicates.
export default function Spinner({ size = 14, className = '', color = 'currentColor' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: `${color}22`,
        borderTopColor: color,
      }}
    />
  );
}
