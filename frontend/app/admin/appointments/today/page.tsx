"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Users, Phone, Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"
import { useAppointments } from "@/contexts/appointments-context"
import { Alert, Snackbar } from "@mui/material"

interface TodayAppointment {
  id: string
  time: string
  clientName: string
  clientPhone: string
  clientEmail: string
  barber: string
  specialty: string
  duration: number
  price: number
  status: "scheduled" | "cancelled" | "completed"
}

export default function TodayAppointmentsPage() {
  const { user } = useAuth()
  const { fetchTodayAppointments, updateAppointmentStatus } = useAppointments()
  const [appointments, setAppointments] = useState<TodayAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error"
  }>({ open: false, message: "", severity: "error" })

  useEffect(() => {
    const loadTodayAppointments = async () => {
      try {
        const data = await fetchTodayAppointments()
        setAppointments(data as TodayAppointment[])
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTodayAppointments()
  }, [fetchTodayAppointments])

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus)
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt)),
      )

      setSnackbar({
        open: true,
        message: "Erro ao conectar com o servidor",
        severity: "error",
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao conectar com o servidor",
        severity: "error",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "confirmed":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído"
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendente"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const todayDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="bg-slate-800 border-b border-slate-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-amber-500" />
                <div>
                  <h1 className="text-xl font-bold text-white">Agendamentos de Hoje</h1>
                  <p className="text-slate-300 text-sm capitalize">{todayDate}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{appointments.length}</div>
                  <p className="text-sm text-slate-400">Total</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {appointments.filter((a) => a.status === "completed").length}
                  </div>
                  <p className="text-sm text-slate-400">Concluídos</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {appointments.filter((a) => a.status === "scheduled").length}
                  </div>
                  <p className="text-sm text-slate-400">Confirmados</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {appointments.filter((a) => a.status === "cancelled").length}
                  </div>
                  <p className="text-sm text-slate-400">Pendentes</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Lista de Agendamentos</CardTitle>
                <CardDescription className="text-slate-300">Gerencie todos os agendamentos do dia</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">Carregando agendamentos...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Nenhum agendamento para hoje</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="p-6 bg-slate-700 rounded-lg border border-slate-600">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <Clock className="h-6 w-6 text-amber-500 mb-1" />
                              <span className="text-sm font-medium text-white">{appointment.time}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-white">{appointment.clientName}</h3>
                              <p className="text-slate-300">{appointment.specialty}</p>
                              <p className="text-slate-400 text-sm flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {appointment.barber}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <p className="text-slate-400 text-sm flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {appointment.clientPhone}
                            </p>
                            <p className="text-slate-400 text-sm flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {appointment.clientEmail}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-slate-400 text-sm">
                              Duração: <span className="text-white">{appointment.duration} min</span>
                            </p>
                            <p className="text-slate-400 text-sm">
                              Valor: <span className="text-amber-500 font-medium">R$ {appointment.price}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {appointment.status === "cancelled" && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(appointment.id, "confirmed")}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Confirmar
                            </Button>
                          )}
                          {appointment.status === "scheduled" && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(appointment.id, "completed")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Marcar como Concluído
                            </Button>
                          )}
                          {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(appointment.id, "cancelled")}
                              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white bg-transparent"
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </ProtectedRoute>
  )
}
