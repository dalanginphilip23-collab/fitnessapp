import { toPng } from 'html-to-image';

// ─── Share-card image generation + Web Share / download ─────────────────────
// Captures a hidden ShareCard DOM node (Leaflet map + stats) to a PNG, then
// hands it to the native share sheet (WhatsApp / Facebook / Email / save) or
// falls back to a direct download when the Web Share API / files aren't
// available (e.g. desktop Safari, insecure contexts).

export async function captureShareImage(node, { pixelRatio = 2 } = {}) {
  if (!node) throw new Error('Share card not rendered');

  const dataUrl = await toPng(node, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: '#121212',
  });

  // dataURL -> Blob so we can build a File for the share API
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return { dataUrl, blob };
}

export async function shareOrDownload({ blob, filename, title, fallbackName }) {
  const file = new File([blob], filename, { type: 'image/png' });

  // Native share with the image attached (mobile: WhatsApp/FB/Email/etc.)
  const canShareFiles =
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] });

  if (canShareFiles) {
    try {
      await navigator.share({ files: [file], title: title || 'My activity' });
      return { method: 'share' };
    } catch (err) {
      // AbortError = user cancelled — not a failure
      if (err && err.name === 'AbortError') return { method: 'cancelled' };
      // Otherwise fall through to download
    }
  }

  return downloadBlob(blob, fallbackName || filename);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return { method: 'download' };
}

export function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers / non-secure contexts
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return Promise.resolve();
}
