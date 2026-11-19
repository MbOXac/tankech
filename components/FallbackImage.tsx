"use client";

import Image from "next/image";
import { useState } from "react";

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function FallbackImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
}: FallbackImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
