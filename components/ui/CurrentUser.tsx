'use client'

import { useRouter } from 'next/navigation'
import { clearAuthCookie, getAuthUser } from '@/lib/authentication/prismaAuth'
import { useState, useEffect } from 'react'
import type { AuthUser } from '@/lib/authentication/prismaAuth'

export default function CurrentUser() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  // Get user from cookies on mount
  useEffect(() => {
    // Read from cookie
    getAuthUser().then(setUser)
  }, [])

  const handleLogout = async () => {
    await clearAuthCookie()
    router.push('/')
  }

  return (
        <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.username}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
  )
}