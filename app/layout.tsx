import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import SessionProvider from '@/components/providers/SessionProvider'
import NavLinks from '@/components/NavLinks'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cards Traktor',
  description: 'Generador de planes de pago inteligentes para tarjetas de crédito',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es">
      <body className="bg-gray-50">
        <SessionProvider session={session}>
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">CT</span>
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-lg font-bold text-gray-900">Cards Traktor</span>
                    <span className="text-xs text-gray-500">Planificador de deuda</span>
                  </div>
                </Link>
                {session && (
                  <div className="hidden md:flex items-center gap-8">
                    <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/cards" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                      Mis tarjetas
                    </Link>
                    <Link href="/dashboard/plans" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                      Mis planes
                    </Link>
                  </div>
                )}
                <NavLinks />
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
