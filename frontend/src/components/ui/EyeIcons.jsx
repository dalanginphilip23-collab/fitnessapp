// Shared eye icons — single source for Login / Register and any password field.
export const EyeIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5C5 19.5 1.5 12 1.5 12a20.86 20.86 0 0 1 4.22-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4.5c7 0 10.5 7.5 10.5 7.5a20.83 20.83 0 0 1-2.42 3.6M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <path d="M1.5 1.5l21 21" />
  </svg>
);
