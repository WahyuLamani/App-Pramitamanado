// components/DateFilter.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { formatDateForInput, formatDateDisplay } from '@/lib/booking-examination/utils/timeslot'

export default function DateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get current date from URL (no default to today)
  const currentDate = searchParams.get('date') || ''

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    
    // Update URL with new date
    const params = new URLSearchParams(searchParams)
    if (newDate) {
      params.set('date', newDate)
    } else {
      params.delete('date')
    }
    
    router.push(`?${params.toString()}`)
  }

  const handleToday = () => {
    const today = formatDateForInput(new Date())
    const params = new URLSearchParams(searchParams)
    params.set('date', today)
    router.push(`?${params.toString()}`)
  }

  const handleClear = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('date')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter Tanggal
          </label>
          <input
            type="date"
            id="date-filter"
            value={currentDate}
            onChange={handleDateChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2 sm:mt-6">
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium"
          >
            Hari Ini
          </button>
          
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            Semua
          </button>
        </div>
      </div>
      
      {currentDate ? (
        <div className="mt-3 text-sm text-gray-600">
          Menampilkan booking untuk: <span className="font-semibold">{formatDateDisplay(currentDate)}</span>
        </div>
      ) : (
        <div className="mt-3 text-sm text-gray-600">
          Menampilkan booking untuk: <span className="font-semibold">Semua Tanggal</span>
        </div>
      )}
    </div>
  )
}