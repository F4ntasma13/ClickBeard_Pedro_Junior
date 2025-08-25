"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CalendarIcon, Clock, User, Scissors, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Snackbar, Alert } from "@mui/material"

interface Specialty {
  id: string
  name: string
  duration: number
  price: number
}

interface Barber {
  id: string
  name: string
  specialties: string[]
}

interface TimeSlot {
  time: string
  available: boolean
}

interface AppointmentData {
  specialtyId: string
  barberId: string
  date: string
  time: string
}

export default function SchedulePage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("")
  const [selectedBarber, setSelectedBarber] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [fetchingTimes, setFetchingTimes] = useState(false)
  const [conflictError, setConflictError] = useState<string>("")
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error"
  }>({ open: false, message: "", severity: "error" })

  const fetchSpecialties = async () => {
    try {
      console.log("Buscando especialidades...")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/specialties`)

      if (response.ok) {
        const data = await response.json()
        setSpecialties(Array.isArray(data.specialties) ? data.specialties : [])
      } else {
        setSpecialties([])
      }
    } catch (error) {
      setSpecialties([])
    }
  }

  const fetchBarbers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers`)

      if (response.ok) {
        const data = await response.json()
        console.log("Dados teste:", data.barbers)
        setBarbers(Array.isArray(data.barbers) ? data.barbers : [])
      } else {
        console.error("Erro na resposta:", response.status)
        setBarbers([])
      }
    } catch (error) {
      console.error("Erro ao buscar barbeiros:", error)
      setBarbers([])
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        await Promise.all([fetchSpecialties(), fetchBarbers()])
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setSnackbar({
          open: true,
          message: "Não foi possível carregar os dados iniciais",
          severity: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!selectedBarber || !selectedDate) return

      try {
        setFetchingTimes(true)
        const dateString = selectedDate.toISOString().split("T")[0]

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/available-times?barberId=${selectedBarber}&date=${dateString}`
        )

        if (response.ok) {
          const data = await response.json()
          const normalized = (data.availableTimes || []).map((t: string) => ({
            time: t,
            available: true,
          }))
          setTimeSlots(normalized)
        } else {
          console.error("Erro ao buscar horários disponíveis")
          setSnackbar({
            open: true,
            message: "Não foi possível carregar os horários disponíveis",
            severity: "error",
          })
        }
      } catch (error) {
        console.error("Erro ao buscar horários:", error)
        setSnackbar({
          open: true,
          message: "Erro ao conectar com o servidor",
          severity: "error",
        })
      } finally {
        setFetchingTimes(false)
      }
    }

    fetchAvailableTimes()
  }, [selectedBarber, selectedDate])

  useEffect(() => {
    setConflictError("")
  }, [selectedSpecialty, selectedBarber, selectedDate, selectedTime])

  const getSelectedSpecialtyInfo = () => {
    return specialties.find((s) => s.id === selectedSpecialty)
  }

  const handleConfirmAppointment = async () => {
    if (!selectedSpecialty || !selectedBarber || !selectedDate || !selectedTime) {
      setSnackbar({
        open: true,
        message: "Por favor, preencha todos os campos",
        severity: "error",
      })
      return
    }

    setLoading(true)
    setConflictError("")

    try {
      const appointmentData: AppointmentData = {
        specialtyId: selectedSpecialty,
        barberId: selectedBarber,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(appointmentData),
        }
      )

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Seu horário foi agendado com sucesso",
          severity: "success",
        })
        router.push("/dashboard")
      } else {
        const errorData = await response.json()

        if (response.status === 409) {
          setConflictError(
            errorData.message ||
              "Este barbeiro já possui um agendamento neste horário. Por favor, escolha outro horário ou barbeiro."
          )
        } else {
          throw new Error(errorData.message || "Erro ao criar agendamento")
        }
      }
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error)

      if (!conflictError) {
        setSnackbar({
          open: true,
          message: "Este horario não está disponivel para agendamento",
          severity: "error",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Scissors className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-bold text-white">Agendar Horário</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {loading && !specialties.length ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Scissors className="h-5 w-5 text-amber-500" />
                      Escolher Especialidade
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {specialties.length} especialidades disponíveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione uma especialidade" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {Array.isArray(specialties) && specialties.length > 0 ? (
                          specialties.map((specialty) => (
                            <SelectItem key={specialty.id} value={specialty.id} className="text-white">
                              <div className="flex justify-between items-center w-full">
                                <span>{specialty.name}</span>
                                <div className="flex gap-2 ml-4">
                                  <Badge variant="secondary">{specialty.duration}min</Badge>
                                  <Badge className="bg-amber-500 text-slate-900">R$ {specialty.price}</Badge>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled className="text-slate-400">
                            Nenhuma especialidade disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {selectedSpecialty && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-amber-500" />
                        Selecionar Barbeiro
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione um barbeiro" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {Array.isArray(barbers) && barbers.length > 0 ? (
                            barbers.map((barber) => (
                              <SelectItem key={barber.id} value={barber.id} className="text-white">
                                <div className="flex justify-between items-center w-full">
                                  <span>{barber.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled className="text-slate-400">
                              Nenhuma barbeiro disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )}

                {selectedBarber && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-amber-500" />
                        Selecionar Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)

                          const selectedDateWithoutTime = new Date(date)
                          selectedDateWithoutTime.setHours(0, 0, 0, 0)

                          return selectedDateWithoutTime < today || date.getDay() === 0
                        }}
                        className="rounded-md border border-slate-600 bg-slate-700 text-white"
                      />
                    </CardContent>
                  </Card>
                )}

                {selectedDate && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        Selecionar Horário
                        {fetchingTimes && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      {fetchingTimes ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((slot) => (
                            <Button
                              key={slot.time}
                              variant={selectedTime === slot.time ? "default" : "outline"}
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`${
                                selectedTime === slot.time
                                  ? "bg-amber-500 text-slate-900"
                                  : slot.available
                                  ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                  : "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="lg:sticky lg:top-8">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Resumo do Agendamento</CardTitle>
                    <CardDescription className="text-slate-300">
                      Confirme os detalhes do seu agendamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedSpecialty && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-slate-300">Serviço:</span>
                        <span className="text-white font-medium">{getSelectedSpecialtyInfo()?.name}</span>
                      </div>
                    )}

                    {selectedBarber && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-slate-300">Barbeiro:</span>
                        <span className="text-white font-medium">
                          {barbers.find((b) => b.id === selectedBarber)?.name}
                        </span>
                      </div>
                    )}

                    {selectedDate && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-slate-300">Data:</span>
                        <span className="text-white font-medium">{selectedDate.toLocaleDateString("pt-BR")}</span>
                      </div>
                    )}

                    {selectedTime && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-slate-300">Horário:</span>
                        <span className="text-white font-medium">{selectedTime}</span>
                      </div>
                    )}

                    {selectedSpecialty && (
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                        <span className="text-slate-300">Duração:</span>
                        <span className="text-white font-medium">{getSelectedSpecialtyInfo()?.duration} min</span>
                      </div>
                    )}

                    {selectedSpecialty && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-300 text-lg">Total:</span>
                        <span className="text-amber-500 font-bold text-lg">R$ {getSelectedSpecialtyInfo()?.price}</span>
                      </div>
                    )}

                    {conflictError && (
                      <div className="bg-red-900/20 border border-red-700 rounded-md p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-red-300 text-sm">{conflictError}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleConfirmAppointment}
                      disabled={!selectedSpecialty || !selectedBarber || !selectedDate || !selectedTime || loading}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 mt-6"
                    >
                      {loading ? "Confirmando..." : "Confirmar Agendamento"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
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
  )
}
