import React from 'react';
import Icon from '../../../components/ui/Icon';
import { buildPlansPath, THEME, ink, accentAlpha } from '../constants';

const PricingCard = React.memo(({ plan, navigate, isAuthenticated = false }) => {
  const { popular, planId, ctaLabel, ctaDest, features } = plan;

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate(buildPlansPath({ planId, tab: ctaDest }));
    } else {
      const redirect = buildPlansPath({ planId, tab: ctaDest });
      navigate(`/register?redirect=${encodeURIComponent(redirect)}`);
    }
  };

  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden h-full"
      style={{
        border: popular ? `1px solid ${THEME.accent}` : `1px solid ${ink(0.08)}`,
        boxShadow: popular ? `0 0 60px -10px ${accentAlpha(25)}` : 'none',
      }}
    >
      {popular && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)` }} />
      )}
      <div
        className="p-6 sm:p-7 lg:p-8 flex flex-col grow"
        style={{ backgroundColor: popular ? accentAlpha(8) : THEME.bgSecondary }}
      >
        {popular && (
          <span
            className="self-start mb-5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
            style={{ backgroundColor: THEME.accent, color: '#000' }}
          >
            Most Popular
          </span>
        )}
        <div className="mb-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: ink(0.3) }}>{plan.name}</p>
          <div className="flex items-end gap-1">
            <span
              className="font-black leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.75rem,8vw,4rem)', color: THEME.textStrong }}
            >{plan.price}</span>
            {plan.per && <span className="text-sm font-bold mb-2" style={{ color: ink(0.3) }}>{plan.per}</span>}
          </div>
        </div>
        <div className="h-px my-6" style={{ backgroundColor: ink(0.05) }} />
        <ul className="space-y-3.5 mb-8 grow">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm font-medium">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: accentAlpha(15) }}
              >
                <Icon name="check" className="text-[11px]" />
              </div>
              <span style={{ color: ink(0.55) }}>{f}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleCTA}
          className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={
            popular
              ? { backgroundColor: THEME.accent, color: '#000' }
              : { backgroundColor: ink(0.05), color: ink(0.7), border: `1px solid ${ink(0.1)}` }
          }
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
});

export default PricingCard;