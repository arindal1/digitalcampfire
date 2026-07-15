"use client";
import { useState, type KeyboardEvent } from "react";

interface Props { onSend: (content: string) => void }

export function MessageInput({ onSend }: Props) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="flex gap-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, 300))}
        onKeyDown={onKeyDown}
        placeholder="Say something…"
        className="flex-1 bg-surface-secondary border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-accent text-sm transition-shadow"
      />
      <button
        onClick={submit}
        disabled={!value.trim()}
        className="bg-accent text-black font-medium rounded-xl px-5 py-3 hover:brightness-110 disabled:opacity-40 transition-all text-sm"
      >
        Send
      </button>
    </div>
  );
}