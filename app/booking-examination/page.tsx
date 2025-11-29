import { getBookings } from '@/lib/booking-examination/action'
import { formatDateDisplay } from '@/lib/booking-examination/utils/timeslot'
import DateFilter from '@/components/features/DateFilter'

import AddBookingButton from '@/components/ui/AddBookingButton'

type PageProps = {
  searchParams: { date?: string }
}

export default async function DashboardPage({ searchParams }: PageProps) {
  // Fetch data di server component dengan filter tanggal
  const result = await getBookings(searchParams.date)

  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{result.error}</p>
        </div>
      </div>
    )
  }

  const bookings = result.data || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Booking Pemeriksaan
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola booking pemeriksaan USG dan Treadmill
          </p>
        </div>

        {/* Date Filter */}
        <DateFilter />

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Booking</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {bookings.length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Belum Registrasi</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">
              {bookings.filter(b => b.status === 'Belum Registrasi').length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Sudah Registrasi</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {bookings.filter(b => b.status === 'Sudah Registrasi').length}
            </div>
          </div>
        </div>

        {/* Booking List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Daftar Booking
            </h2>
          </div>

          {bookings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Belum ada data booking</p>
              <p className="text-sm text-gray-400 mt-1">
                Klik tombol "Tambah Booking" untuk membuat booking baru
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal & Jam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pasien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pemeriksaan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Petugas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDateDisplay(booking.bookingDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.timeSlot}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.patientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.patientPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {booking.examination}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'Sudah Registrasi'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'Belum Registrasi'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {booking.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <AddBookingButton />
        </div>
      </div>
    </div>
  )
}