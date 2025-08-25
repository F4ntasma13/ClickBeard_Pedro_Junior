"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Scissors, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Alert, Snackbar } from "@mui/material"


interface DashboardStats {
  todayAppointments: number
  futureAppointments: number
  totalBarbers: number
  totalSpecialties: number
}

interface TodayAppointment {
  id: string
  time: string
  clientName: string
  barber: string
  specialty: string
  status: "confirmed" | "pending" | "completed"
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    futureAppointments: 0,
    totalBarbers: 0,
    totalSpecialties: 0,
  })
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth();
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error"
  }>({ open: false, message: "", severity: "error" })


  useEffect(() => {
    const fetchDashboardData = async () => {

      try {
        setLoading(true);
        
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const appointmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/appointments/today`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (statsResponse.ok && appointmentsResponse.ok) {
          const statsData = await statsResponse.json();
          const appointmentsData = await appointmentsResponse.json();

          const mockStats: DashboardStats = {
            todayAppointments: statsData.todayAppointments || 0,
            futureAppointments: statsData.futureAppointments || 0,
            totalBarbers: statsData.totalBarbers || 0,
            totalSpecialties: statsData.totalSpecialties || 0,
          }

          const mockTodayAppointments: TodayAppointment[] = appointmentsData.appointments?.map((apt: any) => ({
            id: apt.id.toString(),
            time: new Date(apt.date).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            clientName: apt.user?.name || "Cliente não informado",
            barber: apt.barber?.name || "Barbeiro não informado",
            specialty: apt.specialty?.name || "Serviço não informado",
            status: apt.status || "pending",
          })) || [];

          setStats(mockStats);
          setTodayAppointments(mockTodayAppointments);
        } else {
          throw new Error("Erro ao carregar dados do dashboard");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setSnackbar({
          open: true,
          message: "Não foi possível carregar os dados do dashboard",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const handleLogout = () => {
    logout()
    router.push("/")
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "confirmed":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
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
      default:
        return status
    }
  }

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scissors className="h-8 w-8 text-amber-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
                  <p className="text-slate-300 text-sm">Bem-vindo, {user?.name}</p>
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
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Agendamentos Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.todayAppointments}</div>
                <p className="text-xs text-slate-400">+2 desde ontem</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Agendamentos Futuros</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.futureAppointments}</div>
                <p className="text-xs text-slate-400">+5 esta semana</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Barbeiros Ativos</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalBarbers}</div>
                <p className="text-xs text-slate-400">Todos disponíveis</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Especialidades</CardTitle>
                <Scissors className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalSpecialties}</div>
                <p className="text-xs text-slate-400">Serviços disponíveis</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/admin/appointments/today">
              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer">
                <CardHeader className="text-center">
                  <Calendar className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <CardTitle className="text-white text-sm">Agendamentos de Hoje</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                    Ver Hoje
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/appointments/future">
              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer">
                <CardHeader className="text-center">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <CardTitle className="text-white text-sm">Agendamentos Futuros</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white bg-transparent"
                  >
                    Ver Futuros
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/barbers">
              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer">
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <CardTitle className="text-white text-sm">Gerenciar Barbeiros</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-transparent"
                  >
                    Gerenciar
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/specialties">
              <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer">
                <CardHeader className="text-center">
                  <Settings className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <CardTitle className="text-white text-sm">Gerenciar Especialidades</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent"
                  >
                    Gerenciar
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                Agendamentos de Hoje
              </CardTitle>
              <CardDescription className="text-slate-300">Acompanhe os agendamentos do dia atual</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Carregando agendamentos...</p>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum agendamento para hoje</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <Clock className="h-5 w-5 text-amber-500 mb-1" />
                          <span className="text-xs text-slate-400">{appointment.time}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{appointment.clientName}</h3>
                          <p className="text-slate-300 text-sm">{appointment.specialty}</p>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {appointment.barber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                          {getStatusText(appointment.status)}
                        </Badge>
                        {appointment.status === "pending" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Confirmar
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
    </ProtectedRoute>
  )
}
