import { useRef } from 'react';

const OtpInput = ({ value, onChange }) => {
  const inputs = useRef([]);
  const digits = value.split('');

  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      const next = digits.map((d, idx) => (idx === i ? '' : d));
      onChange(next.join(''));
      if (i > 0 && !digits[i]) inputs.current[i - 1]?.focus();
    }
  };

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, idx) => (idx === i ? val : d));
    while (next.length < 6) next.push('');
    onChange(next.join(''));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-between">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          className={`w-full aspect-square max-w-[52px] text-center text-[20px] font-bold rounded-xl border bg-white/5 text-[#e5e2e1] outline-none transition-all duration-200
            ${digits[i]
              ? 'border-[#c7f248]/50 bg-[#c7f248]/[0.04] shadow-[0_0_0_3px_rgba(199,242,72,0.08)]'
              : 'border-white/10 focus:border-[#c7f248]/40 focus:bg-[#c7f248]/[0.04] focus:shadow-[0_0_0_3px_rgba(199,242,72,0.08)]'
            }`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
