import { getBookings } from '@/lib/booking-examination/action'
import DateFilter from '@/components/features/DateFilter'
import AddBookingButton from '@/components/ui/AddBookingButton'
import BookingTable from '@/components/BookingExamTable'
import FilterBar from '@/components/ui/FilterBar'
import CurrentUser from '@/components/ui/CurrentUser'

type PageProps = {
  searchParams: { 
    date?: string
    search?: string
    examination?: string
    status?: string
  }
}

export default async function DashboardPage({ searchParams }: PageProps) {
  // Fetch data di server component dengan filter
  const result = await getBookings(
    searchParams.date,
    searchParams.search,
    searchParams.examination,
    searchParams.status
  )

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
        <div className="mb-8 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Booking Pemeriksaan
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola booking pemeriksaan USG dan Treadmill
            </p>
          </div>
          <div>
            <CurrentUser/>
          </div>
        </div>

        {/* Date Filter */}
        <DateFilter />

        {/* Advanced Filter & Search */}
        <FilterBar />

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
        <BookingTable bookings={bookings} />

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <AddBookingButton />
        </div>
      </div>
    </div>
  )
}