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
    setShowForm(false)
    await loadCards()
  }

  async function handleUpdate(id: string, data: ReturnType<typeof formDataToPayload>) {
    const res = await fetch(`/api/cards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    setEditingCard(null)
    await loadCards()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await fetch(`/api/cards/${id}`, { method: "DELETE" })
    setDeletingId(null)
    await loadCards()
  }

  const totalDebt = cards.reduce((sum, c) => sum + c.balance, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis tarjetas</h2>
          {cards.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {cards.length} tarjeta{cards.length !== 1 ? "s" : ""} · Deuda total:{" "}
              <strong className="text-red-600">${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
            </p>
          )}
        </div>
        {!showForm && !editingCard && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Agregar tarjeta
          </button>
        )}
      </div>

      {/* Formulario de nueva tarjeta */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva tarjeta</h3>
          <CardForm
            submitLabel="Agregar tarjeta"
            onCancel={() => setShowForm(false)}
            onSubmit={async (data) => handleCreate(formDataToPayload(data))}
          />
        </div>
      )}

      {/* Lista de tarjetas */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : cards.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500 mb-4">Aún no tienes tarjetas registradas</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Agregar tu primera tarjeta
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {cards.map(card => (
            <div key={card.id} className="bg-white rounded-xl shadow p-5">
              {editingCard?.id === card.id ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar tarjeta</h3>
                  <CardForm
                    submitLabel="Guardar cambios"
                    initial={cardToFormData(card)}
                    onCancel={() => setEditingCard(null)}
                    onSubmit={async (data) => handleUpdate(card.id, formDataToPayload(data))}
                  />
                </>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2">
                    <div className="col-span-2 sm:col-span-4">
                      <span className="font-semibold text-gray-900 text-lg">{card.name}</span>
                      {card.hasPromoOffer && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          Oferta promo
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Saldo</p>
                      <p className="font-semibold text-red-600">
                        ${card.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">APR regular</p>
                      <p className="font-medium text-gray-800">{card.interestRate}%</p>
                    </div>
                    {card.minPayment && (
                      <div>
                        <p className="text-xs text-gray-400">Pago mínimo</p>
                        <p className="font-medium text-gray-800">
                          ${card.minPayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    {card.hasPromoOffer && card.promoMonths && (
                      <div>
                        <p className="text-xs text-gray-400">Oferta</p>
                        <p className="font-medium text-amber-700">
                          {card.promoRate}% por {card.promoMonths} meses
                          {card.promoTransferFee ? ` (fee ${card.promoTransferFee}%)` : ""}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setEditingCard(card)}
                      className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      disabled={deletingId === card.id}
                      className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      {deletingId === card.id ? "..." : "Eliminar"}
                    </button>
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
