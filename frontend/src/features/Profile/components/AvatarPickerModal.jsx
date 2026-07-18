// components/AvatarPickerModal.jsx
import React from 'react';
import { Icon } from '../../../components';
import { DEFAULT_AVATARS, getAvatarUrl } from '../utils/avatar';

const AvatarPickerModal = ({
  avatarSrc,
  uploadPreview,
  fileInputRef,
  onClose,
  onSelectPreset,
  onFileChange,
}) => {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="bg-[var(--bg-card)] border border-[var(--border-light)] p-8 rounded-[var(--card-radius-md)] shadow-2xl relative z-10 max-w-sm w-full"
        style={{ animation: 'fadeIn 0.2s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-['Manrope'] font-black text-[var(--text-primary)] uppercase tracking-tighter">
            Choose Avatar
          </h3>
          <button onClick={onClose}>
            <Icon name="close" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-lg" />
          </button>
        </div>

        {/* Preset grid */}
        <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-4">
          Default Characters
        </p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {DEFAULT_AVATARS.map(av => {
            const url = getAvatarUrl(av.seed);
            const isActive = avatarSrc === url;
            return (
              <button
                key={av.id}
                onClick={() => onSelectPreset(av.seed)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                  isActive
                    ? 'border-[#62aa1a] shadow-[0_0_12px_#62aa1a40]'
                    : 'border-[var(--border-medium)] hover:border-[#62aa1a]/50'
                }`}>
                  <img src={url} alt={av.label} className="w-full h-full object-cover" />
                </div>
                <span className={`text-[8px] uppercase tracking-widest font-bold transition-colors ${
                  isActive ? 'text-[#62aa1a]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                }`}>
                  {av.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Upload */}
        <div className="border-t border-[var(--border-light)] pt-5">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-4">
            Custom Upload
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 border border-dashed border-[var(--border-medium)] hover:border-[#62aa1a]/50 rounded-xl flex items-center justify-center gap-3 transition-all group"
          >
            <Icon name="upload" className="text-[var(--text-muted)] group-hover:text-[#62aa1a] transition-colors text-lg" />
            <span className="text-[10px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] uppercase tracking-widest transition-colors">
              Upload Photo
            </span>
          </button>
          {uploadPreview && (
            <div className="mt-4 flex items-center gap-3 bg-[var(--bg-primary)] p-3 rounded-xl border border-[#62aa1a]/20">
              <img
                src={uploadPreview}
                alt="Preview"
                className="w-10 h-10 rounded-full object-cover border border-[#62aa1a]/40"
              />
              <span className="text-[10px] text-[#62aa1a] font-bold uppercase tracking-widest">
                Custom photo selected
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarPickerModal;