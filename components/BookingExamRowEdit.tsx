// components/BookingRowEdit.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBooking, BookingWithUser } from '@/lib/booking-examination/action'
import { generateTimeSlots, EXAMINATION_TYPES, BOOKING_STATUS, formatDateForInput } from '@/lib/booking-examination/utils/timeslot'

type BookingRowEditProps = {
  booking: BookingWithUser
  onCancel: () => void
}

export default function BookingRowEdit({ booking, onCancel }: BookingRowEditProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientName: booking.patientName,
    patientPhone: booking.patientPhone,
    examination: booking.examination,
    bookingDate: formatDateForInput(booking.bookingDate),
    timeSlot: booking.timeSlot,
    status: booking.status,
    notes: booking.notes || '',
  })

  const timeSlots = generateTimeSlots()

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const result = await updateBooking(booking.id, formData)

      if (result.success) {
        router.refresh()
        onCancel() // Exit edit mode
      } else {
        alert(result.error || 'Gagal update booking')
      }
    } catch (err) {
      alert('Terjadi kesalahan')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      {/* Tanggal & Jam */}
      <td className="px-6 py-4">
        <input
          type="date"
          name="bookingDate"
          value={formData.bookingDate}
          onChange={handleChange}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mb-1"
        />
        <select
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleChange}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        >
          {timeSlots.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
      </td>

      {/* Pasien */}
      <td className="px-6 py-4">
        <input
          type="text"
          name="patientName"
          value={formData.patientName}
          onChange={handleChange}
          placeholder="Nama"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mb-1"
        />
        <input
          type="text"
          name="patientPhone"
          value={formData.patientPhone}
          onChange={handleChange}
          placeholder="No HP"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </td>

      {/* Pemeriksaan */}
      <td className="px-6 py-4">
        <select
          name="examination"
          value={formData.examination}
          onChange={handleChange}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        >
          {EXAMINATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        >
          {BOOKING_STATUS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </td>

      {/* Petugas - Read Only */}
      <td className="px-6 py-4 text-sm text-gray-500">
        {booking.user.name}
      </td>

      {/* Keterangan */}
      <td className="px-6 py-4">
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Keterangan"
          rows={2}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
            title="Simpan"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
            title="Batal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </td>
    </>
  )
}