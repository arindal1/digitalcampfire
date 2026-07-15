interface QueueEntry {
  socketId: string;
  userId: string;
  languages: string[];
}

const queue: QueueEntry[] = [];

export const enqueue = (entry: QueueEntry): void => {
  const existing = queue.findIndex((e) => e.userId === entry.userId);
  if (existing !== -1) {
    // Refresh socketId in case the user reconnected with a new socket
    queue[existing] = entry;
  } else {
    queue.push(entry);
  }
};

export const dequeueByUserId = (userId: string): void => {
  const i = queue.findIndex((e) => e.userId === userId);
  if (i !== -1) queue.splice(i, 1);
};

export const dequeueBySocketId = (socketId: string): void => {
  const i = queue.findIndex((e) => e.socketId === socketId);
  if (i !== -1) queue.splice(i, 1);
};

export const removeGroup = (group: QueueEntry[]): void =>
  group.forEach((e) => dequeueByUserId(e.userId));

export const findMatch = (): { group: QueueEntry[]; language: string } | null => {
  if (queue.length < 5) return null;

  // Build language → users buckets; find the language with the most speakers (highest overlap)
  const buckets = new Map<string, QueueEntry[]>();
  for (const entry of queue) {
    for (const lang of entry.languages) {
      const bucket = buckets.get(lang) ?? [];
      bucket.push(entry);
      buckets.set(lang, bucket);
    }
  }

  let bestLanguage: string | null = null;
  let bestCount = 0;
  for (const [language, users] of buckets) {
    if (users.length >= 5 && users.length > bestCount) {
      bestLanguage = language;
      bestCount = users.length;
    }
  }

  if (!bestLanguage) return null;
  return { group: buckets.get(bestLanguage)!.slice(0, 5), language: bestLanguage };
};