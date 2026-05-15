import { NextRequest } from "next/server"
import { requireSession } from "@/lib/api"
import { prisma } from "@/lib/db"
import { calculateAvalanchePlan, calculateSnowballPlan } from "@/lib/payment-plan"

export async function GET() {
  const { session, error } = await requireSession()
  if (error) return error

  const plans = await prisma.paymentPlan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return Response.json(plans)
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const { strategy, monthlyPayment } = await req.json()
  if (!["avalanche", "snowball"].includes(strategy)) {
    return Response.json({ error: "Estrategia inválida" }, { status: 400 })
  }
  if (typeof monthlyPayment !== "number" || monthlyPayment <= 0) {
    return Response.json({ error: "Monto mensual inválido" }, { status: 400 })
  }

  const cards = await prisma.creditCard.findMany({
    where: { userId: session.user.id },
    take: 50,
  })

  if (cards.length === 0) {
    return Response.json({ error: "No tienes tarjetas registradas" }, { status: 400 })
  }

  const cardInputs = cards.map(c => ({
    name: c.name,
    balance: c.balance,
    interestRate: c.interestRate,
    minPayment: c.minPayment ?? undefined,
    hasPromoOffer: c.hasPromoOffer,
    promoTransferFee: c.promoTransferFee ?? undefined,
    promoRate: c.promoRate ?? undefined,
    promoMonths: c.promoMonths ?? undefined,
  }))

  const nameToId = Object.fromEntries(cards.map(c => [c.name, c.id]))
  const result = strategy === "avalanche"
    ? calculateAvalanchePlan(cardInputs, monthlyPayment)
    : calculateSnowballPlan(cardInputs, monthlyPayment)

  const strategyLabel = strategy === "avalanche" ? "Avalancha" : "Bola de Nieve"
  const monthLabel = new Date().toLocaleDateString("es", { month: "long", year: "numeric" })

  const plan = await prisma.$transaction(async tx => {
    const saved = await tx.paymentPlan.create({
      data: {
        userId: session.user.id,
        name: `Plan ${strategyLabel} - ${monthLabel}`,
        strategy,
        totalDebt: result.totalDebt,
        totalTransferFees: result.totalTransferFees,
        totalInterest: result.totalInterest,
        monthlyPayment: result.monthlyPayment,
        estimatedMonths: result.estimatedMonths,
        savingsVsMinPayment: result.savingsVsMinPayment,
      },
    })

    const items = result.payments
      .filter(p => p.totalPayment > 0 && nameToId[p.creditCard])
      .map(p => ({
        creditCardId: nameToId[p.creditCard],
        planId: saved.id,
        month: p.month,
        principalPayment: p.principalPayment,
        interestPayment: p.interestPayment,
        totalPayment: p.totalPayment,
        remainingBalance: p.remainingBalance,
      }))

    await tx.paymentItem.createMany({ data: items })
    return saved
  })

  return Response.json(plan, { status: 201 })
}
