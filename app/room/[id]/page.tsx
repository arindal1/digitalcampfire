import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RoomView } from "@/components/room/RoomView";
import type { RoomData, ParticipantWithUser } from "@/types/room";

const ROOM_ID_RE = /^[a-zA-Z0-9_-]{10,40}$/;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  if (!ROOM_ID_RE.test(id)) redirect("/lobby");

  let room;
  try {
    room = await prisma.room.findUnique({
      where: { id },
      include: { participants: { include: { user: { select: { verified: true } } } } },
    });
  } catch {
    // DB unreachable or unexpected error — send user back to lobby instead of crashing
    redirect("/lobby");
  }
  if (!room) redirect("/lobby");

  const participants = room.participants as ParticipantWithUser[];
  const me = participants.find((p) => p.userId === session.user.id);
  if (!me) redirect("/lobby");

  const roomData: RoomData = {
    id: room.id,
    language: room.language,
    prompt: room.prompt,
    startedAt: room.startedAt.toISOString(),
    expiresAt: room.expiresAt.toISOString(),
    participants: participants.map((p) => ({ username: p.username, verified: p.user.verified })),
    myUsername: me.username,
  };

  return <RoomView room={roomData} />;
}