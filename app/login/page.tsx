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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <UserRound/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Selamat Datang</h1>
            <p className="text-gray-600 mt-2">Silakan login untuk melanjutkan</p>
          </div>

          {/* Login Form Component (Client) */}
          <LoginForm />

          {/* Default Credentials Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-2">Default Login (Development):</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• Username: <code className="bg-gray-200 px-2 py-0.5 rounded">admin</code></div>
              <div>• Password: <code className="bg-gray-200 px-2 py-0.5 rounded">admin123</code></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mt-6">
          <p>© 2025 <span className='text-rose-500 text-bold'>Wahyu lamani</span>. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}