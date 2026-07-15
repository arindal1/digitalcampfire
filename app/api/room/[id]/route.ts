import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { ParticipantWithUser } from "@/types/room";

const ROOM_ID_RE = /^[a-zA-Z0-9_-]{10,40}$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ROOM_ID_RE.test(id)) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  const room = await prisma.room.findUnique({
    where: { id },
    include: { participants: { include: { user: { select: { verified: true } } } } },
  });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const participants = room.participants as ParticipantWithUser[];
  const me = participants.find((p) => p.userId === session.user.id);
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({
    room: {
      id: room.id,
      language: room.language,
      prompt: room.prompt,
      startedAt: room.startedAt.toISOString(),
      expiresAt: room.expiresAt.toISOString(),
      participants: participants.map((p) => ({
        username: p.username,
        verified: p.user.verified,
      })),
      myUsername: me.username,
    },
  });
}