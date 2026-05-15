"use client"

import { useEffect, useState } from "react"
import CardForm from "@/components/CardForm"

interface CreditCard {
  id: string
  name: string
  balance: number
  interestRate: number
  minPayment: number | null
  limit: number | null
  hasPromoOffer: boolean
  promoTransferFee: number | null
  promoRate: number | null
  promoMonths: number | null
}

export default function CardsPage() {
  const [cards, setCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadCards() {
    const res = await fetch("/api/cards")
    if (res.ok) setCards(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadCards() }, [])

  async function handleCreate(data: ReturnType<typeof formDataToPayload>) {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    setCards(prev => [...prev, json])
    setShowForm(false)
  }

  async function handleUpdate(id: string, data: ReturnType<typeof formDataToPayload>) {
    const res = await fetch(`/api/cards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    setCards(prev => prev.map(c => c.id === id ? json : c))
    setEditingCard(null)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/cards/${id}`, { method: "DELETE" })
    setDeletingId(null)
    if (res.ok) setCards(prev => prev.filter(c => c.id !== id))
  }

  const totalDebt = cards.reduce((sum, c) => sum + c.balance, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis tarjetas</h1>
          {cards.length > 0 && (
            <p className="text-gray-600 mt-2">
              {cards.length} tarjeta{cards.length !== 1 ? "s" : ""} · Deuda total:{" "}
              <strong className="text-red-600 text-lg">${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
            </p>
          )}
        </div>
        {!showForm && !editingCard && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            + Agregar tarjeta
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Nueva tarjeta</h3>
          <CardForm
            submitLabel="Agregar tarjeta"
            onCancel={() => setShowForm(false)}
            onSubmit={async (data) => handleCreate(formDataToPayload(data))}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin text-4xl">⏳</div>
          <p className="text-gray-500 mt-4">Cargando tarjetas...</p>
        </div>
      ) : cards.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-gray-600 mb-6 text-lg">Aún no tienes tarjetas registradas</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Agregar tu primera tarjeta
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {cards.map(card => (
            <div key={card.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
              {editingCard?.id === card.id ? (
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Editar tarjeta</h3>
                  <CardForm
                    submitLabel="Guardar cambios"
                    initial={cardToFormData(card)}
                    onCancel={() => setEditingCard(null)}
                    onSubmit={async (data) => handleUpdate(card.id, formDataToPayload(data))}
                  />
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">💳</span>
                        <span className="font-bold text-gray-900 text-xl">{card.name}</span>
                        {card.hasPromoOffer && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            ⭐ Oferta promo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setEditingCard(card)}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        disabled={deletingId === card.id}
                        className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                      >
                        {deletingId === card.id ? "..." : "🗑️ Eliminar"}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-600">Saldo</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        ${card.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-600">APR regular</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{card.interestRate}%</p>
                    </div>
                    {card.minPayment && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs font-medium text-gray-600">Pago mínimo</p>
                        <p className="text-2xl font-bold text-gray-700 mt-1">
                          ${card.minPayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    {card.hasPromoOffer && card.promoMonths && (
                      <div className="bg-amber-50 rounded-lg p-4">
                        <p className="text-xs font-medium text-gray-600">Oferta</p>
                        <p className="text-sm font-bold text-amber-700 mt-1">
                          {card.promoRate}% por {card.promoMonths} meses
                          {card.promoTransferFee ? ` (fee ${card.promoTransferFee}%)` : ""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formDataToPayload(data: {
  name: string; balance: string; interestRate: string; minPayment: string;
  limit: string; hasPromoOffer: boolean; promoTransferFee: string; promoRate: string; promoMonths: string
}) {
  return {
    name: data.name,
    balance: Number(data.balance),
    interestRate: Number(data.interestRate),
    minPayment: data.minPayment ? Number(data.minPayment) : null,
    limit: data.limit ? Number(data.limit) : null,
    hasPromoOffer: data.hasPromoOffer,
    promoTransferFee: data.hasPromoOffer && data.promoTransferFee ? Number(data.promoTransferFee) : null,
    promoRate: data.hasPromoOffer ? Number(data.promoRate) : null,
    promoMonths: data.hasPromoOffer && data.promoMonths ? Number(data.promoMonths) : null,
  }
}

function cardToFormData(card: CreditCard) {
  return {
    name: card.name,
    balance: String(card.balance),
    interestRate: String(card.interestRate),
    minPayment: card.minPayment ? String(card.minPayment) : "",
    limit: card.limit ? String(card.limit) : "",
    hasPromoOffer: card.hasPromoOffer,
    promoTransferFee: card.promoTransferFee ? String(card.promoTransferFee) : "",
    promoRate: card.promoRate !== null ? String(card.promoRate) : "0",
    promoMonths: card.promoMonths ? String(card.promoMonths) : "",
  }
}
