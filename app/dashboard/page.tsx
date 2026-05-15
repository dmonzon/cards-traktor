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
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Bienvenido, {session.user.name ?? session.user.email}
        </h2>
        <p className="text-gray-500 mt-1">Tu panel de control de deuda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-400">
          <p className="text-sm text-gray-500">Deuda total</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            ${totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">{cards.length} tarjeta{cards.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Planes generados</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{plans.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Ahorro estimado</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ${bestSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">vs. pago mínimo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/cards"
          className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                Mis tarjetas
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {cards.length === 0
                  ? "Agrega tu primera tarjeta"
                  : `${cards.length} tarjeta${cards.length !== 1 ? "s" : ""} registrada${cards.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <span className="text-2xl text-gray-300 group-hover:text-blue-300 transition-colors">→</span>
          </div>
        </Link>

        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="font-medium text-gray-400">Generar plan de pago</p>
            <p className="text-xs text-gray-400 mt-1">Próximamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}
