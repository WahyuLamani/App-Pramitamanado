'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBooking, BookingWithUser } from '@/lib/booking-examination/action'
import { generateTimeSlots, formatDateForInput, formatDateDisplay } from '@/lib/booking-examination/utils/timeslot'

type RescheduleFormProps = {
  bookingIds: number[]
  bookings: BookingWithUser[]
  onSuccess: () => void
  onCancel: () => void
}

export default function RescheduleForm({ bookingIds, bookings, onSuccess, onCancel }: RescheduleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    bookingDate: formatDateForInput(new Date()),
    timeSlot: '',
  })

  const timeSlots = generateTimeSlots(8, 16, 20)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Update all selected bookings
      const updatePromises = bookingIds.map((id) =>
        updateBooking(id, {
          bookingDate: formData.bookingDate,
          timeSlot: formData.timeSlot,
        })
      )

      const results = await Promise.all(updatePromises)

      // Check if all updates succeeded
      const failedUpdates = results.filter((r) => !r.success)
      
      if (failedUpdates.length > 0) {
        setError(`${failedUpdates.length} booking gagal di-reschedule`)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
          Booking yang akan di-reschedule ({bookings.length}):
        </h4>
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          {bookings.map((booking) => (
            <li key={booking.id} className="text-sm text-blue-800">
              • {booking.patientName} - {formatDateDisplay(booking.bookingDate)} {booking.timeSlot}
            </li>
          ))}
        </ul>
      </div>

      {/* New Date */}
      <div>
        <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-2">
          Tanggal Baru <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="bookingDate"
          name="bookingDate"
          value={formData.bookingDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* New Time Slot */}
      <div>
        <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-2">
          Jam Baru <span className="text-red-500">*</span>
        </label>
        <select
          id="timeSlot"
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Pilih Jam</option>
          {timeSlots.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-yellow-800">
            Semua booking yang dipilih akan dipindahkan ke tanggal dan jam yang sama.
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
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
            'Reschedule Sekarang'
          )}
        </button>
      </div>
    </form>
  )
}