export interface ClientToServerEvents {
  joinQueue: (data: { languages: string[] }) => void;
  leaveQueue: () => void;
  joinRoom: (data: { roomId: string }) => void;
  sendMessage: (data: { roomId: string; content: string; tempId?: string }) => void;
}

export interface ServerToClientEvents {
  roomFound: (data: RoomFoundPayload) => void;
  messageReceived: (data: MessagePayload) => void;
  roomEnded: () => void;
  appError: (data: { code: string; message: string }) => void;
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