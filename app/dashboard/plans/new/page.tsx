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
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin text-5xl mb-4">⏳</div>
        <p className="text-gray-600 text-lg">Cargando tarjetas...</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
        <div className="text-6xl mb-4">💳</div>
        <p className="text-gray-700 font-bold mb-2 text-lg">No tienes tarjetas registradas</p>
        <p className="text-gray-600 text-sm mb-6">Agrega al menos una tarjeta para generar un plan de pago.</p>
        <Link
          href="/dashboard/cards"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg inline-block"
        >
          Ir a mis tarjetas
        </Link>
      </div>
    )
  }

  const minimumSuggested = cards.reduce((sum, c) => sum + (c.minPayment ?? 25), 0)
  const totalDebt = cards.reduce((sum, c) => sum + c.balance, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Generar plan de pago</h1>
        <p className="text-gray-600 text-lg mt-3">
          Deuda total: <span className="font-bold text-red-600 text-xl">${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          {" · "}<span className="font-medium">{cards.length} tarjeta{cards.length !== 1 ? "s" : ""}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-2">
              💰 ¿Cuánto puedes pagar mensualmente?
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-600 text-lg font-semibold">$</span>
              <input
                type="number"
                min={minimumSuggested}
                step="0.01"
                value={monthlyPayment}
                onChange={e => { setMonthlyPayment(e.target.value); setResults(null) }}
                className="w-full border-2 border-gray-300 rounded-lg pl-10 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">Mínimo sugerido:</span> ${minimumSuggested.toFixed(2)} (suma de pagos mínimos)
            </p>
          </div>
          <button
            type="submit"
            disabled={calculating || !monthlyPayment}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-6 py-3 rounded-lg transition-colors text-lg"
          >
            {calculating ? "⏳ Calculando..." : "⚡ Calcular plan"}
          </button>
        </form>

        {calcError && (
          <div className="mt-4 text-red-700 text-sm bg-red-50 border-2 border-red-200 rounded-lg px-4 py-3 font-medium">
            ⚠️ {calcError}
          </div>
        )}
      </div>

      {results && (
        <>
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              📊 Comparación de estrategias
            </h2>
            <PlanChart
              series={[
                { name: "Avalancha", data: results.avalanche.chart, color: "#3b82f6" },
                { name: "Bola de Nieve", data: results.snowball.chart, color: "#22c55e" },
              ]}
            />
            <p className="text-sm text-gray-600 text-center mt-4 bg-gray-50 p-3 rounded-lg">
              💡 El gráfico muestra el saldo total restante de todas tus tarjetas por mes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
