"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import PlanChart from "@/components/PlanChart"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

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
  const contentRef = useRef<HTMLDivElement>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterCard, setFilterCard] = useState("all")
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetch(`/api/plans/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setPlan)
      .catch(() => router.push("/dashboard/plans"))
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleExportPDF() {
    if (!contentRef.current || !plan) return
    setExporting(true)
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
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
      setExporting(false)
    }
  }

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

  const strategyIcon = plan.strategy === "avalanche" ? "⚡" : "❄️"

  return (
    <div ref={contentRef} className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/dashboard/plans" className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-3 block inline-block">
            ← Volver a mis planes
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{strategyIcon}</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${meta.badge}`}>
              {meta.label}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(plan.createdAt).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mt-2">{plan.name}</h1>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          {exporting ? "⏳ Generando..." : "📥 Descargar PDF"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Pago mensual", value: usd(plan.monthlyPayment), bg: "bg-blue-50", className: "text-blue-600" },
          { label: "Deuda inicial", value: usd(plan.totalDebt), bg: "bg-gray-50", className: "text-gray-900" },
          { label: "Interés total", value: usd(plan.totalInterest), bg: "bg-red-50", className: "text-red-600" },
          { label: "Ahorro estimado", value: usd(plan.savingsVsMinPayment), bg: "bg-green-50", className: "text-green-600" },
          ...(plan.totalTransferFees > 0 ? [{ label: "Fees transferencia", value: usd(plan.totalTransferFees), bg: "bg-amber-50", className: "text-amber-600" }] : []),
          { label: "Costo total", value: usd(plan.totalDebt + plan.totalInterest + plan.totalTransferFees), bg: "bg-purple-50", className: "text-purple-600" },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-xl shadow-sm p-4 border border-gray-100`}>
            <p className="text-xs font-medium text-gray-600">{stat.label}</p>
            <p className={`font-bold text-lg mt-1 ${stat.className}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          📊 Progreso de la deuda
        </h3>
        <PlanChart series={[{ name: "Saldo total", data: chartData, color: meta.color }]} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📋 Tabla de amortización
          </h3>
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
