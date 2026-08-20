import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/ui/Icon';
import { THEME, ink, accentAlpha } from '../constants';

const HorizontalSlider = React.memo(({ items, renderItem, itemWidth = 'w-[80vw] sm:w-[340px]', canHover }) => {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const itemWidthRef = useRef(0);
  const total = items.length;

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(total - 1, i + 1));

  useEffect(() => {
    if (!trackRef.current) return;
    const el = trackRef.current.children[index];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, [index]);


  useEffect(() => {
    const measure = () => {
      itemWidthRef.current = trackRef.current?.children?.[0]?.offsetWidth ?? 0;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [items]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const w = itemWidthRef.current + 16;
          if (w) setIndex(Math.round(el.scrollLeft / w));
        }}
      >
        {items.map((item, i) => (
          <div key={i} className={`${itemWidth} shrink-0 snap-start`}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {total > 1 && (
        <div className="flex items-center justify-between mt-5">
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === index ? '20px' : '6px',
                  height: '6px',
                  backgroundColor: i === index ? THEME.accent : ink(0.2),
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prev}
              disabled={index === 0}
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ borderColor: ink(0.1), color: ink(0.4) }}
              onMouseEnter={e => { if (canHover && index !== 0) { e.currentTarget.style.borderColor = accentAlpha(40); e.currentTarget.style.color = THEME.accent; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ink(0.1); e.currentTarget.style.color = ink(0.4); }}
            >
              <Icon name="chevron_left" className="text-lg" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={next}
              disabled={index === total - 1}
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ borderColor: ink(0.1), color: ink(0.4) }}
              onMouseEnter={e => { if (canHover && index !== total - 1) { e.currentTarget.style.borderColor = accentAlpha(40); e.currentTarget.style.color = THEME.accent; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ink(0.1); e.currentTarget.style.color = ink(0.4); }}
            >
              <Icon name="chevron_right" className="text-lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default HorizontalSlider;