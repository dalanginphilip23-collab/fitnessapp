import { createPortal } from 'react-dom';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

// Shared centered modal shell: portal into <body>, dark blurred backdrop,
// scroll-locked while open. Clicking the backdrop (not the panel) calls
// onClose. Rendered only when `open` is true.
export default function Modal({
  open,
  onClose,
  children,
  className = '',
  maxWidth = 'max-w-md',
  closeOnBackdrop = true,
  zIndex = 200,
}) {
  useLockBodyScroll(open);

  if (!open) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) onClose?.();
  };

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm ${className}`}
      style={{ zIndex }}
      onMouseDown={handleBackdrop}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-[28px] shadow-2xl`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
