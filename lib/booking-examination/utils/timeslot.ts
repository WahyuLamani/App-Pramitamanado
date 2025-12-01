export type TimeSlot = {
    value: string // "10:00-10:20"
    label: string // "10:00 - 10:20"
  }
  
  /**
   * Generate time slots untuk booking
   * @param startHour - Jam mulai (default: 8)
   * @param endHour - Jam selesai (default: 16)
   * @param intervalMinutes - Durasi per slot dalam menit (default: 20)
   * @returns Array of time slots
   */
  export function generateTimeSlots(
    startHour: number = 8,
    endHour: number = 16,
    intervalMinutes: number = 10
  ): TimeSlot[] {
    const slots: TimeSlot[] = []
  
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Calculate end time
        let endMinute = minute + intervalMinutes
        let endHour = hour
        
        if (endMinute >= 60) {
          endMinute -= 60
          endHour += 1
        }
  
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
        
        // Stop if end time exceeds endHour
        if (endHour > endHour || (endHour === endHour && endMinute > 0)) {
          if (endHour > endHour) break
        }
  
        slots.push({
          value: `${startTime}-${endTime}`,
          label: `${startTime} - ${endTime}`,
        })
      }
    }
  
    return slots
  }
  
  /**
   * Daftar jenis pemeriksaan
   */
  export const EXAMINATION_TYPES = [
    { value: 'USG Upp & Low Abdomen', label: 'USG Upp & Low Abdomen' },
    { value: 'Echocardiografi', label: 'Echocardiografi' },
    { value: 'USG Testis', label: 'USG Testis' },
    { value: 'HSG', label: 'HSG' },
    { value: 'Treadmill', label: 'Treadmill' },
    { value: 'USG Lainnya', label: 'USG Lainnya' },
  ] as const
  
  /**
   * Daftar status booking
   */
  export const BOOKING_STATUS = [
    { value: 'Belum Registrasi', label: 'Belum Registrasi' },
    { value: 'Sudah Registrasi', label: 'Sudah Registrasi' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Batal', label: 'Batal' },
  ] as const
  
  /**
   * Format tanggal untuk input date
   */
  export function formatDateForInput(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toISOString().split('T')[0]
  }
  
  /**
   * Format tanggal untuk display (Indonesia)
   */
  export function formatDateDisplay(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }