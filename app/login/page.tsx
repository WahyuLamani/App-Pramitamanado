import LoginForm from '@/components/ui/LoginForm'
import { UserRound } from 'lucide-react'
import { Suspense } from 'react'
export default async function LoginPage() {
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
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mt-6">
          <p>© 2025 <span className='text-rose-500 text-bold'>Wahyu lamani</span>. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}