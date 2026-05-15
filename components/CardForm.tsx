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
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la tarjeta <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => set("name", e.target.value)}
            placeholder='Ej: "Visa BofA", "Chase Sapphire"'
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Saldo actual <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.balance}
              onChange={e => set("balance", e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tasa de interés anual (APR) <span className="text-red-500">*</span>
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
              className="w-full border border-gray-300 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pago mínimo mensual
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minPayment}
              onChange={e => set("minPayment", e.target.value)}
              placeholder="25.00"
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Límite de crédito
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.limit}
              onChange={e => set("limit", e.target.value)}
              placeholder="5,000.00"
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Oferta promocional */}
      <div className="border border-gray-200 rounded-xl p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasPromoOffer}
            onChange={e => set("hasPromoOffer", e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-800">
              Tiene oferta de transferencia de balance
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              APR especial por tiempo limitado (ej: 0% por 15 meses)
            </p>
          </div>
        </label>

        {form.hasPromoOffer && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full border border-gray-300 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">% del saldo a transferir</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full border border-gray-300 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Usualmente 0%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración de la oferta <span className="text-red-500">*</span>
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
                  className="w-full border border-gray-300 rounded-lg px-3 pr-14 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2 text-gray-400 text-sm">meses</span>
              </div>
            </div>

            {/* Resumen de la oferta */}
            {form.balance && form.promoTransferFee && (
              <div className="sm:col-span-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                Costo de transferencia estimado:{" "}
                <strong>
                  ${(Number(form.balance) * Number(form.promoTransferFee) / 100).toFixed(2)}
                </strong>{" "}
                — se suma al saldo inicial
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors font-medium"
        >
          {loading ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  )
}
