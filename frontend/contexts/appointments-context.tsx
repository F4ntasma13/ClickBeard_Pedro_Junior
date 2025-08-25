"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAuth } from "./auth-context"

interface Appointment {
  id: string
  date: string
  time: string
  barber: string
  barberId: string
  specialty: string
  specialtyId: string
  duration: number
  price: number
  status: "scheduled" | "cancelled" | "completed"
  clientName?: string
  clientPhone?: string | null
  clientEmail?: string
  notes?: string
}

interface CreateAppointmentData {
  specialtyId: string
  barberId: string
  date: string
  time: string
  notes?: string
}

interface AppointmentsContextType {
  appointments: Appointment[]
  loading: boolean
  createAppointment: (data: CreateAppointmentData) => Promise<void>
  cancelAppointment: (appointmentId: string) => Promise<void>
  updateAppointmentStatus: (appointmentId: string, status: string) => Promise<void>
  fetchAppointments: () => Promise<void>
  fetchTodayAppointments: () => Promise<Appointment[]>
  fetchFutureAppointments: () => Promise<Appointment[]>
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined)

const normalizeStatus = (raw: unknown): Appointment["status"] => {
  const s = String(raw ?? "").toLowerCase()
  if (["scheduled", "agendado"].includes(s)) return "scheduled"
  if (["completed", "finalizado"].includes(s)) return "completed"
  if (["cancelled", "canceled", "cancelado"].includes(s)) return "cancelled"
  return "scheduled"
}

const toStr = (v: unknown) => (v == null ? "" : String(v))

const getArrayFromPayload = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.appointments)) return payload.appointments
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const normalizeAppointment = (apt: any): Appointment => {
  const barberObj = apt.barber ?? {}
  const specObj = apt.specialty ?? {}
  const userObj = apt.user ?? {}

  const date = apt.date ?? apt.appointment_date ?? ""
  const time = apt.time ?? apt.appointment_time ?? ""

  return {
    id: toStr(apt.id ?? apt.appointment_id),
    date,
    time,
    barber: toStr(barberObj.name ?? apt.barber_name ?? barberObj.fullName ?? ""),
    barberId: toStr(barberObj.id ?? apt.barber_id ?? ""),
    specialty: toStr(specObj.name ?? apt.specialty_name ?? ""),
    specialtyId: toStr(specObj.id ?? apt.specialty_id ?? ""),
    duration: Number(specObj.duration ?? apt.duration ?? 30),
    price: Number.parseFloat(toStr(specObj.price ?? apt.price ?? "0")),
    status: normalizeStatus(apt.status),
    clientName: toStr(userObj.name ?? apt.user_name ?? ""),
    clientPhone: userObj.phone ?? apt.user_phone ?? null,
    clientEmail: toStr(userObj.email ?? apt.user_email ?? ""),
    notes: toStr(apt.notes ?? ""),
  }
}

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const res = await fetch(`${apiUrl}/api${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers,
      },
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(json?.error || `API Error: ${res.status} ${res.statusText}`)
    }
    return json
  }

  const fetchAppointments = async () => {
    if (!user || !token) return
    setLoading(true)
    try {
      const endpoint = user.role === "admin" ? "/admin/appointments/today" : "/appointments/my-appointments"
      const data = await apiCall(endpoint)

      const list = getArrayFromPayload(data)

      const mapped = list.map(normalizeAppointment)
      setAppointments(mapped)
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const createAppointment = async (data: CreateAppointmentData) => {
    if (!user || !token) throw new Error("Usuário não autenticado")
    try {
      const body = {
        user_id: Number.parseInt(user.id),
        barber_id: Number.parseInt(data.barberId),
        specialty_id: Number.parseInt(data.specialtyId),
        appointment_date: data.date,
        appointment_time: data.time,
        notes: data.notes,
      }

      const created = await apiCall("/appointments", {
        method: "POST",
        body: JSON.stringify(body),
      })

      const raw = created?.appointment ?? created
      const mapped = normalizeAppointment(raw)
      setAppointments((prev) => [...prev, mapped])
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
      throw error
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    if (!user || !token) throw new Error("Usuário não autenticado")
    try {
      await apiCall(`/appointments/${appointmentId}/cancel`, { method: "PATCH" })
      setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, status: "cancelled" } : a)))
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error)
      throw error
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    if (!user || !token || user.role !== "admin") throw new Error("Acesso negado")
    try {
      await apiCall(`/appointments/${appointmentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: normalizeStatus(status) } : a)),
      )
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      throw error
    }
  }

  const fetchTodayAppointments = async (): Promise<Appointment[]> => {
    if (!user || !token || user.role !== "admin") return []
    try {
      const data = await apiCall("/admin/appointments/today")
      const list = getArrayFromPayload(data)
      return list.map(normalizeAppointment)
    } catch (error) {
      console.error("Erro ao carregar agendamentos de hoje:", error)
      return []
    }
  }

  const fetchFutureAppointments = async (): Promise<Appointment[]> => {
    if (!user || !token || user.role !== "admin") return []
    try {
      const data = await apiCall("/admin/appointments/future")
      const list = getArrayFromPayload(data)
      return list.map(normalizeAppointment)
    } catch (error) {
      console.error("Erro ao carregar agendamentos futuros:", error)
      return []
    }
  }

  useEffect(() => {
    if (user && token) {
      fetchAppointments()
    } else {
      setAppointments([])
    }

  }, [user?.id, user?.role, token])

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        loading,
        createAppointment,
        cancelAppointment,
        updateAppointmentStatus,
        fetchAppointments,
        fetchTodayAppointments,
        fetchFutureAppointments,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  )
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext)
  if (ctx === undefined) {
    throw new Error("useAppointments must be used within an AppointmentsProvider")
  }
  return ctx
}
