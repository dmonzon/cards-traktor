import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const cards = await prisma.creditCard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  })

  return Response.json(cards)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { name, balance, interestRate, minPayment, limit, hasPromoOffer, promoTransferFee, promoRate, promoMonths } = body

  if (!name || typeof balance !== "number" || typeof interestRate !== "number") {
    return Response.json({ error: "Datos inválidos" }, { status: 400 })
  }
  if (balance < 0 || interestRate < 0 || interestRate > 100) {
    return Response.json({ error: "Balance o tasa de interés fuera de rango" }, { status: 400 })
  }

  try {
    const card = await prisma.creditCard.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
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
    return Response.json(card, { status: 201 })
  } catch (error: unknown) {
    const e = error as { code?: string }
    if (e?.code === "P2002") {
      return Response.json({ error: "Ya tienes una tarjeta con ese nombre" }, { status: 409 })
    }
    return Response.json({ error: "Error al guardar la tarjeta" }, { status: 500 })
  }
}
