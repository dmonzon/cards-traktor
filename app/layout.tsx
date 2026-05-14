import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cards Traktor',
  description: 'Generador de planes de pago inteligentes para tarjetas de crédito',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-blue-600">Cards Traktor</h1>
            <p className="text-sm text-gray-600">Planificador inteligente de deuda</p>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
