import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseLanguages } from "@/lib/utils";
import { LobbyView } from "@/components/lobby/LobbyView";

interface AuthUser {
  id: string;
  name: string;
  username?: string;
  languages?: string;
}

export default async function LobbyPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = session.user as unknown as AuthUser;
  const languages = parseLanguages(user.languages ?? "[]");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { campfireCount: true },
  });

  return (
    <LobbyView
      username={user.username ?? user.name}
      languages={languages}
      campfireCount={dbUser?.campfireCount ?? 0}
    />
  );
}