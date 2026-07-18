// components/AvatarSection.jsx
import React, { useState } from 'react';
import { DEFAULT_AVATARS, getAvatarUrl } from '../utils/avatar';

const AvatarSection = ({
  avatarSrc,
  initials = '?',
  uploadPreview,
  fileInputRef,
  onSelectPreset,
  onFileChange,
  onRemove,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl p-4 sm:p-6">
      {/* Section label */}
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--text-muted)] mb-4 sm:mb-5">
        Avatar
      </p>

      {/* Avatar + actions row */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Avatar circle */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden border-2 border-[#62aa1a]/20 bg-[var(--surface-active)] flex items-center justify-center">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[20px] sm:text-[22px] font-black text-[#62aa1a] font-['Manrope']">
                {initials}
              </span>
            )}
          </div>

          {/* Edit pencil badge */}
          <button
            onClick={() => setPickerOpen(v => !v)}
            aria-label="Edit avatar"
            className="absolute bottom-0 right-0 w-6 h-6 bg-[#62aa1a] rounded-full flex items-center justify-center border-2 border-[var(--bg-card)] transition-transform hover:scale-110 active:scale-95"
          >
            <span className="material-symbols-outlined text-[11px] text-[#1a2800]">edit</span>
          </button>
        </div>

        {/* Info + quick actions */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--text-primary)] truncate">Profile photo</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">JPG or PNG · max 5 MB</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setPickerOpen(v => !v)}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                bg-[var(--bg-hover)] hover:bg-[var(--surface-hover)] border border-[var(--border-medium)] hover:border-[var(--border-heavy)]
                text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 sm:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[13px]">grid_view</span>
              Choose
            </button>
            {avatarSrc && (
              <button
                onClick={onRemove}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                  bg-[var(--bg-hover)] hover:bg-red-500/10 border border-[var(--border-medium)] hover:border-red-500/20
                  text-[var(--text-secondary)] hover:text-red-400 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[13px]">delete</span>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline picker panel */}
      {pickerOpen && (
        <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-[var(--border-light)]">
          {/* Preset grid */}
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--text-muted)] mb-3">
            Default characters
          </p>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {DEFAULT_AVATARS.map((av) => {
              const url = getAvatarUrl(av.seed);
              const isActive = avatarSrc === url;
              return (
                <button
                  key={av.id}
                  onClick={() => {
                    onSelectPreset(av.seed);
                    setPickerOpen(false);
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 transition-all ${
                      isActive
                        ? 'border-[#62aa1a] shadow-[0_0_0_3px_rgba(199,242,72,0.12)]'
                        : 'border-[var(--border-medium)] group-hover:border-[#62aa1a]/40'
                    }`}
                  >
                    <img src={url} alt={av.label} className="w-full h-full object-cover" />
                  </div>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-widest transition-colors ${
                      isActive ? 'text-[#62aa1a]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {av.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Upload zone */}
          <div className="mt-4">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--text-muted)] mb-3">
              Custom upload
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onFileChange(e);
                setPickerOpen(false);
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border border-dashed border-[var(--border-medium)] hover:border-[#62aa1a]/40
                rounded-xl flex items-center justify-center gap-2.5 transition-all group
                hover:bg-[#62aa1a]/[0.03]"
            >
              <span className="material-symbols-outlined text-[16px] text-[var(--text-muted)] group-hover:text-[#62aa1a] transition-colors">
                upload
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                Upload photo
              </span>
            </button>

            {uploadPreview && (
              <div className="mt-3 flex items-center gap-3 bg-[var(--bg-primary)] px-3 py-2.5 rounded-xl border border-[#62aa1a]/15">
                <img
                  src={uploadPreview}
                  alt="Upload preview"
                  className="w-8 h-8 rounded-full object-cover border border-[#62aa1a]/30 flex-shrink-0"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#62aa1a] truncate">
                  Custom photo ready
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSection;