"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Users, Plus, Edit, Trash2, Calendar, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"
import { Alert, Snackbar } from "@mui/material"

interface Barber {
  id: string
  name: string
  age: number
  hireDate: string
  specialties: Specialty[]
  status: "active" | "inactive"
}

interface Specialty {
  id: string
  name: string
  duration: number
  price: number
}

export default function BarbersManagementPage() {
  const { user, token } = useAuth()
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error"
  }>({ open: false, message: "", severity: "error" })

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    hire_date: "",
  })
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

  const fetchBarbers = async () => {
    try {
      console.log("Buscando barbeiros...")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/barbers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      console.log("Response status barbeiros:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Dados barbeiros recebidos:", data)
        setBarbers(Array.isArray(data.barbers) ? data.barbers : [])
      } else {
        console.error("Erro na resposta barbeiros:", response.status)
        setBarbers([])
      }
    } catch (error) {
      console.error("Erro ao buscar barbeiros:", error)
      setBarbers([])
    }
  }

  const fetchSpecialties = async () => {
    try {
      console.log("Buscando especialidades...")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/specialties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      console.log("Response status especialidades:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Dados especialidades recebidos:", data)
        setSpecialties(Array.isArray(data.specialties) ? data.specialties : [])
      } else {
        console.error("Erro na resposta especialidades:", response.status)
        setSpecialties([])
      }
    } catch (error) {
      console.error("Erro ao buscar especialidades:", error)
      setSpecialties([])
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        await Promise.all([fetchBarbers(), fetchSpecialties()])
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
  }, [token])

  const handleAddBarber = async () => {
    try {
      if (!formData.name || !formData.age || !formData.hire_date) {
        setSnackbar({
          open: true,
          message: "Por favor, preencha todos os campos",
          severity: "error",
        })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/barbers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          age: Number.parseInt(formData.age),
          hire_date: formData.hire_date,
        }),
      })

      if (response.ok) {
        const newBarber = await response.json()
        setBarbers((prev) => [...prev, newBarber])
        setFormData({ name: "", age: "", hire_date: "" })
        setIsAddDialogOpen(false)

        setSnackbar({
          open: true,
          message: "Barbeiro cadastrado com sucesso",
          severity: "success",
        })
        
        fetchBarbers()
      } else {
        throw new Error("Erro ao cadastrar barbeiro")
      }
    } catch (error) {
      console.error("Erro ao cadastrar barbeiro:", error)
      setSnackbar({
        open: true,
        message: "Não foi possível cadastrar o barbeiro",
        severity: "error",
      })
    }
  }

  const handleEditBarber = async () => {
    try {
      if (!selectedBarber || !formData.name || !formData.age || !formData.hire_date) {
        setSnackbar({
          open: true,
          message: "Por favor, preencha todos os campos",
          severity: "error",
        })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/barbers/${selectedBarber.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          age: Number.parseInt(formData.age),
          hire_date: formData.hire_date,
          status: selectedBarber.status,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const updatedBarber = data.barber || data
        setBarbers((prev) =>
          prev.map((barber) =>
            barber.id === selectedBarber.id ? updatedBarber : barber
          )
        )

        setFormData({ name: "", age: "", hire_date: "" })
        setSelectedBarber(null)
        setIsEditDialogOpen(false)

        setSnackbar({
          open: true,
          message: "Barbeiro atualizado com sucesso",
          severity: "success",
        })
      } else {
        throw new Error("Erro ao atualizar barbeiro")
      }
    } catch (error) {
      console.error("Erro ao atualizar barbeiro:", error)
      setSnackbar({
        open: true,
        message: "Não foi possível atualizar o barbeiro",
        severity: "error",
      })
    }
  }

  const handleAssociateSpecialties = async () => {
    if (!selectedBarber || selectedSpecialties.length === 0) return;

    const idsToSend = selectedSpecialties.map(id => Number(id)).filter(id => !isNaN(id));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/barbers/${selectedBarber.id}/specialties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ specialties: idsToSend }),
        }
      );

      if (response.ok) {
        const updatedBarber = await response.json();
        setBarbers(prev => prev.map(b => b.id === selectedBarber.id ? updatedBarber.barber : b));
        setSelectedSpecialties([]);
        setSelectedBarber(null);
        setIsAssociateDialogOpen(false);
        setSnackbar({ 
          open: true,
          message: "Especialidades associadas ao barbeiro", 
          severity: "success" 
        });
      } else {
        throw new Error("Erro ao associar especialidades");
      }
    } catch (error) {
      console.error(error);
      setSnackbar({ 
        open: true, 
        message: "Não foi possível associar as especialidades", 
        severity: "error" 
      });
    }
  };

  const handleDeleteBarber = async (barberId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/barbers/${barberId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setBarbers((prev) => prev.filter((barber) => barber.id !== barberId))
        setSnackbar({
          open: true,
          message: "Barbeiro removido com sucesso",
          severity: "success",
        })
      } else {
        throw new Error("Erro ao remover barbeiro")
      }
    } catch (error) {
      console.error("Erro ao remover barbeiro:", error)
      setSnackbar({
        open: true,
        message: "Não foi possível remover o barbeiro",
        severity: "error",
      })
    }
  }

  const openEditDialog = (barber: Barber) => {
    setSelectedBarber(barber)
    setFormData({
      name: barber.name,
      age: barber.age.toString(),
      hire_date: barber.hireDate,
    })
    setIsEditDialogOpen(true)
  }

  const openAssociateDialog = (barber: Barber) => {
    setSelectedBarber(barber)
    setSelectedSpecialties(barber.specialties.map(s => String(s.id)));
    setIsAssociateDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
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
              <div className="flex items-center gap-4">
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-green-500" />
                  <h1 className="text-xl font-bold text-white">Gerenciar Barbeiros</h1>
                </div>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Barbeiro
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Cadastrar Novo Barbeiro</DialogTitle>
                    <DialogDescription className="text-slate-300">Preencha os dados do novo barbeiro</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">
                        Nome Completo
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Nome do barbeiro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age" className="text-white">
                        Idade
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Idade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hire_date" className="text-white">
                        Data de Contratação
                      </Label>
                      <Input
                        id="hire_date"
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddBarber} className="bg-green-600 hover:bg-green-700 text-white">
                        Cadastrar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">{barbers.length}</div>
                  <p className="text-slate-400">Total de Barbeiros</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {barbers.filter((b) => b.status === "active").length}
                  </div>
                  <p className="text-slate-400">Barbeiros Ativos</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-amber-500 mb-2">{specialties.length}</div>
                  <p className="text-slate-400">Especialidades Disponíveis</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Lista de Barbeiros</CardTitle>
                <CardDescription className="text-slate-300">Gerencie todos os barbeiros da barbearia</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
                    <p className="text-slate-400">Carregando barbeiros...</p>
                  </div>
                ) : barbers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">Nenhum barbeiro cadastrado</p>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Cadastrar Primeiro Barbeiro
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {barbers.map((barber) => (
                      <Card key={barber.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="space-y-3">
                          <div className="text-slate-300 text-sm">
                            <p>Idade: {barber.age} anos</p>
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Contratado em: {formatDate(barber.hireDate)}
                            </p>
                          </div>
                          <div>
                           <p className="text-slate-400 text-sm mb-2">Especialidades:</p>
                            <div className="flex flex-wrap gap-1">
                              {(barber.specialties ?? []).length > 0 ? (
                                (barber.specialties ?? []).map((specialty) => (
                                  <Badge key={specialty.id} variant="secondary" className="text-xs">
                                    {specialty.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-slate-500 text-xs">Nenhuma especialidade</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(barber)}
                              className="border-slate-600 text-slate-300 hover:bg-slate-600"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssociateDialog(barber)}
                              className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-slate-900"
                            >
                              Especialidades
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBarber(barber.id)}
                              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Barbeiro</DialogTitle>
              <DialogDescription className="text-slate-300">Atualize os dados do barbeiro</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName" className="text-white">
                  Nome Completo
                </Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="editAge" className="text-white">
                  Idade
                </Label>
                <Input
                  id="editAge"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="editHire_date" className="text-white">
                  Data de Contratação
                </Label>
                <Input
                  id="editHire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditBarber} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Atualizar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAssociateDialogOpen} onOpenChange={setIsAssociateDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Associar Especialidades</DialogTitle>
              <DialogDescription className="text-slate-300">
                Selecione as especialidades do barbeiro {selectedBarber?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">

              {specialties.map((specialty) => (
                <div key={specialty.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty.id}
                    checked={selectedSpecialties.includes(specialty.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSpecialties([...selectedSpecialties, specialty.id])
                      } else {
                        setSelectedSpecialties(selectedSpecialties.filter((id) => id !== specialty.id))
                      }
                    }}
                  />
                  <Label htmlFor={specialty.id} className="text-white flex-1">
                    {specialty.name}
                    <span className="text-slate-400 text-sm ml-2">
                      ({specialty.duration}min - R$ {specialty.price})
                    </span>
                  </Label>
                </div>
              ))}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAssociateSpecialties} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                  Associar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAssociateDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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