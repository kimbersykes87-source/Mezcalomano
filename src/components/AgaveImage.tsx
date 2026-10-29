"use client";

/* eslint-disable @next/next/no-img-element -- transparent plant cut-outs from Supabase Storage, sized by CSS */
import { useState } from "react";

/** Brand mark shown when a plant image fails to load. */
const FALLBACK_SRC = "/assets/favicon/app_icon_512.png";

export default function AgaveImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [current, setCurrent] = useState(src || FALLBACK_SRC);
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => {
        if (current !== FALLBACK_SRC) setCurrent(FALLBACK_SRC);
      }}
    />
  );
}
