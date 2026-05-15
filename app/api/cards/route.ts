import { NextRequest } from "next/server"
import { requireSession } from "@/lib/api"
import { buildCardData } from "@/lib/cards"
import { prisma } from "@/lib/db"

export async function GET() {
  const { session, error } = await requireSession()
  if (error) return error

  const cards = await prisma.creditCard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  })

  return Response.json(cards)
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const body = await req.json()
  const { name, balance, interestRate } = body

  if (!name?.trim()) {
    return Response.json({ error: "El nombre es requerido" }, { status: 400 })
  }
  if (typeof balance !== "number" || typeof interestRate !== "number") {
    return Response.json({ error: "Datos inválidos" }, { status: 400 })
  }
  if (balance < 0 || interestRate < 0 || interestRate > 100) {
    return Response.json({ error: "Balance o tasa de interés fuera de rango" }, { status: 400 })
  }

  try {
    const card = await prisma.creditCard.create({
      data: { userId: session.user.id, ...buildCardData(body) },
    })
    return Response.json(card, { status: 201 })
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err?.code === "P2002") {
      return Response.json({ error: "Ya tienes una tarjeta con ese nombre" }, { status: 409 })
    }
    return Response.json({ error: "Error al guardar la tarjeta" }, { status: 500 })
  }
}
