"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"

export default function NavLinks() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            {session.user.name ?? session.user.email}
            <span className="text-xs">▼</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{session.user.name ?? session.user.email}</p>
              </div>
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" })
                  setMenuOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/login"
        className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/auth/register"
        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
      >
        Registrarse
      </Link>
    </div>
  )
}
