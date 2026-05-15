"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import PlanSummary from "@/components/PlanSummary"
import PlanChart from "@/components/PlanChart"
import type { CalculateResponse } from "@/app/api/plans/calculate/route"

interface Card {
  id: string
  name: string
  balance: number
  interestRate: number
  minPayment: number | null
}

export default function NewPlanPage() {
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [loadingCards, setLoadingCards] = useState(true)
  const [monthlyPayment, setMonthlyPayment] = useState("")
  const [results, setResults] = useState<CalculateResponse | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [calcError, setCalcError] = useState("")
  const [saving, setSaving] = useState<"avalanche" | "snowball" | null>(null)

  useEffect(() => {
    fetch("/api/cards")
      .then(r => r.json())
      .then(data => {
        setCards(data)
        const suggested = data.reduce((sum: number, c: Card) => sum + (c.minPayment ?? 25), 0)
        setMonthlyPayment(suggested.toFixed(2))
      })
      .finally(() => setLoadingCards(false))
  }, [])

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    setCalcError("")
    setResults(null)
    setCalculating(true)

    const res = await fetch("/api/plans/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyPayment: Number(monthlyPayment) }),
    })
    const data = await res.json()
    setCalculating(false)

    if (!res.ok) { setCalcError(data.error); return }
    setResults(data)
  }

  async function handleSave(strategy: "avalanche" | "snowball") {
    setSaving(strategy)
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy, monthlyPayment: Number(monthlyPayment) }),
    })
    setSaving(null)
    if (res.ok) router.push("/dashboard")
  }

  if (loadingCards) {
    return <div className="text-center py-16 text-gray-400">Cargando...</div>
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 text-center">
        <p className="text-gray-600 font-medium mb-2">No tienes tarjetas registradas</p>
        <p className="text-gray-400 text-sm mb-6">Agrega al menos una tarjeta para generar un plan de pago.</p>
        <Link
          href="/dashboard/cards"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Ir a mis tarjetas
        </Link>
      </div>
    )
  }

  const minimumSuggested = cards.reduce((sum, c) => sum + (c.minPayment ?? 25), 0)
  const totalDebt = cards.reduce((sum, c) => sum + c.balance, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Generar plan de pago</h2>
        <p className="text-gray-500 text-sm mt-1">
          Deuda total: <strong className="text-red-600">${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
          {" · "}{cards.length} tarjeta{cards.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleCalculate} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ¿Cuánto puedes pagar mensualmente?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
              <input
                type="number"
                min={minimumSuggested}
                step="0.01"
                value={monthlyPayment}
                onChange={e => { setMonthlyPayment(e.target.value); setResults(null) }}
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Mínimo sugerido: ${minimumSuggested.toFixed(2)} (suma de pagos mínimos)
            </p>
          </div>
          <button
            type="submit"
            disabled={calculating || !monthlyPayment}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
          >
            {calculating ? "Calculando..." : "Calcular plan"}
          </button>
        </form>

        {calcError && (
          <p className="mt-3 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {calcError}
          </p>
        )}
      </div>

      {results && (
        <>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Comparación de estrategias</h3>
            <PlanChart
              series={[
                { name: "Avalancha", data: results.avalanche.chart, color: "#3b82f6" },
                { name: "Bola de Nieve", data: results.snowball.chart, color: "#22c55e" },
              ]}
            />
            <p className="text-xs text-gray-400 text-center mt-2">Saldo total restante por mes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PlanSummary
              result={results.avalanche}
              onSave={() => handleSave("avalanche")}
              saving={saving === "avalanche"}
            />
            <PlanSummary
              result={results.snowball}
              onSave={() => handleSave("snowball")}
              saving={saving === "snowball"}
            />
          </div>
        </>
      )}
    </div>
  )
}
