import { NextRequest } from "next/server"
import { createUser, getUserByEmail } from "@/lib/auth"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    if (!email || !EMAIL_REGEX.test(email)) {
      return Response.json({ error: "Correo electrónico inválido" }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return Response.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    const existing = await getUserByEmail(email)
    if (existing) {
      return Response.json({ error: "El correo ya está registrado" }, { status: 409 })
    }

    await createUser(email, password, name || undefined)
    return Response.json({ message: "Usuario creado exitosamente" }, { status: 201 })
  } catch (error: unknown) {
    const prismaError = error as { code?: string }
    if (prismaError?.code === "P2002") {
      return Response.json({ error: "El correo ya está registrado" }, { status: 409 })
    }
    return Response.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
