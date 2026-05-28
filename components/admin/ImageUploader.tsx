"use client";

import { useState, useRef, useCallback } from "react";
import { uploadImage, validateImage, isCloudinaryConfigured } from "@/lib/image-service";

// ─── Cover Uploader ──────────────────────────────────────────────────────────
// Handles a single cover image: drag-and-drop, click-to-select,
// real progress bar (via XHR), hover overlay to swap/remove.

interface CoverUploaderProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
}

export function CoverUploader({ imageUrl, onChange }: CoverUploaderProps) {
  const [dragging,   setDragging]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [error,      setError]      = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const err = validateImage(file);
    if (err) { setError(err); return; }
    setUploading(true);
    setError("");
    setProgress(0);
    try {
      const result = await uploadImage(file, setProgress);
      onChange(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onChange]);

  if (!isCloudinaryConfigured()) {
    return (
      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <span className="text-amber-400 text-lg leading-none mt-0.5" aria-hidden>⚠</span>
        <p className="text-amber-400/80 text-xs leading-relaxed">
          Configure <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> e{" "}
          <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> para habilitar o upload.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone */}
      <div
        className={`relative rounded-xl overflow-hidden border-2 border-dashed transition-colors ${
          dragging   ? "border-white/40 bg-white/[0.06]"   : "border-white/[0.1] bg-white/[0.02]"
        }`}
        style={{ aspectRatio: "16/9" }}
        onDragOver={(e)  => { e.preventDefault(); setDragging(true);  }}
        onDragLeave={()  => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {uploading ? (
          /* ── Uploading ── */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0c0c0c]">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" aria-hidden />
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-36 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white/35 text-xs">{progress}%</span>
            </div>
          </div>

        ) : imageUrl ? (
          /* ── Image preview with hover actions ── */
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Imagem de capa"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 hover:bg-black/55 transition-colors group">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-white text-black text-xs font-bold rounded-sm hover:bg-white/90 active:scale-[0.97]"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold rounded-sm active:scale-[0.97]"
              >
                Remover
              </button>
            </div>
          </>

        ) : (
          /* ── Empty drop zone ── */
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-white/[0.03] transition-colors"
          >
            <span className="text-3xl opacity-20" aria-hidden>📷</span>
            <span className="text-white/30 text-xs text-center px-6 leading-relaxed">
              Arraste a imagem de capa aqui<br />ou clique para selecionar
            </span>
            <span className="text-white/15 text-[10px]">JPEG, PNG, WebP · máx 10 MB</span>
          </button>
        )}
      </div>

      {error && <p role="alert" className="text-red-400 text-xs">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Gallery Uploader ────────────────────────────────────────────────────────
// Grid of thumbnails + "+" add button. Max MAX_GALLERY images.
// Each thumbnail has a hover × button to remove it.

const MAX_GALLERY = 8;

interface GalleryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function GalleryUploader({ images, onChange }: GalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const err = validateImage(file);
    if (err) { setError(err); return; }
    setUploading(true);
    setError("");
    try {
      const result = await uploadImage(file);
      onChange([...images, result.url]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }, [images, onChange]);

  if (!isCloudinaryConfigured()) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2">
        {images.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative aspect-square rounded-lg overflow-hidden bg-white/[0.04] group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              aria-label={`Remover foto ${i + 1}`}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all"
            >
              ✕
            </button>
          </div>
        ))}

        {images.length < MAX_GALLERY && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Adicionar foto à galeria"
            className="aspect-square rounded-lg border-2 border-dashed border-white/[0.1] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-wait"
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" aria-hidden />
            ) : (
              <span className="text-white/25 text-xl leading-none" aria-hidden>+</span>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        {error
          ? <p role="alert" className="text-red-400 text-xs">{error}</p>
          : <span />
        }
        {images.length > 0 && (
          <span className="text-white/20 text-[10px]">
            {images.length}/{MAX_GALLERY} foto{images.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
