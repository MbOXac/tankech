"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: "tankech/services" | "tankech/projects" | "tankech/chantiers";
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  placeholder?: string;
  compact?: boolean;
}

/**
 * Client-side resize & compress so large phone camera photos upload fast & stay lightweight.
 */
async function compressImage(file: File, maxWidth = 1600): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.size < 250 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        "image/jpeg",
        0.84
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export default function ImageUploader({
  label,
  value,
  onChange,
  folder,
  authFetch,
  placeholder = "/og-image.jpg ou https://...",
  compact = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Veuillez choisir un fichier image (JPG, PNG, WebP).");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const signRes = await authFetch("/api/admin/upload/sign", {
        method: "POST",
        body: JSON.stringify({ folder }),
      });

      const signData = (await signRes.json().catch(() => ({}))) as {
        configured?: boolean;
        cloudName?: string;
        apiKey?: string;
        folder?: string;
        timestamp?: number;
        signature?: string;
        error?: string;
      };

      if (!signRes.ok || !signData.configured) {
        setError(
          signData.error ||
            "Configurez Cloudinary dans .env.local / Vercel pour l'upload automatique, ou collez un lien d'image ci-dessous."
        );
        return;
      }

      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed, file.name);
      formData.append("api_key", signData.apiKey!);
      formData.append("timestamp", String(signData.timestamp!));
      formData.append("folder", signData.folder!);
      formData.append("signature", signData.signature!);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = (await uploadRes.json().catch(() => ({}))) as {
        secure_url?: string;
        error?: { message?: string };
      };

      if (!uploadRes.ok || !uploadData.secure_url) {
        setError(
          uploadData.error?.message || "Échec de l'envoi de l'image."
        );
        return;
      }

      onChange(uploadData.secure_url);
    } catch {
      setError("Erreur réseau lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700">{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-600"
          >
            <X className="h-3 w-3" /> Effacer
          </button>
        )}
      </div>

      {/* Drop zone + thumbnail */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`group relative flex items-center gap-3 rounded-xl border-2 border-dashed p-2.5 cursor-pointer transition ${
          dragOver
            ? "border-yellow-500 bg-yellow-50"
            : "border-gray-200 bg-gray-50/70 hover:border-yellow-400 hover:bg-yellow-50/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {value ? (
          <div
            className={`relative shrink-0 overflow-hidden rounded-lg bg-gray-200 border border-gray-200 ${
              compact ? "h-12 w-16" : "h-16 w-24"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 ${
              compact ? "h-12 w-16" : "h-16 w-24"
            }`}
          >
            <ImageIcon className="h-5 w-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {uploading ? (
            <p className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-700">
              <Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…
            </p>
          ) : (
            <>
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 group-hover:text-yellow-700">
                <Upload className="h-3.5 w-3.5 text-yellow-600" />
                {value ? "Changer la photo" : "Téléverser une photo"}
              </p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                Cliquez ou glissez une image (compressée automatiquement)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Manual URL fallback input */}
      <input
        type="text"
        aria-label={`${label} (URL ou chemin)`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 focus:border-yellow-400 focus:outline-none"
      />

      {error && (
        <p className="flex items-start gap-1.5 text-[11px] text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
