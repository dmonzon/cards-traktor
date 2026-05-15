import { NextRequest } from "next/server"
import { requireSession } from "@/lib/api"
import { buildCardData } from "@/lib/cards"
import { prisma } from "@/lib/db"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession()
  if (error) return error

  const { id } = await params
  const body = await req.json()

  if (!body.name?.trim()) {
    return Response.json({ error: "El nombre es requerido" }, { status: 400 })
  }

  try {
    const result = await prisma.creditCard.updateMany({
      where: { id, userId: session.user.id },
      data: buildCardData(body),
    })
    if (result.count === 0) {
      return Response.json({ error: "Tarjeta no encontrada" }, { status: 404 })
    }
    const card = await prisma.creditCard.findUnique({ where: { id } })
    return Response.json(card)
  } catch {
    return Response.json({ error: "Error al actualizar la tarjeta" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession()
  if (error) return error

  const { id } = await params
  const result = await prisma.creditCard.deleteMany({
    where: { id, userId: session.user.id },
  })

  if (result.count === 0) {
    return Response.json({ error: "Tarjeta no encontrada" }, { status: 404 })
  }
  return new Response(null, { status: 204 })
}
