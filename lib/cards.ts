interface CardBody {
  name?: string
  balance?: number
  interestRate?: number
  minPayment?: number | null
  limit?: number | null
  hasPromoOffer?: boolean
  promoTransferFee?: number | null
  promoRate?: number | null
  promoMonths?: number | null
}

export function buildCardData(body: CardBody) {
  const { name, balance, interestRate, minPayment, limit, hasPromoOffer, promoTransferFee, promoRate, promoMonths } = body
  return {
    name: name?.trim() ?? "",
    balance: balance ?? 0,
    interestRate: interestRate ?? 0,
    minPayment: minPayment ?? null,
    limit: limit ?? null,
    hasPromoOffer: hasPromoOffer ?? false,
    promoTransferFee: hasPromoOffer ? (promoTransferFee ?? null) : null,
    promoRate: hasPromoOffer ? (promoRate ?? null) : null,
    promoMonths: hasPromoOffer ? (promoMonths ?? null) : null,
  }
}
