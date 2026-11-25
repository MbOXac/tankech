"use client";

import { useState, useRef, useCallback } from "react";
import FallbackImage from "@/components/FallbackImage";
import { ArrowLeftRight } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  sizes?: string;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  alt,
  beforeLabel = "Avant",
  afterLabel = "Après",
  className = "h-72 md:h-96",
  sizes = "(max-width: 768px) 100vw, 50vw",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(98, Math.max(2, pct)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    updateFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPosition((p) => Math.max(2, p - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition((p) => Math.min(98, p + 5));
    }
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={`Comparer avant et après pour ${alt}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      className={`relative isolate select-none overflow-hidden bg-gray-900 cursor-ew-resize touch-none focus:outline-none focus:ring-2 focus:ring-yellow-500 ${className}`}
    >
      {/* After image (full base layer) */}
      <FallbackImage
        src={afterSrc}
        alt={`${alt} — ${afterLabel}`}
        sizes={sizes}
        className="object-cover pointer-events-none"
      />

      {/* Before image (clipped left side) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <FallbackImage
          src={beforeSrc}
          alt={`${alt} — ${beforeLabel}`}
          sizes={sizes}
          className="object-cover"
        />
      </div>

      {/* Labels */}
      <span className="pointer-events-none absolute top-3 left-3 z-20 rounded-lg bg-black/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 z-20 rounded-lg bg-yellow-500 px-2.5 py-1 text-xs font-bold text-gray-950 shadow">
        {afterLabel}
      </span>

      {/* Divider line & circular drag knob */}
      <div
        className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)]"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-yellow-500 text-gray-950 shadow-xl">
          <ArrowLeftRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
