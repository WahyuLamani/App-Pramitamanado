// components/DeleteConfirmForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMultipleBookings, BookingWithUser } from '@/lib/booking-examination/action'
import { formatDateDisplay } from '@/lib/booking-examination/utils/timeslot'

type DeleteConfirmFormProps = {
  bookingIds: number[]
  bookings: BookingWithUser[]
  onSuccess: () => void
  onCancel: () => void
}

export default function DeleteConfirmForm({ bookingIds, bookings, onSuccess, onCancel }: DeleteConfirmFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await deleteMultipleBookings(bookingIds)

      if (result.success) {
        router.refresh() // Refresh data
        onSuccess()
      } else {
        setError(result.error || 'Gagal menghapus booking')
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Warning Message */}
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-red-900 mb-1">
              Perhatian! Tindakan ini tidak dapat dibatalkan
            </h4>
            <p className="text-sm text-red-800">
              Anda akan menghapus <strong>{bookings.length} booking</strong>. Data yang sudah dihapus tidak dapat dikembalikan.
            </p>
          </div>
        </div>
      </div>

      {/* Booking List to be Deleted */}
      <div className="border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Booking yang akan dihapus:
        </h4>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {bookings.map((booking) => (
            <li key={booking.id} className="text-sm text-gray-700 border-b border-gray-100 pb-2 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{booking.patientName}</div>
                  <div className="text-xs text-gray-500">{booking.patientPhone}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-700">
                    {formatDateDisplay(booking.bookingDate)}
                  </div>
                  <div className="text-xs text-gray-500">{booking.timeSlot}</div>
                </div>
              </div>
              <div className="mt-1 flex gap-2">
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                  {booking.examination}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  booking.status === 'Sudah Registrasi'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
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
          type="button"
          onClick={handleDelete}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Menghapus...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Ya, Hapus {bookings.length} Booking
            </>
          )}
        </button>
      </div>
    </div>
  )
}