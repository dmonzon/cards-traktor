import { NextRequest } from "next/server"
import { requireSession } from "@/lib/api"
import { prisma } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession()
  if (error) return error

  const { id } = await params

  const plan = await prisma.paymentPlan.findFirst({
    where: { id, userId: session.user.id },
    include: {
      paymentItems: {
        include: { creditCard: { select: { name: true } } },
        orderBy: [{ month: "asc" }],
      },
    },
  })

  if (!plan) return Response.json({ error: "Plan no encontrado" }, { status: 404 })
  return Response.json(plan)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession()
  if (error) return error

  const { id } = await params
  const result = await prisma.paymentPlan.deleteMany({
    where: { id, userId: session.user.id },
  })

  if (result.count === 0) return Response.json({ error: "Plan no encontrado" }, { status: 404 })
  return new Response(null, { status: 204 })
}
