// components/UpdateStatusForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBooking, BookingWithUser } from '@/lib/booking-examination/action'
import { BOOKING_STATUS, formatDateDisplay } from '@/lib/booking-examination/utils/timeslot'

type UpdateStatusFormProps = {
  bookingIds: number[]
  bookings: BookingWithUser[]
  onSuccess: () => void
  onCancel: () => void
}

export default function UpdateStatusForm({ bookingIds, bookings, onSuccess, onCancel }: UpdateStatusFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState('Sudah Registrasi')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Update all selected bookings
      const updatePromises = bookingIds.map((id) =>
        updateBooking(id, {
          status: newStatus,
        })
      )

      const results = await Promise.all(updatePromises)

      // Check if all updates succeeded
      const failedUpdates = results.filter((r) => !r.success)
      
      if (failedUpdates.length > 0) {
        setError(`${failedUpdates.length} booking gagal diupdate`)
      } else {
        router.refresh() // Refresh data
        onSuccess()
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Selected Bookings Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Booking yang akan diupdate ({bookings.length}):
        </h4>
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          {bookings.map((booking) => (
            <li key={booking.id} className="text-sm text-blue-800 flex justify-between items-center">
              <span>• {booking.patientName} - {formatDateDisplay(booking.bookingDate)} {booking.timeSlot}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                booking.status === 'Sudah Registrasi'
                  ? 'bg-green-100 text-green-800'
                  : booking.status === 'Belum Registrasi'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {booking.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* New Status */}
      <div>
        <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-2">
          Status Baru <span className="text-red-500">*</span>
        </label>
        <select
          id="newStatus"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {BOOKING_STATUS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Preview New Status */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-800">
            Semua booking yang dipilih akan diubah menjadi: <strong>{newStatus}</strong>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memproses...
            </>
          ) : (
            'Update Status Sekarang'
          )}
        </button>
      </div>
    </form>
  )
}