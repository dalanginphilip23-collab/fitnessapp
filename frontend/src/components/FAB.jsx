import { useState } from 'react';
import Icon from './Icon';

const FAB = ({ onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    calories: '', steps: '', minutes: '', water: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setIsOpen(false);
    setFormData({ calories: '', steps: '', minutes: '', water: '' });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-(--accent) rounded-full shadow-lg shadow-(--accent)/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <Icon name="add" className="text-[#0a0a0a] text-[28px] font-bold" fill={1} />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-(--accent) rounded-full animate-ping opacity-50" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-(--bg-card) border border-(--border-medium) w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[24px] p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-(--bg-card) z-10 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-(--accent-bg) flex items-center justify-center">
                    <Icon name="add" className="text-(--accent) text-[16px]" fill={1} />
                  </div>
                  <h2 className="text-lg font-bold text-(--text-primary)">Log Activity</h2>
                </div>
                <p className="text-[10px] text-(--text-muted) uppercase tracking-wider mt-1 ml-9">Daily Biometric Entry</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-(--bg-hover) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-active) transition-all border-none cursor-pointer"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-(--text-muted) mb-2 block tracking-widest ml-1">Calories Burned</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--accent) transition-colors">local_fire_department</span>
                  <input
                    type="number" required placeholder="e.g. 500"
                    className="w-full bg-(--input-bg) border border-(--input-border) rounded-xl py-3.5 pl-12 pr-4 text-(--text-primary) focus:border-(--accent)/50 focus:bg-(--bg-active) outline-none transition-all placeholder:text-(--input-placeholder)"
                    value={formData.calories}
                    onChange={(e) => setFormData({...formData, calories: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-(--text-muted) mb-2 block tracking-widest ml-1">Steps</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--accent) transition-colors text-[18px]">footprint</span>
                    <input
                      type="number" placeholder="10000"
                      className="w-full bg-(--input-bg) border border-(--input-border) rounded-xl py-3.5 pl-10 pr-4 text-(--text-primary) focus:border-(--accent)/50 outline-none transition-all placeholder:text-(--input-placeholder) text-sm"
                      value={formData.steps}
                      onChange={(e) => setFormData({...formData, steps: e.target.value})}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-(--text-muted) mb-2 block tracking-widest ml-1">Duration</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--accent) transition-colors text-[18px]">timer</span>
                    <input
                      type="number" placeholder="Mins"
                      className="w-full bg-(--input-bg) border border-(--input-border) rounded-xl py-3.5 pl-10 pr-4 text-(--text-primary) focus:border-(--accent)/50 outline-none transition-all placeholder:text-(--input-placeholder) text-sm"
                      value={formData.minutes}
                      onChange={(e) => setFormData({...formData, minutes: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-(--text-muted) mb-2 block tracking-widest ml-1">Water Intake (ml)</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--accent) transition-colors">water_drop</span>
                  <input
                    type="number" placeholder="e.g. 2500"
                    className="w-full bg-(--input-bg) border border-(--input-border) rounded-xl py-3.5 pl-12 pr-4 text-(--text-primary) focus:border-(--accent)/50 outline-none transition-all placeholder:text-(--input-placeholder)"
                    value={formData.water}
                    onChange={(e) => setFormData({...formData, water: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-(--accent) text-[#0a0a0a] font-bold py-4 rounded-xl mt-2 shadow-lg shadow-(--accent)/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                <Icon name="check_circle" className="text-[20px]" fill={1} />
                <span className="text-sm font-black uppercase tracking-wider">Update Dashboard</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FAB;