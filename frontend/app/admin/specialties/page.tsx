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
import { ArrowLeft, Settings, Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"
import { Alert, Snackbar } from "@mui/material"

interface Specialty {
  id: string
  name: string
  duration: number
  price: number
  status: "active" | "inactive"
  createdAt: string
}

export default function SpecialtiesManagementPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null)
  const [snackbar, setSnackbar] = useState<{
      open: boolean
      message: string
      severity: "success" | "error"
    }>({ open: false, message: "", severity: "error" });

  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    price: "",
  })

  useEffect(() => {
    fetchSpecialties()
  }, [])


  const fetchSpecialties = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/specialties`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Erro ao carregar especialidades")
      }

      const data = await response.json()
      setSpecialties(Array.isArray(data.specialties) ? data.specialties : [])
    } catch (error) {
      console.error("Erro ao carregar especialidades:", error)
      setSnackbar({
        open: true,
        message: "Não foi possível carregar as especialidades",
        severity: "error",
      });
    } finally {
      setLoading(false)
    }
  }


  const handleAddSpecialty = async () => {
  try {
    if (!formData.name || !formData.duration || !formData.price) {
      setSnackbar({
        open: true,
        message: "Por favor, preencha todos os campos",
        severity: "error",
      });
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/specialties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          duration: Number.parseInt(formData.duration),
          price: Number.parseFloat(formData.price),
        }),
      });

      if (response.ok) {
        const newSpecialty = await response.json();
        setSpecialties((prev) => [...prev, newSpecialty]);
        setFormData({ name: "", duration: "", price: "" });
        setIsAddDialogOpen(false);
        setSnackbar({
          open: true,
          message: "Especialidade cadastrada",
          severity: "success",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao cadastrar especialidade");
      }
    } catch (error) {
      console.error("Erro ao cadastrar especialidade:", error);
      setSnackbar({
        open: true,
        message: "Não foi possível cadastrar a especialidade",
        severity: "error",
      });
    }
  };

  const handleEditSpecialty = async () => {
    try {
      if (!selectedSpecialty || !formData.name || !formData.duration || !formData.price) {
        setSnackbar({
          open: true,
          message: "Por favor, preencha todos os campos",
          severity: "error",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/specialties/${selectedSpecialty.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          duration: Number.parseInt(formData.duration),
          price: Number.parseFloat(formData.price),
        }),
      });

      if (response.ok) {
        const updatedSpecialty = await response.json();
        setSpecialties((prev) =>
          prev.map((specialty) =>
            specialty.id === selectedSpecialty.id ? updatedSpecialty : specialty
          )
        );
        setFormData({ name: "", duration: "", price: "" });
        setSelectedSpecialty(null);
        setIsEditDialogOpen(false);

        setSnackbar({
          open: true,
          message: "Especialidade atualizada",
          severity: "success",
        });

      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar especialidade");
      }
    } catch (error) {
      console.error("Erro ao atualizar especialidade:", error);
      setSnackbar({
        open: true,
        message: "Não foi possível atualizar a especialidade",
        severity: "error",
      });
    }
  };

  const handleDeleteSpecialty = async (specialtyId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/specialties/${specialtyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setSpecialties((prev) => prev.filter((specialty) => specialty.id !== specialtyId));
        setSnackbar({
          open: true,
          message: "Especialidade removida",
          severity: "error",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao remover especialidade");
      }
    } catch (error) {
      console.error("Erro ao remover especialidade:", error);
      setSnackbar({
        open: true,
        message: "Não foi possível remover a especialidade",
        severity: "error",
      });
    }
  };

  const openEditDialog = (specialty: Specialty) => {
    setSelectedSpecialty(specialty)
    setFormData({
      name: specialty.name,
      duration: specialty.duration.toString(),
      price: specialty.price.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const totalRevenue = specialties?.reduce((sum, specialty) => sum + Number(specialty.price), 0) || 0;
  const averageDuration =
  specialties && specialties.length > 0 
    ? specialties.reduce((sum, s) => sum + Number(s.duration), 0) / specialties.length
    : 0;


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
                  <Settings className="h-6 w-6 text-purple-500" />
                  <h1 className="text-xl font-bold text-white">Gerenciar Especialidades</h1>
                </div>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Especialidade
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Cadastrar Nova Especialidade</DialogTitle>
                    <DialogDescription className="text-slate-300">
                      Preencha os dados da nova especialidade
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">
                        Nome da Especialidade
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Ex: Corte + Barba"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-white">
                        Duração (minutos)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price" className="text-white">
                        Preço (R$)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="25.00"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddSpecialty} className="bg-purple-600 hover:bg-purple-700 text-white">
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
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">{specialties.length}</div>
                  <p className="text-slate-400">Total de Especialidades</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {specialties.filter((s) => s.status === "active").length}
                  </div>
                  <p className="text-slate-400">Especialidades Ativas</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-amber-500 mb-2">{Math.round(averageDuration)}</div>
                  <p className="text-slate-400">Duração Média (min)</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">R$ {totalRevenue}</div>
                  <p className="text-slate-400">Receita Total</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Lista de Especialidades</CardTitle>
                <CardDescription className="text-slate-300">
                  Gerencie todas as especialidades da barbearia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">Carregando especialidades...</p>
                  </div>
                ) : specialties.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">Nenhuma especialidade cadastrada</p>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Cadastrar Primeira Especialidade
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {specialties.map((specialty) => (
                      <Card key={specialty.id} className="bg-slate-700 border-slate-600">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-lg">{specialty.name}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-500" />
                              <span className="text-slate-300 text-sm">{specialty.duration} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="text-slate-300 text-sm">R$ {specialty.price}</span>
                            </div>
                          </div>
                          <div className="text-slate-400 text-xs">Criada em: {formatDate(specialty.createdAt)}</div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(specialty)}
                              className="border-slate-600 text-slate-300 hover:bg-slate-600"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSpecialty(specialty.id)}
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
              <DialogTitle className="text-white">Editar Especialidade</DialogTitle>
              <DialogDescription className="text-slate-300">Atualize os dados da especialidade</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName" className="text-white">
                  Nome da Especialidade
                </Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="editDuration" className="text-white">
                  Duração (minutos)
                </Label>
                <Input
                  id="editDuration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="editPrice" className="text-white">
                  Preço (R$)
                </Label>
                <Input
                  id="editPrice"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditSpecialty} className="bg-blue-600 hover:bg-blue-700 text-white">
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
