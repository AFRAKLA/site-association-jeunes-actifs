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
      <p className="mb-1.5 text-sm font-medium text-gray-700">{label}</p>

      {showCurrent && (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl!}
            alt="Image actuelle"
            className="h-24 w-auto rounded-md border border-gray-200 object-contain"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Remplacer
            </button>
            <button
              type="button"
              onClick={removeCurrent}
              className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
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
            className="h-24 w-auto rounded-md border border-gray-200 object-contain"
          />
          <button
            type="button"
            onClick={cancelNew}
            className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50"
          >
            Annuler la sélection
          </button>
        </div>
      )}

      {showEmpty && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-100"
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
      <p className="mt-1 text-xs text-gray-400">JPG, PNG ou WebP — 5 Mo maximum</p>
    </div>
  );
}
