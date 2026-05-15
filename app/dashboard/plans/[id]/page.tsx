"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import PlanChart from "@/components/PlanChart"

interface PaymentItem {
  id: string
  month: number
  principalPayment: number
  interestPayment: number
  totalPayment: number
  remainingBalance: number
  creditCard: { name: string }
}

interface Plan {
  id: string
  name: string
  strategy: string
  totalDebt: number
  totalTransferFees: number
  totalInterest: number
  monthlyPayment: number
  estimatedMonths: number
  savingsVsMinPayment: number
  createdAt: string
  paymentItems: PaymentItem[]
}

const usd = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const STRATEGY_META: Record<string, { label: string; color: string; badge: string }> = {
  avalanche: { label: "Avalancha", color: "#3b82f6", badge: "bg-blue-100 text-blue-700" },
  snowball: { label: "Bola de Nieve", color: "#22c55e", badge: "bg-green-100 text-green-700" },
}

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterCard, setFilterCard] = useState("all")

  useEffect(() => {
    fetch(`/api/plans/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setPlan)
      .catch(() => router.push("/dashboard/plans"))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return <div className="text-center py-16 text-gray-400">Cargando...</div>
  if (!plan) return null

  const meta = STRATEGY_META[plan.strategy] ?? { label: plan.strategy, color: "#6b7280", badge: "bg-gray-100 text-gray-700" }

  const cardNames = Array.from(new Set(plan.paymentItems.map(i => i.creditCard.name))).sort()

  const chartData = Object.values(
    plan.paymentItems.reduce<Record<number, { month: number; balance: number }>>((acc, item) => {
      acc[item.month] = { month: item.month, balance: (acc[item.month]?.balance ?? 0) + item.remainingBalance }
      return acc
    }, {})
  ).sort((a, b) => a.month - b.month)

  const filtered = filterCard === "all"
    ? plan.paymentItems
    : plan.paymentItems.filter(i => i.creditCard.name === filterCard)

  const groupedByMonth = filtered.reduce<Record<number, PaymentItem[]>>((acc, item) => {
    ;(acc[item.month] ??= []).push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/plans" className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">
            ← Mis planes
          </Link>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
              {meta.label}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(plan.createdAt).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{plan.name}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Pago mensual", value: usd(plan.monthlyPayment), className: "text-gray-900" },
          { label: "Deuda inicial", value: usd(plan.totalDebt), className: "text-gray-900" },
          { label: "Interés total", value: usd(plan.totalInterest), className: "text-red-600" },
          { label: "Ahorro estimado", value: usd(plan.savingsVsMinPayment), className: "text-green-600" },
          ...(plan.totalTransferFees > 0 ? [{ label: "Fees transferencia", value: usd(plan.totalTransferFees), className: "text-amber-600" }] : []),
          { label: "Costo total", value: usd(plan.totalDebt + plan.totalInterest + plan.totalTransferFees), className: "text-gray-900" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`font-bold text-lg mt-0.5 ${stat.className}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Progreso de la deuda</h3>
        <PlanChart series={[{ name: "Saldo total", data: chartData, color: meta.color }]} />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-gray-800">Tabla de amortización</h3>
          {cardNames.length > 1 && (
            <select
              value={filterCard}
              onChange={e => setFilterCard(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las tarjetas</option>
              {cardNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-2 pr-4 text-xs font-medium text-gray-400 whitespace-nowrap">Mes</th>
                {filterCard === "all" && (
                  <th className="pb-2 pr-4 text-xs font-medium text-gray-400 whitespace-nowrap">Tarjeta</th>
                )}
                <th className="pb-2 pr-4 text-xs font-medium text-gray-400 whitespace-nowrap text-right">Pago total</th>
                <th className="pb-2 pr-4 text-xs font-medium text-gray-400 whitespace-nowrap text-right">Principal</th>
                <th className="pb-2 pr-4 text-xs font-medium text-gray-400 whitespace-nowrap text-right">Interés</th>
                <th className="pb-2 text-xs font-medium text-gray-400 whitespace-nowrap text-right">Saldo restante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Object.entries(groupedByMonth).map(([month, items]) =>
                items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">
                      {idx === 0 ? <span className="font-medium text-gray-700">Mes {month}</span> : ""}
                    </td>
                    {filterCard === "all" && (
                      <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{item.creditCard.name}</td>
                    )}
                    <td className="py-2 pr-4 text-right font-medium text-gray-800">{usd(item.totalPayment)}</td>
                    <td className="py-2 pr-4 text-right text-blue-600">{usd(item.principalPayment)}</td>
                    <td className="py-2 pr-4 text-right text-red-500">{usd(item.interestPayment)}</td>
                    <td className="py-2 text-right text-gray-600">{usd(item.remainingBalance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
