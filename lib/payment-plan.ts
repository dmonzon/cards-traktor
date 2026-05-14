interface CreditCardInput {
  name: string
  balance: number
  interestRate: number // Annual percentage
  minPayment?: number
}

interface MonthPayment {
  month: number
  creditCard: string
  principalPayment: number
  interestPayment: number
  totalPayment: number
  remainingBalance: number
}

interface PaymentPlanResult {
  strategy: 'avalanche' | 'snowball'
  totalDebt: number
  totalInterest: number
  monthlyPayment: number
  estimatedMonths: number
  savingsVsMinPayment: number
  payments: MonthPayment[]
}

// Calcula la estrategia de Avalancha (mayor interés primero)
export function calculateAvalanchePlan(
  cards: CreditCardInput[],
  monthlyPayment: number
): PaymentPlanResult {
  const cardsData = cards.map(card => ({
    ...card,
    remainingBalance: card.balance,
    monthlyRate: card.interestRate / 100 / 12,
  }))

  // Ordenar por tasa de interés (mayor primero)
  cardsData.sort((a, b) => b.monthlyRate - a.monthlyRate)

  const payments: MonthPayment[] = []
  let totalInterest = 0
  let month = 0

  while (cardsData.some(card => card.remainingBalance > 0.01)) {
    month++
    let remainingPayment = monthlyPayment
    let monthPayments: MonthPayment[] = []

    // Aplicar interés y pagar
    for (const card of cardsData) {
      if (card.remainingBalance <= 0) continue

      const interestPayment = card.remainingBalance * card.monthlyRate
      let principalPayment = 0

      if (remainingPayment >= interestPayment + card.remainingBalance) {
        // Paga todo
        principalPayment = card.remainingBalance
      } else if (remainingPayment >= interestPayment) {
        // Paga interés + parte del principal
        principalPayment = remainingPayment - interestPayment
      } else {
        // Solo cubre parcialmente interés
        principalPayment = 0
      }

      const totalPayment = interestPayment + principalPayment
      card.remainingBalance = Math.max(0, card.remainingBalance - principalPayment)
      remainingPayment = Math.max(0, remainingPayment - totalPayment)
      totalInterest += interestPayment

      monthPayments.push({
        month,
        creditCard: card.name,
        principalPayment,
        interestPayment,
        totalPayment,
        remainingBalance: card.remainingBalance,
      })
    }

    payments.push(...monthPayments)

    if (month > 360) break // Max 30 años
  }

  const totalDebt = cards.reduce((sum, card) => sum + card.balance, 0)
  const minPaymentTotal =
    cards.reduce((sum, card) => sum + (card.minPayment || 25), 0) * month
  const savingsVsMinPayment = Math.max(0, minPaymentTotal - (monthlyPayment * month + totalInterest))

  return {
    strategy: 'avalanche',
    totalDebt,
    totalInterest,
    monthlyPayment,
    estimatedMonths: month,
    savingsVsMinPayment,
    payments,
  }
}

// Calcula la estrategia de Bola de Nieve (menor saldo primero)
export function calculateSnowballPlan(
  cards: CreditCardInput[],
  monthlyPayment: number
): PaymentPlanResult {
  const cardsData = cards.map(card => ({
    ...card,
    remainingBalance: card.balance,
    monthlyRate: card.interestRate / 100 / 12,
  }))

  // Ordenar por balance (menor primero)
  cardsData.sort((a, b) => a.remainingBalance - b.remainingBalance)

  const payments: MonthPayment[] = []
  let totalInterest = 0
  let month = 0

  while (cardsData.some(card => card.remainingBalance > 0.01)) {
    month++
    let remainingPayment = monthlyPayment
    let monthPayments: MonthPayment[] = []

    for (const card of cardsData) {
      if (card.remainingBalance <= 0) continue

      const interestPayment = card.remainingBalance * card.monthlyRate
      let principalPayment = 0

      if (remainingPayment >= interestPayment + card.remainingBalance) {
        principalPayment = card.remainingBalance
      } else if (remainingPayment >= interestPayment) {
        principalPayment = remainingPayment - interestPayment
      }

      const totalPayment = interestPayment + principalPayment
      card.remainingBalance = Math.max(0, card.remainingBalance - principalPayment)
      remainingPayment = Math.max(0, remainingPayment - totalPayment)
      totalInterest += interestPayment

      monthPayments.push({
        month,
        creditCard: card.name,
        principalPayment,
        interestPayment,
        totalPayment,
        remainingBalance: card.remainingBalance,
      })
    }

    payments.push(...monthPayments)

    if (month > 360) break
  }

  const totalDebt = cards.reduce((sum, card) => sum + card.balance, 0)
  const minPaymentTotal =
    cards.reduce((sum, card) => sum + (card.minPayment || 25), 0) * month
  const savingsVsMinPayment = Math.max(0, minPaymentTotal - (monthlyPayment * month + totalInterest))

  return {
    strategy: 'snowball',
    totalDebt,
    totalInterest,
    monthlyPayment,
    estimatedMonths: month,
    savingsVsMinPayment,
    payments,
  }
}
