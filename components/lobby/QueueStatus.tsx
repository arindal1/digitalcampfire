"use client";
export function QueueStatus() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-accent rounded-full animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
      <p className="text-secondary text-sm">Finding your campfire…</p>
    </div>
  );
}