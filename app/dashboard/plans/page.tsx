"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

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
  const [exportingId, setExportingId] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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

  async function handleExportPDF(plan: Plan) {
    setExportingId(plan.id)
    try {
      const element = document.createElement('div')
      element.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif;">
          <h1 style="font-size: 28px; margin-bottom: 20px;">${plan.name}</h1>
          <p style="color: #666; margin-bottom: 30px;">
            Estrategia: <strong>${plan.strategy === 'avalanche' ? 'Avalancha' : 'Bola de Nieve'}</strong> •
            ${new Date(plan.createdAt).toLocaleDateString('es')}
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">Pago mensual</p>
              <p style="font-size: 24px; font-weight: bold; margin: 0;">$${plan.monthlyPayment.toFixed(2)}</p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">Tiempo estimado</p>
              <p style="font-size: 24px; font-weight: bold; margin: 0;">${Math.floor(plan.estimatedMonths / 12)}a ${plan.estimatedMonths % 12}m</p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">Interés total</p>
              <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0;">$${plan.totalInterest.toFixed(2)}</p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">Ahorro estimado</p>
              <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 0;">$${plan.savingsVsMinPayment.toFixed(2)}</p>
            </div>
          </div>
          <div style="color: #666; font-size: 12px; text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p>Cards Traktor - Planificador inteligente de deuda</p>
            <p>${new Date().toLocaleDateString('es')}</p>
          </div>
        </div>
      `
      document.body.appendChild(element)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
      document.body.removeChild(element)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 297
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= 297
      }
      pdf.save(`${plan.name}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    } finally {
      setExportingId(null)
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Cargando...</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis planes</h1>
          {plans.length > 0 && (
            <p className="text-gray-600 mt-2">
              {plans.length} plan{plans.length !== 1 ? "es" : ""} guardado{plans.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/plans/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          + Nuevo plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">⚡</div>
          <p className="text-gray-600 mb-6 text-lg">Aún no tienes planes guardados</p>
          <Link
            href="/dashboard/plans/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg inline-block"
          >
            Generar mi primer plan
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {plans.map(plan => {
            const meta = STRATEGY_META[plan.strategy] ?? { label: plan.strategy, classes: "bg-gray-100 text-gray-700" }
            const strategyIcon = plan.strategy === "avalanche" ? "⚡" : "❄️"
            return (
              <div key={plan.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{strategyIcon}</span>
                    <div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${meta.classes}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(plan.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 text-lg truncate">{plan.name}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Pago mensual</span>
                      <span className="font-bold text-blue-600">{usd(plan.monthlyPayment)}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Duración</span>
                      <span className="font-bold text-gray-700">{months(plan.estimatedMonths)}</span>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Interés total</span>
                      <span className="font-bold text-red-600">{usd(plan.totalInterest)}</span>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Ahorro</span>
                      <span className="font-bold text-green-600">{usd(plan.savingsVsMinPayment)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:flex-col sm:items-end shrink-0">
                  <Link
                    href={`/dashboard/plans/${plan.id}`}
                    className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    📊 Detalle
                  </Link>
                  <button
                    onClick={() => handleExportPDF(plan)}
                    disabled={exportingId === plan.id}
                    className="text-sm bg-green-100 hover:bg-green-200 text-green-700 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {exportingId === plan.id ? "⏳" : "📥 PDF"}
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    disabled={deletingId === plan.id}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-700 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingId === plan.id ? "..." : "🗑️ Eliminar"}
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
