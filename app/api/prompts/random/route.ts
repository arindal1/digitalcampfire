import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await prisma.prompt.count();
  if (count === 0) return NextResponse.json({ error: "No prompts available" }, { status: 404 });

  // orderBy ensures a stable cursor order so the random skip lands on the
  // correct record regardless of how PostgreSQL chooses to iterate the table.
  const prompt = await prisma.prompt.findFirst({ orderBy: { id: "asc" }, skip: Math.floor(Math.random() * count) });
  return NextResponse.json({ prompt });
}