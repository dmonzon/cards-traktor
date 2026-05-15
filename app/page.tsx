import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="grid gap-12">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center py-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Tu deuda bajo control
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Genera planes de pago inteligentes para tarjetas de crédito. Elige entre
            estrategia de avalancha o bola de nieve y visualiza exactamente cuánto
            ahorrarás en intereses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg text-center"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/auth/login"
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-3 rounded-lg transition-colors text-center"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg">
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <p className="text-sm text-gray-600 font-medium">Tarjeta 1</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$5,000</p>
              <p className="text-xs text-gray-500 mt-1">APR 21.99%</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <p className="text-sm text-gray-600 font-medium">Tarjeta 2</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$3,200</p>
              <p className="text-xs text-gray-500 mt-1">APR 18.5%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 font-medium">Ahorro estimado</p>
              <p className="text-2xl font-bold text-green-600 mt-1">$1,245</p>
              <p className="text-xs text-gray-500 mt-1">vs pago mínimo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Ingresa tus datos</h3>
          <p className="text-gray-600">
            Añade todas tus tarjetas con saldo, tasa de interés y pago mínimo. Soportamos
            ofertas promocionales de transferencia.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Elige tu estrategia</h3>
          <p className="text-gray-600">
            Compara dos estrategias comprobadas: Avalancha (mayor interés primero)
            o Bola de Nieve (menor saldo primero).
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Visualiza y guarda</h3>
          <p className="text-gray-600">
            Mira el progreso con gráficos interactivos, tablas de amortización
            detalladas y proyecciones mensuales.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl font-bold mb-4">¿Por qué Cards Traktor?</h2>
        <div className="grid md:grid-cols-2 gap-6 text-lg">
          <div className="flex gap-3">
            <span className="text-2xl">✓</span>
            <span>Algoritmos de pago optimizados que minimizan intereses</span>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">✓</span>
            <span>Soporte para ofertas promocionales de transferencia</span>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">✓</span>
            <span>Visualización clara del progreso de tu deuda</span>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">✓</span>
            <span>Guarda múltiples planes para comparar opciones</span>
          </div>
        </div>
      </div>
    </div>
  )
}
