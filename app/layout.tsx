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
          <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <Link href="/" className="flex flex-col">
                <span className="text-2xl font-bold text-blue-600">Cards Traktor</span>
                <span className="text-sm text-gray-600">Planificador inteligente de deuda</span>
              </Link>
              <NavLinks />
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
