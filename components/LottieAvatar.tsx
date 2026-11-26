"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";

// Same-origin runtime: the default CDN is blocked by this app's Content Security Policy.
setWasmUrl('/wasm/dotlottie-player.wasm');

const AVATAR_SRC = "/avatar-lottie.lottie";

// Downloaded once and shared by every avatar. Passing `src` made each DotLottieReact fetch
// the file itself, and any unmount mid-download (StrictMode, navigation, table re-render)
// logged "Failed to load animation data ... AbortError".
let avatarData: Promise<ArrayBuffer | null> | null = null;
const loadAvatarData = () => {
  if (!avatarData) {
    avatarData = fetch(AVATAR_SRC)
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .catch(() => null)
      .then((data) => {
        if (!data) avatarData = null; // try again next time
        return data;
      });
  }
  return avatarData;
};

export default function LottieAvatar({ style }: { style?: CSSProperties }) {
  const [data, setData] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    let active = true;
    // DotLottie reads (and may transfer) the buffer, so each player keeps its own copy.
    loadAvatarData().then((buf) => active && setData(buf ? buf.slice(0) : null));
    return () => {
      active = false;
    };
  }, []);

  if (!data) return <div style={style} />;
  return <DotLottieReact data={data} loop autoplay style={style} />;
}
