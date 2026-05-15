export interface CreditCardInput {
  name: string
  balance: number
  interestRate: number
  minPayment?: number
  hasPromoOffer?: boolean
  promoTransferFee?: number
  promoRate?: number
  promoMonths?: number
}

export interface MonthPayment {
  month: number
  creditCard: string
  principalPayment: number
  interestPayment: number
  totalPayment: number
  remainingBalance: number
  isPromo: boolean
}

export interface PaymentPlanResult {
  strategy: 'avalanche' | 'snowball'
  totalDebt: number
  totalTransferFees: number
  totalInterest: number
  monthlyPayment: number
  estimatedMonths: number
  savingsVsMinPayment: number
  payments: MonthPayment[]
}

interface CardState extends CreditCardInput {
  remainingBalance: number
  monthlyRate: number
  promoMonthlyRate: number
  remainingPromoMonths: number
}

function initCards(cards: CreditCardInput[]): { cardsData: CardState[]; totalTransferFees: number; totalDebt: number } {
  let totalTransferFees = 0
  const totalDebt = cards.reduce((sum, c) => sum + c.balance, 0)

  const cardsData: CardState[] = cards.map(card => {
    const transferFee = card.hasPromoOffer && card.promoTransferFee
      ? card.balance * (card.promoTransferFee / 100)
      : 0
    totalTransferFees += transferFee

    return {
      ...card,
      remainingBalance: card.balance + transferFee,
      monthlyRate: card.interestRate / 100 / 12,
      promoMonthlyRate: card.hasPromoOffer && card.promoRate !== undefined
        ? card.promoRate / 100 / 12
        : card.interestRate / 100 / 12,
      remainingPromoMonths: card.hasPromoOffer && card.promoMonths ? card.promoMonths : 0,
    }
  })

  return { cardsData, totalTransferFees, totalDebt }
}

function simulateMonth(card: CardState, availablePayment: number): { payment: MonthPayment; usedPayment: number } {
  if (card.remainingBalance <= 0.01) {
    return {
      payment: { month: 0, creditCard: card.name, principalPayment: 0, interestPayment: 0, totalPayment: 0, remainingBalance: 0, isPromo: false },
      usedPayment: 0,
    }
  }

  const isPromo = card.remainingPromoMonths > 0
  const interestPayment = card.remainingBalance * (isPromo ? card.promoMonthlyRate : card.monthlyRate)

  let principalPayment = 0
  if (availablePayment >= interestPayment + card.remainingBalance) {
    principalPayment = card.remainingBalance
  } else if (availablePayment >= interestPayment) {
    principalPayment = availablePayment - interestPayment
  }

  const totalPayment = interestPayment + principalPayment
  card.remainingBalance = Math.max(0, card.remainingBalance - principalPayment)
  if (isPromo) card.remainingPromoMonths--

  return {
    payment: { month: 0, creditCard: card.name, principalPayment, interestPayment, totalPayment, remainingBalance: card.remainingBalance, isPromo },
    usedPayment: totalPayment,
  }
}

function runSimulation(cardsData: CardState[], monthlyPayment: number, strategy: 'avalanche' | 'snowball'): { payments: MonthPayment[]; totalInterest: number; months: number } {
  const payments: MonthPayment[] = []
  let totalInterest = 0
  let month = 0

  while (cardsData.some(c => c.remainingBalance > 0.01)) {
    month++
    let remainingPayment = monthlyPayment

    // Re-sort every month based on current strategy
    if (strategy === 'avalanche') {
      cardsData.sort((a, b) => {
        const rateA = a.remainingBalance > 0.01 ? (a.remainingPromoMonths > 0 ? a.promoMonthlyRate : a.monthlyRate) : -1
        const rateB = b.remainingBalance > 0.01 ? (b.remainingPromoMonths > 0 ? b.promoMonthlyRate : b.monthlyRate) : -1
        return rateB - rateA
      })
    } else {
      cardsData.sort((a, b) => {
        const balA = a.remainingBalance > 0.01 ? a.remainingBalance : Infinity
        const balB = b.remainingBalance > 0.01 ? b.remainingBalance : Infinity
        return balA - balB
      })
    }

    for (const card of cardsData) {
      if (card.remainingBalance <= 0.01) continue
      const { payment, usedPayment } = simulateMonth(card, remainingPayment)
      remainingPayment = Math.max(0, remainingPayment - usedPayment)
      totalInterest += payment.interestPayment
      payments.push({ ...payment, month })
    }

    if (month > 360) break
  }

  return { payments, totalInterest, months: month }
}

function calculatePlan(
  cards: CreditCardInput[],
  monthlyPayment: number,
  strategy: 'avalanche' | 'snowball'
): PaymentPlanResult {
  const { cardsData, totalTransferFees, totalDebt } = initCards(cards)

  const { payments, totalInterest, months } = runSimulation(cardsData, monthlyPayment, strategy)
  const minPaymentTotal = cards.reduce((sum, c) => sum + (c.minPayment || 25), 0) * months
  const savingsVsMinPayment = Math.max(0, minPaymentTotal - (monthlyPayment * months + totalInterest))

  return { strategy, totalDebt, totalTransferFees, totalInterest, monthlyPayment, estimatedMonths: months, savingsVsMinPayment, payments }
}

export function calculateAvalanchePlan(cards: CreditCardInput[], monthlyPayment: number): PaymentPlanResult {
  return calculatePlan(cards, monthlyPayment, 'avalanche')
}

export function calculateSnowballPlan(cards: CreditCardInput[], monthlyPayment: number): PaymentPlanResult {
  return calculatePlan(cards, monthlyPayment, 'snowball')
}
