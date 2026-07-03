// components/PersonalInfoForm.jsx
import React from 'react';

/**
 * PersonalInfoForm
 *
 * Theme-aware version:
 * - All hardcoded dark colors (bg-[#141414], text-white, border-white/X)
 *   replaced with CSS variables from themes.css so the card correctly
 *   flips between dark-theme / light-theme.
 * - Accent color (#c7f248) intentionally left hardcoded — it stays the
 *   same lime-green in both themes per product decision.
 *
 * Props:
 *   formData      — { fullName, email, contact, bio }
 *   isEditing     — boolean
 *   onInputChange — (e, fieldKey) => void
 *   onToggleEdit  — () => void
 */

const FieldLabel = ({ children, locked = false }) => (
  <label className="flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">
    {children}
    {locked && (
      <span className="text-[8px] font-bold tracking-[0.08em] bg-[var(--bg-hover)] border border-[var(--border-light)] text-[var(--text-disabled)] px-1.5 py-px rounded">
        Locked
      </span>
    )}
  </label>
);

const fieldBase =
  'w-full rounded-lg px-3 py-2.5 text-[12px] font-medium outline-none transition-all font-sans';

const editableClass =
  `${fieldBase} bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)]
   focus:border-[#c7f248]/50 focus:bg-[#c7f248]/[0.03] focus:text-[var(--text-primary)]
   placeholder:text-[var(--text-disabled)]`;

const lockedClass =
  `${fieldBase} bg-transparent border border-[var(--border-light)] text-[var(--text-secondary)] cursor-default select-none`;

const PersonalInfoForm = ({ formData, isEditing, onInputChange, onToggleEdit }) => {
  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl p-6">
      {/* Card header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[9px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">
          Personal information
        </p>
        <button
          onClick={onToggleEdit}
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
            border rounded-lg px-3 py-1.5 transition-all
            ${isEditing
              ? 'border-[#c7f248]/30 bg-[#c7f248]/8 text-[#c7f248]'
              : 'border-[var(--border-medium)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:border-[var(--border-heavy)] hover:text-[var(--text-primary)]'
            }`}
        >
          <span className="material-symbols-outlined text-[13px]">
            {isEditing ? 'check' : 'edit'}
          </span>
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {/* Full name */}
        <div className="flex flex-col gap-2">
          <FieldLabel>Full name</FieldLabel>
          <input
            className={isEditing ? editableClass : lockedClass}
            type="text"
            value={formData.fullName}
            onChange={(e) => onInputChange(e, 'fullName')}
            readOnly={!isEditing}
          />
        </div>

        {/* Email — always locked */}
        <div className="flex flex-col gap-2">
          <FieldLabel locked>Clinical email</FieldLabel>
          <input
            className={lockedClass}
            type="email"
            value={formData.email}
            readOnly
          />
        </div>

        {/* Emergency contact — full width */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <FieldLabel>Emergency contact</FieldLabel>
          <input
            className={isEditing ? editableClass : lockedClass}
            type="text"
            value={formData.contact}
            onChange={(e) => onInputChange(e, 'contact')}
            readOnly={!isEditing}
          />
        </div>

        {/* Bio — full width */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <FieldLabel>Medical biography</FieldLabel>
          <textarea
            className={`${isEditing ? editableClass : lockedClass} resize-none`}
            rows={3}
            value={formData.bio}
            onChange={(e) => onInputChange(e, 'bio')}
            readOnly={!isEditing}
          />
        </div>
      </div>
    </section>
  );
};

export default PersonalInfoForm;