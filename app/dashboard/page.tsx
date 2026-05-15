import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const [cards, plans] = await Promise.all([
    prisma.creditCard.findMany({
      where: { userId: session.user.id },
      select: { balance: true },
    }),
    prisma.paymentPlan.findMany({
      where: { userId: session.user.id },
      select: { savingsVsMinPayment: true },
    }),
  ])

  const totalDebt = cards.reduce((sum, c) => sum + c.balance, 0)
  const bestSavings = plans.length > 0
    ? Math.max(...plans.map(p => p.savingsVsMinPayment))
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Bienvenido, {session.user.name ?? session.user.email}
        </h1>
        <p className="text-gray-600 mt-2">Tu panel de control de deuda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-400 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Deuda total</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                ${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-2">{cards.length} tarjeta{cards.length !== 1 ? "s" : ""}</p>
            </div>
            <span className="text-4xl">💳</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Planes generados</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{plans.length}</p>
              <p className="text-xs text-gray-500 mt-2">{plans.length === 0 ? "Sin planes aún" : "planes guardados"}</p>
            </div>
            <span className="text-4xl">📋</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Ahorro estimado</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${bestSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-2">vs. pago mínimo</p>
            </div>
            <span className="text-4xl">🎯</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/dashboard/cards"
          className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all group border border-gray-100 hover:border-blue-200"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-5xl">💰</span>
            <span className="text-2xl text-gray-300 group-hover:text-blue-300 transition-colors">→</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            Mis tarjetas
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            {cards.length === 0
              ? "Agrega tu primera tarjeta"
              : `${cards.length} tarjeta${cards.length !== 1 ? "s" : ""} registrada${cards.length !== 1 ? "s" : ""}`}
          </p>
        </Link>

        <Link
          href={plans.length === 0 ? "/dashboard/plans/new" : "/dashboard/plans"}
          className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all group border border-gray-100 hover:border-green-200"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-5xl">⚡</span>
            <span className="text-2xl text-gray-300 group-hover:text-green-300 transition-colors">→</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
            {plans.length === 0 ? "Generar plan de pago" : "Mis planes"}
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            {plans.length === 0
              ? "Crea tu primer plan"
              : `${plans.length} plan${plans.length !== 1 ? "es" : ""} guardado${plans.length !== 1 ? "s" : ""}`}
          </p>
        </Link>
      </div>
    </div>
  )
}
