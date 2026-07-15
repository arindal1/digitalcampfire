export interface RoomData {
  id: string;
  language: string;
  prompt: string;
  startedAt: string;
  expiresAt: string;
  participants: { username: string; verified: boolean }[];
  myUsername: string;
}

export interface Message {
  id: string;
  username: string;
  content: string;
  createdAt: string;
  pending?: boolean;
  verified?: boolean;
}

export interface DBParticipant {
  roomId: string;
  userId: string;
  username: string;
}

/** Prisma query result shape when a RoomParticipant is fetched with its User's verified field. */
export interface ParticipantWithUser {
  roomId: string;
  userId: string;
  username: string;
  user: { verified: boolean };
}