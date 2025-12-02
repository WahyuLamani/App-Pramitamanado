// app/login/page.tsx
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/authentication/prismaAuth'
import LoginForm from '@/components/ui/LoginForm'
import { UserRound } from 'lucide-react'

export default async function LoginPage() {
  // Check if already logged in
  const user = await getAuthUser()
  
  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              {/* <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg> */}
              <UserRound className='w-full'/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Selamat Datang</h1>
            <p className="text-gray-600 mt-2">Silakan login untuk melanjutkan</p>
          </div>

          {/* Login Form Component (Client) */}
          <LoginForm />

          {/* Default Credentials Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Default Login (Development):</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>• Username: <code className="bg-gray-200 px-2 py-0.5 rounded">admin</code></p>
              <p>• Password: <code className="bg-gray-200 px-2 py-0.5 rounded">admin123</code></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
            <p>© 2025 <span className='text-rose-500 text-bold'>Wahyu lamani</span>. All rights reserved.</p>
        </p>
      </div>
    </div>
  )
}