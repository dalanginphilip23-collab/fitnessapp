export default function DoneCard() {
  return (
    <div className="glass-card w-full max-w-[420px] border border-[#c7f248]/20 rounded-[20px] p-[40px_38px] text-center relative overflow-hidden shadow-[0_0_50px_rgba(199,242,72,0.12)]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c7f248] to-transparent" />
      <div className="w-20 h-20 bg-[#c7f248]/10 border border-[#c7f248]/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-[#c7f248]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="font-['Bebas_Neue',sans-serif] text-[28px] tracking-widest text-[#e5e2e1] mb-2 uppercase">Password Reset</h2>
      <p className="text-[12px] text-[#c4c9b0]/50 leading-relaxed mb-2">
        Your credentials have been updated. Redirecting to login...
      </p>
      <div className="flex gap-1 justify-center mt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#c7f248]/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}
