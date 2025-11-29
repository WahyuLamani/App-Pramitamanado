// components/BookingForm.tsx
'use client'

import { useState } from 'react'
import { createBooking } from '@/lib/booking-examination/action'
import { generateTimeSlots, EXAMINATION_TYPES, BOOKING_STATUS, formatDateForInput } from '@/lib/booking-examination/utils/timeslot'

type BookingFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

export default function BookingForm({ onSuccess, onCancel }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    patients: '',
    examination: 'USG Perut',
    bookingDate: formatDateForInput(new Date()),
    timeSlot: '',
    status: 'Belum Registrasi',
    notes: '',
  })

  const timeSlots = generateTimeSlots(8, 16, 20) // 08:00 - 16:00, interval 20 menit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await createBooking(formData)

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Gagal membuat booking')
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga')
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Patients Input */}
      <div>
        <label htmlFor="patients" className="block text-sm font-medium text-gray-700 mb-2">
          Nama Pasien <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="patients"
          name="patients"
          value={formData.patients}
          onChange={handleChange}
          placeholder="Budi Santoso|081234567890 atau pisahkan dengan koma untuk multiple"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Format: <code>Nama|NoHP</code> atau <code>Nama1|NoHP1,Nama2|NoHP2</code> untuk multiple
        </p>
      </div>

      {/* Examination Type */}
      <div>
        <label htmlFor="examination" className="block text-sm font-medium text-gray-700 mb-2">
          Jenis Pemeriksaan <span className="text-red-500">*</span>
        </label>
        <select
          id="examination"
          name="examination"
          value={formData.examination}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {EXAMINATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Booking <span className="text-red-500">*</span>
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

        <div>
          <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-2">
            Jam Booking <span className="text-red-500">*</span>
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
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {BOOKING_STATUS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Keterangan
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Keterangan tambahan (opsional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Menyimpan...
            </>
          ) : (
            'Simpan Booking'
          )}
        </button>
      </div>
    </form>
  )
}