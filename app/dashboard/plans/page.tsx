"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Plan {
  id: string
  name: string
  strategy: string
  totalDebt: number
  totalInterest: number
  totalTransferFees: number
  monthlyPayment: number
  estimatedMonths: number
  savingsVsMinPayment: number
  createdAt: string
}

const usd = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const months = (n: number) => {
  if (n < 12) return `${n} mes${n !== 1 ? "es" : ""}`
  const y = Math.floor(n / 12)
  const m = n % 12
  return m > 0 ? `${y}a ${m}m` : `${y} año${y !== 1 ? "s" : ""}`
}

const STRATEGY_META: Record<string, { label: string; classes: string }> = {
  avalanche: { label: "Avalancha", classes: "bg-blue-100 text-blue-700" },
  snowball: { label: "Bola de Nieve", classes: "bg-green-100 text-green-700" },
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/plans")
      .then(r => r.json())
      .then(setPlans)
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/plans/${id}`, { method: "DELETE" })
    setDeletingId(null)
    if (res.ok) setPlans(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis planes</h2>
          {plans.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {plans.length} plan{plans.length !== 1 ? "es" : ""} guardado{plans.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/plans/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500 mb-4">Aún no tienes planes guardados</p>
          <Link
            href="/dashboard/plans/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Generar mi primer plan
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map(plan => {
            const meta = STRATEGY_META[plan.strategy] ?? { label: plan.strategy, classes: "bg-gray-100 text-gray-700" }
            return (
              <div key={plan.id} className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.classes}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(plan.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{plan.name}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block">Pago mensual</span>
                      <span className="font-medium text-gray-800">{usd(plan.monthlyPayment)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Tiempo estimado</span>
                      <span className="font-medium text-gray-800">{months(plan.estimatedMonths)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Interés total</span>
                      <span className="font-medium text-red-600">{usd(plan.totalInterest)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Ahorro estimado</span>
                      <span className="font-medium text-green-600">{usd(plan.savingsVsMinPayment)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:flex-col sm:items-end shrink-0">
                  <Link
                    href={`/dashboard/plans/${plan.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Ver detalle
                  </Link>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    disabled={deletingId === plan.id}
                    className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    {deletingId === plan.id ? "..." : "Eliminar"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
