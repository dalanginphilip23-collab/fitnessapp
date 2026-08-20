export default function DoctorCard({ doctor, theme, onSelect }) {
  return (
    <div
      onClick={() => onSelect(doctor)}
      className="p-4 sm:p-6 rounded-3xl bg-(--bg-hover) border border-(--border-medium) hover:border-(--border-heavy) hover:shadow-(--shadow-lg) hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col items-center text-center group"
    >
      <div className="relative mb-3 sm:mb-4">
        <img src={doctor.avatar} alt={doctor.name} className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-(--bg-primary) ring-2 ${theme.ring} group-hover:ring-4 transition-all`} />
        <div className={`absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 ${theme.dot} rounded-full border-4 border-(--bg-primary)`} />
      </div>

      <h4 className="text-base sm:text-lg font-bold text-(--text-primary) mb-1">{doctor.name}</h4>
      <p className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${theme.text} mb-2`}>{doctor.prof}</p>

      <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${theme.chipBg} ${theme.chipText} border ${theme.chipBorder}`}>
          AI Specialist
        </span>
        <span className="px-2.5 py-1 bg-(--bg-active) border border-(--border-light) rounded-full text-[10px] text-(--text-muted) italic">
          {doctor.personality}
        </span>
      </div>

      <div className="w-full border-t border-(--border-light) pt-3 sm:pt-4 mt-1 flex flex-col gap-1.5 sm:gap-2 text-left">
        <div className="flex justify-between text-[10px] sm:text-[11px] text-(--text-secondary) uppercase tracking-wide">
          <span><strong className="text-(--text-primary)">Age:</strong> {doctor.age}</span>
          <span><strong className="text-(--text-primary)">Gender:</strong> {doctor.gender}</span>
        </div>
        <div className="text-[10px] sm:text-[11px] text-(--text-secondary) uppercase tracking-wide">
          <strong className="text-(--text-primary)">Experience:</strong> {doctor.experience}
        </div>
        <p className={`text-[11px] sm:text-xs text-(--text-muted) italic mt-1 sm:mt-2 leading-relaxed border-l-2 ${theme.chipBorder} pl-2`}>
          "{doctor.bio}"
        </p>
      </div>

      <span className={`mt-4 inline-flex items-center gap-1 text-xs font-bold ${theme.text}`}>
        Start Consultation
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </div>
  );
}