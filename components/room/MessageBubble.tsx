import type { Message } from "@/types/room";

interface Props { message: Message; isOwn: boolean }

export function MessageBubble({ message, isOwn }: Props) {
  return (
    <div className={`flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
      <span className="flex items-center gap-1 text-xs text-secondary px-1">
        {message.username}
        {message.verified && (
          <svg
            aria-label="Verified"
            viewBox="0 0 16 16"
            fill="none"
            className="w-3.5 h-3.5 shrink-0"
          >
            <circle cx="8" cy="8" r="7.5" fill="#3B82F6" />
            <path
              d="M5 8.5l2 2 4-4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <div
        className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? "bg-accent text-black rounded-br-sm"
            : "bg-surface-secondary text-white rounded-bl-sm"
        } ${message.pending ? "opacity-50" : "opacity-100"} transition-opacity`}
      >
        {message.content}
      </div>
    </div>
  );
}