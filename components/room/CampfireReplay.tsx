"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ReplayData } from "@/types/socket";

// ISO 639-1 → display name (expand as needed)
const LANG_NAMES: Record<string, string> = {
  af: "Afrikaans", ar: "Arabic",   bn: "Bengali",  cs: "Czech",
  da: "Danish",    de: "German",   el: "Greek",     en: "English",
  es: "Spanish",   fa: "Persian",  fi: "Finnish",   fr: "French",
  gu: "Gujarati",  he: "Hebrew",   hi: "Hindi",     hr: "Croatian",
  hu: "Hungarian", id: "Indonesian",it: "Italian",  ja: "Japanese",
  ko: "Korean",    mr: "Marathi",  ms: "Malay",     nl: "Dutch",
  no: "Norwegian", pa: "Punjabi",  pl: "Polish",    pt: "Portuguese",
  ro: "Romanian",  ru: "Russian",  sk: "Slovak",    sv: "Swedish",
  sw: "Swahili",   ta: "Tamil",    te: "Telugu",    th: "Thai",
  tr: "Turkish",   uk: "Ukrainian",ur: "Urdu",      vi: "Vietnamese",
  zh: "Mandarin",  zu: "Zulu",
};

const langName = (code: string) => LANG_NAMES[code] ?? code.toUpperCase();

/** Draw a rounded rect path (cross-browser polyfill for CanvasRenderingContext2D.roundRect). */
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,      y + h, x,      y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x,      y,     x + r,  y,         r);
  ctx.closePath();
};

/** Wrap text onto canvas, returning the next y position. */
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string, x: number, startY: number, maxWidth: number, lineHeight: number
): number => {
  const words = text.split(" ");
  let line = "";
  let y = startY;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, y);
  return y + lineHeight;
};

interface Props {
  data: ReplayData;
}

export function CampfireReplay({ data }: Props) {
  const router = useRouter();
  const maxVal = Math.max(...data.heatmap, 1);

  /** Generate and download an 800×450 PNG card. */
  const handleDownload = useCallback(() => {
    const W = 800, H = 450;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, W, H);

    // Subtle inner border
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    roundRect(ctx, 24, 24, W - 48, H - 48, 16);
    ctx.stroke();

    // Amber accent bar
    ctx.fillStyle = "#D89B3C";
    ctx.fillRect(48, 52, 48, 2);

    // "DIGITAL CAMPFIRE" header
    ctx.fillStyle = "#D89B3C";
    ctx.font = "bold 10px monospace";
    ctx.letterSpacing = "0.35em";
    ctx.fillText("DIGITAL CAMPFIRE", 48, 80);
    ctx.letterSpacing = "0";

    // Prompt text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px sans-serif";
    wrapText(ctx, `"${data.prompt}"`, 48, 118, W - 96, 30);

    // ACTIVITY label
    const heatY = 210;
    ctx.fillStyle = "#555555";
    ctx.font = "10px monospace";
    ctx.letterSpacing = "0.2em";
    ctx.fillText("ACTIVITY", 48, heatY);
    ctx.letterSpacing = "0";

    // Heatmap bars
    const barW = Math.floor((W - 96 - 14 * 5) / 15);
    const barGap = 5;
    const maxBarH = 55;
    const barsTop = heatY + 14;

    for (let i = 0; i < 15; i++) {
      const ratio = data.heatmap[i] / maxVal;
      const bh = Math.max(4, ratio * maxBarH);
      const bx = 48 + i * (barW + barGap);
      const by = barsTop + (maxBarH - bh);
      ctx.fillStyle = `rgba(216,155,60,${0.25 + ratio * 0.75})`;
      roundRect(ctx, bx, by, barW, bh, 3);
      ctx.fill();
    }

    // Timeline labels
    ctx.fillStyle = "#444444";
    ctx.font = "10px sans-serif";
    ctx.fillText("0:00", 48, barsTop + maxBarH + 16);
    ctx.textAlign = "right";
    ctx.fillText("15:00", W - 48, barsTop + maxBarH + 16);
    ctx.textAlign = "left";

    // Language pills
    const pillY = barsTop + maxBarH + 40;
    ctx.font = "12px sans-serif";
    let pillX = 48;
    const visLangs = data.languages.slice(0, 7);
    for (const lang of visLangs) {
      const label = langName(lang);
      const tw = ctx.measureText(label).width;
      const pw = tw + 22;
      ctx.fillStyle = "#1E1E1E";
      roundRect(ctx, pillX, pillY - 14, pw, 24, 12);
      ctx.fill();
      ctx.fillStyle = "#888888";
      ctx.fillText(label, pillX + 11, pillY + 4);
      pillX += pw + 8;
    }
    if (data.languages.length > 7) {
      const more = `+${data.languages.length - 7} more`;
      ctx.fillStyle = "#444444";
      ctx.fillText(more, pillX, pillY + 4);
    }

    // Stats
    ctx.fillStyle = "#555555";
    ctx.font = "13px sans-serif";
    ctx.fillText(
      `${data.totalMessages} message${data.totalMessages !== 1 ? "s" : ""} · 15 minutes`,
      48,
      pillY + 38
    );

    // Branding watermark
    ctx.fillStyle = "#2A2A2A";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.fillText("digital-campfire.vercel.app", W - 48, H - 36);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "campfire-replay.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [data, maxVal]);

  const handleShare = useCallback(async () => {
    const text = [
      `"${data.prompt}"`,
      `${data.totalMessages} messages in 15 minutes`,
      data.languages.length > 0
        ? `Languages: ${data.languages.map(langName).join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "My Digital Campfire", text });
        return;
      } catch {
        /* User cancelled or share not supported — fall through to download */
      }
    }
    handleDownload();
  }, [data, handleDownload]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm px-6 py-8">
      <div className="w-full max-w-sm rounded-2xl bg-surface border border-white/8 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-7 pb-6 border-b border-white/8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-secondary/50 mb-4">
            Campfire Summary
          </p>
          <p className="text-lg font-semibold text-white leading-snug">
            &ldquo;{data.prompt}&rdquo;
          </p>
        </div>

        {/* Heatmap */}
        <div className="px-6 pt-6 pb-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-secondary/40 mb-4">
            Activity
          </p>
          <div className="flex items-end gap-[3px] h-10">
            {data.heatmap.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded bg-accent transition-none"
                style={{
                  height: `${Math.max(10, (val / maxVal) * 100)}%`,
                  opacity: 0.15 + (val / maxVal) * 0.85,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-secondary/25">0:00</span>
            <span className="text-[10px] text-secondary/25">15:00</span>
          </div>
        </div>

        {/* Languages */}
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {data.languages.slice(0, 6).map((lang) => (
              <span
                key={lang}
                className="text-[11px] px-3 py-1 rounded-full bg-white/5 text-secondary"
              >
                {langName(lang)}
              </span>
            ))}
            {data.languages.length > 6 && (
              <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 text-secondary/40">
                +{data.languages.length - 6} more
              </span>
            )}
          </div>
          <p className="text-xs text-secondary/35">
            {data.totalMessages} message{data.totalMessages !== 1 ? "s" : ""} &middot; 15 minutes
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-white/8 px-6 py-5 flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-secondary hover:text-white hover:bg-surface-secondary transition-colors"
          >
            Share
          </button>
          <button
            onClick={() => router.replace("/lobby")}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-medium text-black hover:brightness-110 transition-all"
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
}