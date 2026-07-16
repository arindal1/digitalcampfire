export interface ClientToServerEvents {
  joinQueue: (data: { languages: string[] }) => void;
  leaveQueue: () => void;
  joinRoom: (data: { roomId: string }) => void;
  leaveRoom: (data: { roomId: string }) => void;
  sendMessage: (data: { roomId: string; content: string; tempId?: string }) => void;
}

export interface ServerToClientEvents {
  roomFound: (data: RoomFoundPayload) => void;
  messageReceived: (data: MessagePayload) => void;
  roomEnded: (data: ReplayData) => void;
  participantLeft: () => void;
  appError: (data: { code: string; message: string }) => void;
}

/** Sent with roomEnded so clients can show a session summary card. */
export interface ReplayData {
  prompt: string;
  /** Matched / shared language code for the room. */
  language: string;
  /** All unique language codes spoken by participants. */
  languages: string[];
  /** 15 buckets (one per minute) — message count in that minute. */
  heatmap: number[];
  totalMessages: number;
  startedAt: string; // ISO datetime
}

export interface RoomFoundPayload {
  roomId: string;
  language: string;
  prompt: string;
  expiresAt: string;
  participants: { username: string; verified: boolean }[];
}

export interface MessagePayload {
  messageId: string;
  username: string;
  content: string;
  createdAt: string;
  tempId?: string;
  verified: boolean;
}