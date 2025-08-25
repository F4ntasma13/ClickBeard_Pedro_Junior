"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Clock, Users, Filter } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"
import { useAppointments } from "@/contexts/appointments-context"

interface FutureAppointment {
  id: string
  date: string
  time: string
  clientName: string
  barber: string
  specialty: string
  status: "scheduled" | "cancelled" | "completed"
}

interface Barber {
  id: string
  name: string
  status: string
}

export default function FutureAppointmentsPage() {
  const { fetchFutureAppointments } = useAppointments()
  const [appointments, setAppointments] = useState<FutureAppointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<FutureAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterBarber, setFilterBarber] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [barbersLoading, setBarbersLoading] = useState(true);

  useEffect(() => {
    const loadFutureAppointments = async () => {
      try {
        const data = await fetchFutureAppointments()
        setAppointments(data as FutureAppointment[])
        setFilteredAppointments(data as FutureAppointment[])
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFutureAppointments()
  }, [fetchFutureAppointments])

  useEffect(() => {
    let filtered = appointments

    if (filterBarber !== "all") {
      filtered = filtered.filter((apt) => apt.barber === filterBarber)
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((apt) => apt.status === filterStatus)
    }

    setFilteredAppointments(filtered)
  }, [appointments, filterBarber, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500"
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

  const groupAppointmentsByDate = () => {
    const grouped: { [key: string]: FutureAppointment[] } = {}
    filteredAppointments.forEach((appointment) => {
      if (!grouped[appointment.date]) {
        grouped[appointment.date] = []
      }
      grouped[appointment.date].push(appointment)
    })
    return grouped
  }

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setBarbersLoading(true)
        const token = localStorage.getItem("token")
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/barbers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const barbersData = await response.json()
          const barbersList = Array.isArray(barbersData) ? barbersData : barbersData.barbers || barbersData.data || []
          setBarbers(barbersList)
        } else {
          console.error("Erro ao buscar barbeiros")
        }
      } catch (error) {
        console.error("Erro ao carregar barbeiros:", error)
      } finally {
        setBarbersLoading(false)
      }
    }

    fetchBarbers()
  }, [])

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
                <Clock className="h-6 w-6 text-blue-500" />
                <h1 className="text-xl font-bold text-white">Agendamentos Futuros</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="h-5 w-5 text-amber-500" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Barbeiro</label>
                    <Select value={filterBarber} onValueChange={setFilterBarber}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all" className="text-white">
                          Todos os barbeiros
                        </SelectItem>
                        {barbers.map((barber) => (
                          <SelectItem key={barber.id} value={barber.name} className="text-white">
                            {barber.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-2 block">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all" className="text-white">
                          Todos os status
                        </SelectItem>
                        <SelectItem value="scheduled" className="text-white">
                          Agendados
                        </SelectItem>
                        <SelectItem value="completed" className="text-white">
                          Finalizados
                        </SelectItem>
                        <SelectItem value="cancelled" className="text-white">
                          Cancelados
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-400">Carregando agendamentos...</p>
              </div>
            ) : Object.keys(groupAppointmentsByDate()).length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum agendamento futuro encontrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupAppointmentsByDate()).map(([date, dayAppointments]) => (
                  <Card key={date} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white capitalize">{formatDate(date)}</CardTitle>
                      <CardDescription className="text-slate-300">
                        {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center">
                                <Clock className="h-5 w-5 text-blue-500 mb-1" />
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
                            <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
