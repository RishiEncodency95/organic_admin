"use client";
/* eslint-disable @next/next/no-img-element -- Authenticated blob URLs cannot use the Next image optimizer. */

import { useEffect, useRef, useState } from "react";
import { Globe2 } from "lucide-react";

/** The loader can change identity on every poll; the asset is fetched only when its stable key changes. */
export function useImageAsset(cacheKey: string, load: (() => Promise<Blob>) | null) {
  const loader = useRef(load);
  useEffect(() => { loader.current = load; }, [load]);
  const [asset, setAsset] = useState<{ key: string; url: string } | null>(null);
  const [failedKey, setFailedKey] = useState("");
  const enabled = !!load;
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let url: string | null = null;
    loader.current?.().then((blob) => {
      if (!alive) return;
      if (!blob.size || !/^image\//.test(blob.type)) throw new Error("Image unavailable");
      url = URL.createObjectURL(blob);
      setAsset({ key: cacheKey, url });
    }).catch(() => { if (alive) setFailedKey(cacheKey); });
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [cacheKey, enabled]);
  return { src: asset?.key === cacheKey ? asset.url : null, failed: failedKey === cacheKey || !enabled, markFailed: () => setFailedKey(cacheKey) };
}

export default function SiteIcon({ cacheKey, load, domain, large = false }: { cacheKey: string; load: (() => Promise<Blob>) | null; domain: string; large?: boolean }) {
  const { src, failed, markFailed } = useImageAsset(cacheKey, load);
  return <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e2e8df] bg-white shadow-sm ${large ? "h-11 w-11" : "h-9 w-9"}`}>
    {src && !failed ? <img src={src} alt={`${domain} favicon`} referrerPolicy="no-referrer" onError={markFailed} className={`${large ? "h-7 w-7" : "h-5 w-5"} object-contain`} /> : <Globe2 size={large ? 21 : 17} className="text-[#9aaa97]" />}
  </span>;
}
