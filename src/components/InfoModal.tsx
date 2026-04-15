import { useEffect } from "react";

type InfoModalProps = {
  open: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onClose: () => void;
};

/** Simple information dialog (success / notice) — white panel like classic admin UIs. */
export default function InfoModal({ open, title, message, actionLabel = "OK", onClose }: InfoModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55" aria-hidden onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        className="relative z-10 w-full max-w-md rounded border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 id="info-modal-title" className="text-base font-normal lowercase text-slate-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="px-4 py-6 text-center text-slate-700">{message}</p>
        <div className="flex justify-end border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
