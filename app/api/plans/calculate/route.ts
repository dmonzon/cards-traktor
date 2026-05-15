import { NextRequest } from "next/server"
import { requireSession } from "@/lib/api"
import { prisma } from "@/lib/db"
import { calculateAvalanchePlan, calculateSnowballPlan, PaymentPlanResult } from "@/lib/payment-plan"

export interface ChartPoint {
  month: number
  balance: number
}

export interface PlanPreview {
  strategy: "avalanche" | "snowball"
  totalDebt: number
  totalTransferFees: number
  totalInterest: number
  monthlyPayment: number
  estimatedMonths: number
  savingsVsMinPayment: number
  chart: ChartPoint[]
}

export interface CalculateResponse {
  avalanche: PlanPreview
  snowball: PlanPreview
  minimumSuggested: number
}

function toChartData(result: PaymentPlanResult): ChartPoint[] {
  const byMonth: Record<number, number> = {}
  for (const p of result.payments) {
    byMonth[p.month] = (byMonth[p.month] ?? 0) + p.remainingBalance
  }
  return Object.entries(byMonth)
    .map(([month, balance]) => ({ month: Number(month), balance }))
    .sort((a, b) => a.month - b.month)
}

function toPreview(result: PaymentPlanResult): PlanPreview {
  const { payments: _, ...rest } = result
  return { ...rest, chart: toChartData(result) }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const { monthlyPayment } = await req.json()
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

  const minimumSuggested = cards.reduce((sum, c) => sum + (c.minPayment ?? 25), 0)
  if (monthlyPayment < minimumSuggested) {
    return Response.json(
      { error: `El monto mínimo sugerido es $${minimumSuggested.toFixed(2)} (suma de pagos mínimos)` },
      { status: 400 }
    )
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

  const response: CalculateResponse = {
    avalanche: toPreview(calculateAvalanchePlan(cardInputs, monthlyPayment)),
    snowball: toPreview(calculateSnowballPlan(cardInputs, monthlyPayment)),
    minimumSuggested,
  }

  return Response.json(response)
}
