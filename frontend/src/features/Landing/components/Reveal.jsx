import { motion } from 'framer-motion';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

/**
 * Scroll-triggered reveal wrapper for homepage sections.
 * Fades + slides content in the first time it enters the viewport.
 * Renders statically when the user prefers reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className = '',
  ...rest
}) {
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
