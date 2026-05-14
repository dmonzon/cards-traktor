"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function NavLinks() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          {session.user.name ?? session.user.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/login"
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/auth/register"
        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
      >
        Registrarse
      </Link>
    </div>
  )
}
