import Link from 'next/link';
import { Barcode, Merge, MonitorCog, UnfoldHorizontal,  } from 'lucide-react';

export default function HomePage() {
  const apps = [
    {
      name: 'Merge Img & PDF',
      description: 'Combine multiple PDF and image files into one document',
      href: '/merge',
      icon: Merge,
      color: 'from-red-600 to-rose-600'
    },
    {
      name: 'Organize PDF',
      description: 'Upload PDF, rearrange pages, delete or rotate pages',
      href: '/organize-pdf',
      icon: UnfoldHorizontal,
      color: 'from-red-600 to-rose-600'
    },
    {
      name: 'Barcode Booking For BPJS',
      description: 'generate barcode booking for BJPS sample using data from KEU30',
      href: '/barcode-booking',
      icon: Barcode,
      color: 'from-red-600 to-rose-600'
    },
    // Tambahkan app helper lainnya di sini nanti
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
              <MonitorCog className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                App Helper Pramita Manado
              </h1>
              <p className="text-sm text-gray-600">Simple tools for everyday tasks</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Available Tools</h2>
        
        {/* Apps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.href}
                href={app.href}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {app.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {app.description}
                </p>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 <span className='text-rose-500 text-bold'>Wahyu lamani</span>. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}