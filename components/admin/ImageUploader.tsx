"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";

interface ImageUploaderProps {
  label?: string;
  currentUrl?: string | null;
  onChange: (file: File | null, removeCurrent: boolean) => void;
}

export default function ImageUploader({
  label = "Image principale",
  currentUrl,
  onChange,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [hasNew, setHasNew] = useState(false);
  const [removed, setRemoved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    if (file) {
      setPreview(URL.createObjectURL(file));
      setHasNew(true);
      setRemoved(false);
      onChange(file, false);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function cancelNew() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setHasNew(false);
    onChange(null, removed);
  }

  function removeCurrent() {
    setRemoved(true);
    setHasNew(false);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onChange(null, true);
  }

  const showCurrent = !!currentUrl && !removed && !hasNew;
  const showNew = hasNew && !!preview;
  const showEmpty = !showCurrent && !showNew;

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-foreground/80">{label}</p>

      {showCurrent && (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl!}
            alt="Image actuelle"
            className="h-24 w-auto rounded-lg border border-admin-champagne-soft object-contain"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-admin-forest/20 bg-white px-3 py-1 text-xs font-medium text-admin-forest transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-admin-forest/5"
            >
              Remplacer
            </button>
            <button
              type="button"
              onClick={removeCurrent}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-red-100"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

      {showNew && (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview!}
            alt="Aperçu"
            className="h-24 w-auto rounded-lg border border-admin-champagne-soft object-contain"
          />
          <button
            type="button"
            onClick={cancelNew}
            className="rounded-lg border border-admin-champagne-soft bg-white px-3 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-admin-ivory-warm"
          >
            Annuler la sélection
          </button>
        </div>
      )}

      {showEmpty && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border border-dashed border-admin-champagne-soft bg-admin-ivory-warm/60 px-4 py-3 text-sm text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:bg-admin-ivory-warm"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          Choisir une image
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou WebP — 5 Mo maximum</p>
    </div>
  );
}
