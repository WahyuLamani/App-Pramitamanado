'use client'

import { useState } from 'react'
import { formatDateDisplay } from '@/lib/booking-examination/utils/timeslot'
import { BookingWithUser } from '@/lib/booking-examination/action'
import Modal from '@/components/ui/Modal'
import RescheduleForm from '@/components/RescheduleExamForm'
import BookingRowEdit from '@/components/BookingExamRowEdit'
import UpdateStatusForm from '@/components/BookingExamUpdateStatusForm'

type BookingTableProps = {
  bookings: BookingWithUser[]
}

export default function BookingTable({ bookings }: BookingTableProps) {
  const [isRescheduleMode, setIsRescheduleMode] = useState(false)
  const [isUpdateStatusMode, setIsUpdateStatusMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Toggle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(bookings.map(b => b.id))
    } else {
      setSelectedIds([])
    }
  }

  // Toggle single selection
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id))
    }
  }

  // Cancel reschedule mode
  const handleCancelReschedule = () => {
    setIsRescheduleMode(false)
    setSelectedIds([])
  }

  // Cancel update status mode
  const handleCancelUpdateStatus = () => {
    setIsUpdateStatusMode(false)
    setSelectedIds([])
  }

  // Open reschedule modal
  const handleOpenRescheduleModal = () => {
    if (selectedIds.length === 0) {
      alert('Pilih minimal 1 booking untuk di-reschedule')
      return
    }
    setIsRescheduleModalOpen(true)
  }

  // After reschedule success
  const handleRescheduleSuccess = () => {
    setIsRescheduleModalOpen(false)
    setIsRescheduleMode(false)
    setSelectedIds([])
  }

  // Open update status modal
  const handleOpenUpdateStatusModal = () => {
    if (selectedIds.length === 0) {
      alert('Pilih minimal 1 booking untuk update status')
      return
    }
    setIsUpdateStatusModalOpen(true)
  }

  // After update status success
  const handleUpdateStatusSuccess = () => {
    setIsUpdateStatusModalOpen(false)
    setIsUpdateStatusMode(false)
    setSelectedIds([])
  }

  // Handle edit mode
  const handleEditClick = (id: number) => {
    setEditingId(id)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const selectedBookings = bookings.filter(b => selectedIds.includes(b.id))

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Daftar Booking
          </h2>

          {/* Bulk Action Buttons */}
          <div className="flex gap-2">
            {!isRescheduleMode && !isUpdateStatusMode ? (
              <>
                <button
                  onClick={() => setIsRescheduleMode(true)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Reschedule Booking
                </button>
                <button
                  onClick={() => setIsUpdateStatusMode(true)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Update Status
                </button>
              </>
            ) : isRescheduleMode ? (
              <>
                <button
                  onClick={handleOpenRescheduleModal}
                  disabled={selectedIds.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Reschedule ({selectedIds.length})
                </button>
                <button
                  onClick={handleCancelReschedule}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Batal
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleOpenUpdateStatusModal}
                  disabled={selectedIds.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Status ({selectedIds.length})
                </button>
                <button
                  onClick={handleCancelUpdateStatus}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Batal
                </button>
              </>
            )}
          </div>
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
                  {(isRescheduleMode || isUpdateStatusMode) && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === bookings.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </th>
                  )}
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
                  {!isRescheduleMode && !isUpdateStatusMode && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr 
                    key={booking.id} 
                    className={`hover:bg-gray-50 ${
                      selectedIds.includes(booking.id) ? 'bg-blue-50' : ''
                    } ${editingId === booking.id ? 'bg-yellow-50' : ''}`}
                  >
                    {(isRescheduleMode || isUpdateStatusMode) && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(booking.id)}
                          onChange={(e) => handleSelectOne(booking.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                    )}
                    
                    {editingId === booking.id ? (
                      <BookingRowEdit
                        booking={booking}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <>
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
                        {!isRescheduleMode && !isUpdateStatusMode && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleEditClick(booking.id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title={`Reschedule ${selectedIds.length} Booking`}
        size="md"
      >
        <RescheduleForm
          bookingIds={selectedIds}
          bookings={selectedBookings}
          onSuccess={handleRescheduleSuccess}
          onCancel={() => setIsRescheduleModalOpen(false)}
        />
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setIsUpdateStatusModalOpen(false)}
        title={`Update Status ${selectedIds.length} Booking`}
        size="md"
      >
        <UpdateStatusForm
          bookingIds={selectedIds}
          bookings={selectedBookings}
          onSuccess={handleUpdateStatusSuccess}
          onCancel={() => setIsUpdateStatusModalOpen(false)}
        />
      </Modal>
    </>
  )
}