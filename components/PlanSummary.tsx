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
  avalanche: { name: "Avalancha", color: "blue", description: "Paga primero la tarjeta con mayor interés. Ahorra más dinero en total." },
  snowball: { name: "Bola de Nieve", color: "green", description: "Paga primero la tarjeta con menor saldo. Genera motivación al eliminar deudas rápido." },
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
    <div className={`border-2 rounded-xl p-5 ${isBlue ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${isBlue ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
            {meta.name}
          </span>
          <p className="text-xs text-gray-500">{meta.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-400">Tiempo para saldar</p>
          <p className={`font-bold text-lg ${isBlue ? "text-blue-700" : "text-green-700"}`}>
            {years(result.estimatedMonths)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-400">Interés total</p>
          <p className="font-bold text-lg text-red-600">{usd(result.totalInterest)}</p>
        </div>
        {result.totalTransferFees > 0 && (
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-400">Fee de transferencia</p>
            <p className="font-bold text-amber-600">{usd(result.totalTransferFees)}</p>
          </div>
        )}
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-400">Ahorro vs pago mínimo</p>
          <p className="font-bold text-lg text-green-600">{usd(result.savingsVsMinPayment)}</p>
        </div>
        <div className="bg-white rounded-lg p-3 col-span-2">
          <p className="text-xs text-gray-400">Costo total (deuda + interés{result.totalTransferFees > 0 ? " + fees" : ""})</p>
          <p className="font-bold text-gray-800">
            {usd(result.totalDebt + result.totalInterest + result.totalTransferFees)}
          </p>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className={`w-full py-2 rounded-lg font-medium text-sm text-white transition-colors
          ${isBlue
            ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            : "bg-green-600 hover:bg-green-700 disabled:bg-green-300"
          }`}
      >
        {saving ? "Guardando..." : "Guardar este plan"}
      </button>
    </div>
  )
}
