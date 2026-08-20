export default function SectionLabel({ text }) {
  return (
    <p className="text-[10px] sm:text-xs font-semibold text-(--accent) uppercase tracking-widest mb-3 sm:mb-4">
      {text}
    </p>
  );
}