import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  return (
    <div className="grid gap-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Bienvenido, {session.user.name ?? session.user.email}
        </h2>
        <p className="text-gray-500 mt-1">Tu panel de control de tarjetas de crédito</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Tarjetas registradas</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Planes generados</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Ahorro estimado</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">$0</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <p className="text-blue-800 font-medium">
          Próximamente podrás agregar tus tarjetas y generar tu primer plan de pago
        </p>
      </div>
    </div>
  )
}
