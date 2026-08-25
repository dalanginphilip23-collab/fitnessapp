import { useRef, useState } from "react";
import Icon from "../../../components/ui/Icon";
import SectionLabel from "./SectionLabel";
import Spinner from "./Spinner";
import FullscreenCamera from "./FullscreenCamera";

// "Add a meal" card — visually redesigned to match the target mock
// (two direct-action buttons instead of a tab switcher), but every piece
// of underlying state/behavior (tab, preview, drag/drop, camera, analyze)
// is unchanged from the original component.
export default function UploadSection({ onAnalyze, isAnalyzing }) {
  const fileInputRef = useRef(null);

  const [preview,      setPreview]      = useState(null);
  const [dragOver,     setDragOver]     = useState(false);
  const [compressing,  setCompressing]  = useState(false);
  const [tab,          setTab]          = useState("upload");
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    // Use object URL for instant preview without base64 decode cost
    // Revoke previous if it was a blob URL
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleClear = () => {
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (tab === "camera") setIsCameraOpen(true);
  };

  const handleAnalyzeClick = async () => {
    if (!preview || isAnalyzing || compressing) return;
    setCompressing(true);
    try { await onAnalyze(preview); }
    finally { setCompressing(false); }
  };

  const switchTab = (next) => {
    if (next === tab) return;
    setPreview(null);
    setTab(next);
    if (next === "camera") setIsCameraOpen(true);
  };

  // "Choose from Gallery" button: switch to the upload tab and open the
  // native file picker immediately, so it behaves like a direct action
  // button rather than a passive tab.
  const handleGalleryClick = () => {
    switchTab("upload");
    requestAnimationFrame(() => fileInputRef.current?.click());
  };

  const handleCameraCapture = (photo) => {
    setPreview(photo);
    setIsCameraOpen(false);
  };

  const busy = isAnalyzing || compressing;

  return (
    <div
      className={`bg-(--bg-tertiary) rounded-2xl p-4 sm:p-5 border transition-colors duration-200 ${
        dragOver ? "border-(--accent) shadow-[0_0_20px_var(--accent-bg)]" : "border-(--border-light)"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); switchTab("upload"); handleFile(e.dataTransfer.files[0]); }}
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

      {preview ? (
        <>
          <SectionLabel text="Meal Photo" />
          <div className="relative rounded-xl overflow-hidden border border-(--border-light)">
            <img src={preview} alt="Meal preview" className="w-full object-cover" style={{ maxHeight: 240 }} />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs font-bold transition-all duration-200 touch-manipulation hover:scale-110"
            >✕</button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-(--accent-bg) flex items-center justify-center shrink-0">
            <Icon name="photo_camera" className="text-(--accent) text-2xl" fill={1} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-(--text-primary)">Add a meal</h3>
            <p className="text-xs text-(--text-muted) mt-0.5 leading-snug">
              Upload a photo of your meal and let AI analyze the nutrition.
            </p>
          </div>
        </div>
      )}

      <div className={`flex gap-2 sm:gap-3 ${preview ? "mt-3" : "mt-4"}`}>
        <button
          onClick={() => switchTab("camera")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-(--accent) text-[#131313] transition-all duration-200 touch-manipulation active:scale-[0.98] hover:shadow-lg hover:shadow-(--accent)/20"
        >
          <Icon name="photo_camera" className="text-base" fill={1} />
          Take Photo
        </button>
        <button
          onClick={handleGalleryClick}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold border border-(--accent-border) text-(--accent) bg-(--accent-bg) hover:bg-(--accent) hover:text-[#131313] transition-all duration-200 touch-manipulation active:scale-[0.98]"
        >
          <Icon name="image" className="text-base" fill={1} />
          Choose from Gallery
        </button>
      </div>

      <button
        onClick={handleAnalyzeClick}
        disabled={busy || !preview}
        className={`mt-3 w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 touch-manipulation ${
          busy || !preview
            ? "bg-(--bg-hover) text-(--text-muted) cursor-not-allowed"
            : "bg-(--bg-hover) hover:bg-(--accent-bg) hover:text-(--accent) text-(--text-primary) active:scale-[0.98]"
        }`}
      >
        {compressing ? (
          <span className="flex items-center justify-center gap-2"><Spinner /> Compressing…</span>
        ) : isAnalyzing ? (
          <span className="flex items-center justify-center gap-2"><Spinner /> Analyzing with AI…</span>
        ) : "Analyze Meal"}
      </button>

      {isCameraOpen && (
        <FullscreenCamera
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
}