import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { Session } from "next-auth"

type SessionResult =
  | { session: Session; error: null }
  | { session: null; error: Response }

export async function requireSession(): Promise<SessionResult> {
  const session = await getServerSession(authOptions)
  if (!session) {
    return {
      session: null,
      error: Response.json({ error: "No autorizado" }, { status: 401 }),
    }
  }
  return { session, error: null }
}
