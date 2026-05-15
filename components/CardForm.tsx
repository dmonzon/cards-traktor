"use client"

import { useState } from "react"

interface CardFormData {
  name: string
  balance: string
  interestRate: string
  minPayment: string
  limit: string
  hasPromoOffer: boolean
  promoTransferFee: string
  promoRate: string
  promoMonths: string
}

interface Props {
  initial?: Partial<CardFormData>
  onSubmit: (data: CardFormData) => Promise<void>
  onCancel: () => void
  submitLabel: string
}

const EMPTY: CardFormData = {
  name: "",
  balance: "",
  interestRate: "",
  minPayment: "",
  limit: "",
  hasPromoOffer: false,
  promoTransferFee: "",
  promoRate: "0",
  promoMonths: "",
}

export default function CardForm({ initial, onSubmit, onCancel, submitLabel }: Props) {
  const [form, setForm] = useState<CardFormData>({ ...EMPTY, ...initial })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function set(field: keyof CardFormData, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.name.trim()) { setError("El nombre de la tarjeta es requerido"); return }
    if (!form.balance || isNaN(Number(form.balance)) || Number(form.balance) < 0) {
      setError("Ingresa un saldo válido"); return
    }
    if (!form.interestRate || isNaN(Number(form.interestRate))) {
      setError("Ingresa una tasa de interés válida"); return
    }
    if (form.hasPromoOffer && (!form.promoMonths || Number(form.promoMonths) < 1)) {
      setError("Ingresa el número de meses de la oferta"); return
    }
    if (form.hasPromoOffer && (form.promoRate === "" || isNaN(Number(form.promoRate)))) {
      setError("Ingresa el APR de la oferta"); return
    }

    setLoading(true)
    try {
      await onSubmit(form)
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || "Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            💳 Nombre de la tarjeta <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => set("name", e.target.value)}
            placeholder='Ej: "Visa BofA", "Chase Sapphire"'
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Saldo actual <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-gray-600 font-semibold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.balance}
              onChange={e => set("balance", e.target.value)}
              placeholder="0.00"
              className="w-full border-2 border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Tasa APR anual <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.interestRate}
              onChange={e => set("interestRate", e.target.value)}
              placeholder="24.99"
              className="w-full border-2 border-gray-200 rounded-lg px-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <span className="absolute right-4 top-2.5 text-gray-600 font-semibold">%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Pago mínimo mensual
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-gray-600 font-semibold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minPayment}
              onChange={e => set("minPayment", e.target.value)}
              placeholder="25.00"
              className="w-full border-2 border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Límite de crédito
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-gray-600 font-semibold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.limit}
              onChange={e => set("limit", e.target.value)}
              placeholder="5,000.00"
              className="w-full border-2 border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Oferta promocional */}
      <div className="border-2 border-amber-200 bg-amber-50 rounded-xl p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasPromoOffer}
            onChange={e => set("hasPromoOffer", e.target.checked)}
            className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
          />
          <div>
            <span className="text-sm font-bold text-gray-800">
              ⭐ Oferta de transferencia de balance
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              APR especial por tiempo limitado (ej: 0% por 15 meses)
            </p>
          </div>
        </label>

        {form.hasPromoOffer && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t-2 border-amber-200">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Costo de transferencia
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={form.promoTransferFee}
                  onChange={e => set("promoTransferFee", e.target.value)}
                  placeholder="3.5"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <span className="absolute right-4 top-2.5 text-gray-600 font-semibold">%</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">% del saldo a transferir</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                APR de la oferta <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.promoRate}
                  onChange={e => set("promoRate", e.target.value)}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <span className="absolute right-4 top-2.5 text-gray-600 font-semibold">%</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">Usualmente 0%</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Duración <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="36"
                  step="1"
                  value={form.promoMonths}
                  onChange={e => set("promoMonths", e.target.value)}
                  placeholder="15"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 pr-16 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <span className="absolute right-4 top-2.5 text-gray-600 font-semibold">meses</span>
              </div>
            </div>

            {/* Resumen de la oferta */}
            {form.balance && form.promoTransferFee && (
              <div className="sm:col-span-3 bg-white border-2 border-amber-200 rounded-lg px-4 py-3 text-sm font-medium text-amber-900">
                💰 Costo de transferencia estimado:{" "}
                <strong className="text-lg">
                  ${(Number(form.balance) * Number(form.promoTransferFee) / 100).toFixed(2)}
                </strong>
                <p className="text-xs text-amber-700 mt-1">— se suma al saldo inicial</p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-700 text-sm bg-red-50 border-2 border-red-200 rounded-lg px-4 py-3 font-medium">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors font-bold shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "⏳ Guardando..." : `✓ ${submitLabel}`}
        </button>
      </div>
    </form>
  )
}
