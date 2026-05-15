interface PlanResult {
  strategy: "avalanche" | "snowball"
  totalDebt: number
  totalTransferFees: number
  totalInterest: number
  monthlyPayment: number
  estimatedMonths: number
  savingsVsMinPayment: number
}

interface Props {
  result: PlanResult
  onSave: () => void
  saving: boolean
}

const STRATEGY_LABELS = {
  avalanche: { name: "Avalancha", icon: "⚡", color: "blue", description: "Paga primero la tarjeta con mayor interés. Ahorra más dinero en total." },
  snowball: { name: "Bola de Nieve", icon: "❄️", color: "green", description: "Paga primero la tarjeta con menor saldo. Genera motivación al eliminar deudas rápido." },
}

const usd = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const years = (months: number) => {
  if (months < 12) return `${months} mes${months !== 1 ? "es" : ""}`
  const y = Math.floor(months / 12)
  const m = months % 12
  return m > 0 ? `${y} año${y !== 1 ? "s" : ""} y ${m} mes${m !== 1 ? "es" : ""}` : `${y} año${y !== 1 ? "s" : ""}`
}

export default function PlanSummary({ result, onSave, saving }: Props) {
  const meta = STRATEGY_LABELS[result.strategy]
  const isBlue = meta.color === "blue"

  return (
    <div className={`rounded-xl shadow-md border-2 overflow-hidden hover:shadow-lg transition-shadow ${isBlue ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"}`}>
      <div className={`${isBlue ? "bg-blue-600" : "bg-green-600"} text-white p-6 mb-4`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{meta.icon}</span>
          <h3 className="text-2xl font-bold">{meta.name}</h3>
        </div>
        <p className="text-sm opacity-90">{meta.description}</p>
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-600 mb-1">⏱️ Tiempo para saldar</p>
            <p className={`font-bold text-lg ${isBlue ? "text-blue-700" : "text-green-700"}`}>
              {years(result.estimatedMonths)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-600 mb-1">📊 Interés total</p>
            <p className="font-bold text-lg text-red-600">{usd(result.totalInterest)}</p>
          </div>
          {result.totalTransferFees > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <p className="text-xs font-medium text-gray-600 mb-1">💸 Fee transferencia</p>
              <p className="font-bold text-amber-600">{usd(result.totalTransferFees)}</p>
            </div>
          )}
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-600 mb-1">🎯 Ahorro vs mínimo</p>
            <p className="font-bold text-lg text-green-600">{usd(result.savingsVsMinPayment)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 col-span-2 border border-gray-100">
            <p className="text-xs font-medium text-gray-600 mb-1">💰 Costo total (deuda + interés{result.totalTransferFees > 0 ? " + fees" : ""})</p>
            <p className="font-bold text-lg text-gray-900">
              {usd(result.totalDebt + result.totalInterest + result.totalTransferFees)}
            </p>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className={`w-full py-3 rounded-lg font-bold text-white transition-colors shadow-md hover:shadow-lg disabled:opacity-50
            ${isBlue
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {saving ? "⏳ Guardando..." : `💾 Guardar ${meta.name}`}
        </button>
      </div>
    </div>
  )
}
