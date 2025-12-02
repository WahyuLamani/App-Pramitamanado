'use server'

import { prisma, handlePrismaError } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Booking, User } from '@prisma/client'
import { getAuthUser } from '@/lib/authentication/prismaAuth'

// Type definitions
export type BookingWithUser = Booking & {
  user: {
    id: number
    name: string
    username: string
  }
}

export type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  details?: any
  message?: string
  count?: number
}

export type BookingInput = {
  patients: string | Array<{ name: string; phone: string }>
  examination: string
  bookingDate: string
  timeSlot: string
  status?: string
  notes?: string
}

export type BookingUpdateInput = {
  patientName?: string
  patientPhone?: string
  examination?: string
  bookingDate?: string
  timeSlot?: string
  status?: string
  notes?: string
}

// GET - Ambil semua bookings
export async function getBookings(
  date?: string,
  search?: string,
  examination?: string,
  status?: string
): Promise<ActionResponse<BookingWithUser[]>> {
  try {
    const where: any = {}

    // Filter by date
    if (date) {
      where.bookingDate = {
        gte: new Date(date + 'T00:00:00'),
        lt: new Date(date + 'T23:59:59'),
      }
    }

    // Search by patient name
    if (search) {
      where.patientName = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // Filter by examination type
    if (examination) {
      where.examination = examination
    }

    // Filter by status
    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: [{ bookingDate: 'asc' }, { timeSlot: 'asc' }],
    })

    return {
      success: true,
      data: bookings,
    }
  } catch (error) {
    const errorResponse = handlePrismaError(error)
    return {
      success: false,
      error: errorResponse.error,
      details: errorResponse.details,
    }
  }
}

// GET - Ambil booking by ID
export async function getBookingById(id: number): Promise<ActionResponse<BookingWithUser>> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    if (!booking) {
      return {
        success: false,
        error: 'Booking tidak ditemukan',
      }
    }

    return {
      success: true,
      data: booking,
    }
  } catch (error) {
    const errorResponse = handlePrismaError(error)
    return {
      success: false,
      error: errorResponse.error,
      details: errorResponse.details,
    }
  }
}

// CREATE - Buat booking baru (support multiple patients)
export async function createBooking(input: BookingInput): Promise<ActionResponse> {
  try {
    const { patients, examination, bookingDate, timeSlot, status, notes } = input

    // Validasi input
    if (!patients || !examination || !bookingDate || !timeSlot) {
      return {
        success: false,
        error: 'Data tidak lengkap',
        details: 'patients, examination, bookingDate, dan timeSlot wajib diisi',
      }
    }
    const authUser = await getAuthUser()
    if (!authUser) {
      return {
        success: false,
        error: 'Unauthorized',
        details: 'Anda harus login terlebih dahulu',
      }
    }

    // Parse patients (bisa array atau string dengan koma)
    let patientList: Array<{ name: string; phone: string }> = []

    if (typeof patients === 'string') {
      // Format: "Nama1|08123,Nama2|08456" atau "Nama1,Nama2"
      const patientsArray = patients.split(',').map((p) => p.trim())
      patientList = patientsArray.map((patient) => {
        const [name, phone] = patient.split('++').map((s) => s.trim())
        return {
          name,
          phone: phone || '-',
        }
      })
    } else if (Array.isArray(patients)) {
      patientList = patients
    } else {
      patientList = [patients]
    }

    // Validasi format tanggal
    const parsedDate = new Date(bookingDate)
    if (isNaN(parsedDate.getTime())) {
      return {
        success: false,
        error: 'Format tanggal tidak valid',
      }
    }

    const bookingsData = patientList.map((patient) => ({
      patientName: patient.name,
      patientPhone: patient.phone,
      examination,
      bookingDate: parsedDate,
      timeSlot,
      status: status || 'Belum Registrasi',
      notes: notes || null,
      userId: authUser.id,
    }))

    const createdBookings = await prisma.booking.createMany({
      data: bookingsData,
    })

    // Revalidate cache
    revalidatePath('/')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Berhasil membuat ${createdBookings.count} booking`,
      count: createdBookings.count,
    }
  } catch (error) {
    const errorResponse = handlePrismaError(error)
    return {
      success: false,
      error: errorResponse.error,
      details: errorResponse.details,
    }
  }
}

// UPDATE - Update booking (untuk reschedule atau update status)
export async function updateBooking(id: number, input: BookingUpdateInput): Promise<ActionResponse<BookingWithUser>> {
  try {
    const { patientName, patientPhone, examination, bookingDate, timeSlot, status, notes } = input

    // Build update data (hanya field yang dikirim)
    const updateData: any = {}

    if (patientName !== undefined) updateData.patientName = patientName
    if (patientPhone !== undefined) updateData.patientPhone = patientPhone
    if (examination !== undefined) updateData.examination = examination
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    // Validasi dan parse tanggal jika ada
    if (bookingDate !== undefined) {
      const parsedDate = new Date(bookingDate)
      if (isNaN(parsedDate.getTime())) {
        return {
          success: false,
          error: 'Format tanggal tidak valid',
        }
      }
      updateData.bookingDate = parsedDate
    }

    if (timeSlot !== undefined) updateData.timeSlot = timeSlot

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    // Revalidate cache
    revalidatePath('/')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Booking berhasil diupdate',
      data: updatedBooking,
    }
  } catch (error) {
    const errorResponse = handlePrismaError(error)
    return {
      success: false,
      error: errorResponse.error,
      details: errorResponse.details,
    }
  }
}

// DELETE - Hapus booking
export async function deleteBooking(id: number): Promise<ActionResponse> {
  try {
    await prisma.booking.delete({
      where: { id },
    })

    // Revalidate cache
    revalidatePath('/')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Booking berhasil dihapus',
    }
  } catch (error) {
    const errorResponse = handlePrismaError(error)
    return {
      success: false,
      error: errorResponse.error,
      details: errorResponse.details,
    }
  }
}

// DELETE MULTIPLE - Hapus multiple bookings
export async function deleteMultipleBookings(ids: number[]): Promise<ActionResponse> {
  try {
    const result = await prisma.booking.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    // Revalidate cache
    revalidatePath('/')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `${result.count} booking berhasil dihapus`,
      count: result.count,
    }
  } catch (error) {
    const errorResponse = handlePrismaError(error)
    return {
      success: false,
      error: errorResponse.error,
      details: errorResponse.details,
    }
  }
}