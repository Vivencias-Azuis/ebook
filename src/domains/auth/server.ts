import { eq } from "drizzle-orm";
import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { hasAdminRole } from "@/domains/admin/access";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireServerSession();
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!hasAdminRole(user)) {
    redirect("/library");
  }

  return session;
}
