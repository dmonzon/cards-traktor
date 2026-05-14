export default function Home() {
  return (
    <div className="grid gap-8">
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Bienvenido a Cards Traktor
        </h2>
        <p className="text-gray-600 mb-6">
          Genera planes de pago inteligentes para saldar tus tarjetas de crédito
          y pagar menos intereses.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Ingresa tus datos</h3>
            <p className="text-sm text-blue-700">Añade tus tarjetas con saldo e interés</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Elige estrategia</h3>
            <p className="text-sm text-green-700">Avalancha, bola de nieve u otra</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Visualiza el plan</h3>
            <p className="text-sm text-purple-700">Gráficos y timeline de pagos</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
        <p className="text-blue-900">
          🚀 La plataforma está en construcción. Próximamente podrás crear tu cuenta
          y generar tu primer plan de pago.
        </p>
      </div>
    </div>
  )
}
