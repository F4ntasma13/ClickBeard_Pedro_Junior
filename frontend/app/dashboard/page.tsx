"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Scissors, User, LogOut, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppointments } from "@/contexts/appointments-context"
import { Alert, Snackbar } from "@mui/material"
import { useState } from "react"


export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const { appointments, loading, cancelAppointment } = useAppointments()
  const router = useRouter()
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error"
  }>({ open: false, message: "", severity: "error" });


  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId)
      setSnackbar({
        open: true,
        message: "Seu agendamento foi cancelado com sucesso",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Não foi possível cancelar o agendamento",
        severity: "error",
      });
    }
  }
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") {
        return
      }
      setSnackbar((prev) => ({ ...prev, open: false }))
    }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado"
      case "completed":
        return "Finalizado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
console.log("Appointments no Dashboard:", appointments)

  return (
    // <ProtectedRoute requiredRole="client">
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scissors className="h-8 w-8 text-amber-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Click Beard</h1>
                <p className="text-slate-300 text-sm">Bem-vindo, {user.name}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="text-slate-300 hover:text-white">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/agendar">
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer">
              <CardHeader className="text-center">
                <Calendar className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <CardTitle className="text-white">Agendar Horário</CardTitle>
                <CardDescription className="text-slate-300">
                  Escolha seu barbeiro, especialidade e horário preferido
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <CardTitle className="text-white">Meus Agendamentos</CardTitle>
              <CardDescription className="text-slate-300">Visualize e gerencie seus agendamentos</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-white mb-2">{appointments.length}</p>
              <p className="text-slate-300 text-sm">Agendamentos ativos</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Próximos Agendamentos
            </CardTitle>
            <CardDescription className="text-slate-300">Seus agendamentos mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-400">Carregando agendamentos...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Você ainda não tem agendamentos</p>
                <Link href="/agendar">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                    Fazer Primeiro Agendamento
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter((apt) => apt.status !== "cancelled")
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <Calendar className="h-5 w-5 text-amber-500 mb-1" />
                          <span className="text-xs text-slate-400">
                            {new Date(appointment.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{appointment.specialty}</h3>
                          <p className="text-slate-300 text-sm">
                            {formatDate(appointment.date)} às {appointment.time}
                          </p>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {appointment.barber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                          {getStatusText(appointment.status)}
                        </Badge>
                        {appointment.status === "scheduled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment.id)}
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
    // </ProtectedRoute>
  )
}

