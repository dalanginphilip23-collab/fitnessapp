import { useState, useEffect } from 'react';

const useCanHover = () => {
  const [canHover, setCanHover] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : true
  );
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handler = (e) => setCanHover(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return canHover;
};

export default useCanHover;