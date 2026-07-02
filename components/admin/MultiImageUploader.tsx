"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";

export interface ExistingPhoto {
  url: string;
  storagePath: string;
}

interface MultiImageUploaderProps {
  label?: string;
  existingPhotos: ExistingPhoto[];
  removedUrls: string[];
  onRemoveExisting: (url: string) => void;
  onNewFilesChange: (files: File[]) => void;
}

export default function MultiImageUploader({
  label = "Photos supplémentaires",
  existingPhotos,
  removedUrls,
  onRemoveExisting,
  onNewFilesChange,
}: MultiImageUploaderProps) {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilesAdded(e: ChangeEvent<HTMLInputElement>) {
    const added = Array.from(e.target.files ?? []);
    if (added.length === 0) return;
    const newPreviews = added.map((f) => URL.createObjectURL(f));
    const merged = [...newFiles, ...added];
    const mergedPreviews = [...previews, ...newPreviews];
    setNewFiles(merged);
    setPreviews(mergedPreviews);
    onNewFilesChange(merged);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeNew(index: number) {
    URL.revokeObjectURL(previews[index]);
    const updatedFiles = newFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setNewFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onNewFilesChange(updatedFiles);
  }

  const visibleExisting = existingPhotos.filter((p) => !removedUrls.includes(p.url));
  const total = visibleExisting.length + newFiles.length;

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-gray-700">{label}</p>

      {total === 0 ? (
        <p className="mb-2 text-xs text-gray-400">Aucune photo pour le moment.</p>
      ) : (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {/* Photos existantes */}
          {visibleExisting.map((photo) => (
            <div key={photo.url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt=""
                className="aspect-square w-full rounded-md border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveExisting(photo.url)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                aria-label="Supprimer cette photo"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Nouvelles photos (en attente) */}
          {newFiles.map((_, i) => (
            <div key={`new-${i}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previews[i]}
                alt=""
                className="aspect-square w-full rounded-md border border-emerald-300 object-cover"
              />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-white shadow hover:bg-gray-700"
                aria-label="Annuler cette photo"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-100"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Ajouter des photos
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFilesAdded}
        className="hidden"
      />
      <p className="mt-1 text-xs text-gray-400">JPG, PNG ou WebP — 5 Mo par photo</p>
    </div>
  );
}
