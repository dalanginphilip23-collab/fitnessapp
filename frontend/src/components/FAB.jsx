import { useState } from 'react';

const FAB = ({ onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    calories: '',
    steps: '',
    minutes: '',
    water: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setIsOpen(false);
    setFormData({ calories: '', steps: '', minutes: '', water: '' });
  };

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-[var(--accent)] rounded-full shadow-lg shadow-[var(--accent)]/20 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-50"
      >
        <span className="material-symbols-outlined text-[#131313] text-[32px] font-bold">add</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-medium)] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[28px] p-6 md:p-8 shadow-2xl relative"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-[var(--bg-card)] z-10 pb-2">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Log Activity</h2>
                <p className="text-[10px] md:text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Daily Biometric Entry</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">

              {/* Calories */}
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-2 block tracking-widest ml-1">Calories Burned</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors">
                    local_fire_department
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-[var(--text-primary)] focus:border-[var(--accent)]/50 focus:bg-[var(--bg-active)] outline-none transition-all placeholder:text-[var(--input-placeholder)]"
                    value={formData.calories}
                    onChange={(e) => setFormData({...formData, calories: e.target.value})}
                  />
                </div>
              </div>

              {/* Steps & Duration row */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-2 block tracking-widest ml-1">Steps</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors text-[18px] md:text-[20px]">
                      footprint
                    </span>
                    <input
                      type="number"
                      placeholder="10000"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl py-3.5 md:py-4 pl-10 md:pl-11 pr-4 text-[var(--text-primary)] focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--input-placeholder)] text-sm md:text-base"
                      value={formData.steps}
                      onChange={(e) => setFormData({...formData, steps: e.target.value})}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-2 block tracking-widest ml-1">Duration</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors text-[18px] md:text-[20px]">
                      timer
                    </span>
                    <input
                      type="number"
                      placeholder="Mins"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl py-3.5 md:py-4 pl-10 md:pl-11 pr-4 text-[var(--text-primary)] focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--input-placeholder)] text-sm md:text-base"
                      value={formData.minutes}
                      onChange={(e) => setFormData({...formData, minutes: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Water */}
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-2 block tracking-widest ml-1">Water Intake (ml)</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors text-[20px]">
                    water_drop
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-[var(--text-primary)] focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--input-placeholder)]"
                    value={formData.water}
                    onChange={(e) => setFormData({...formData, water: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--accent)] text-[#131313] font-bold py-4 md:py-5 rounded-2xl mt-2 md:mt-4 hover:shadow-[0_0_20px_var(--accent)/20] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined font-bold text-[20px]">check_circle</span>
                <span className="text-sm md:text-base">Update Vitalis Dashboard</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FAB;