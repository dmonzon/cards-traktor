import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/db"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, balance, interestRate, minPayment, limit, hasPromoOffer, promoTransferFee, promoRate, promoMonths } = body

  const existing = await prisma.creditCard.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return Response.json({ error: "Tarjeta no encontrada" }, { status: 404 })

  try {
    const card = await prisma.creditCard.update({
      where: { id },
      data: {
        name: name?.trim(),
        balance,
        interestRate,
        minPayment: minPayment ?? null,
        limit: limit ?? null,
        hasPromoOffer: hasPromoOffer ?? false,
        promoTransferFee: hasPromoOffer ? (promoTransferFee ?? null) : null,
        promoRate: hasPromoOffer ? (promoRate ?? null) : null,
        promoMonths: hasPromoOffer ? (promoMonths ?? null) : null,
      },
    })
    return Response.json(card)
  } catch {
    return Response.json({ error: "Error al actualizar la tarjeta" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const existing = await prisma.creditCard.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return Response.json({ error: "Tarjeta no encontrada" }, { status: 404 })

  await prisma.creditCard.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
