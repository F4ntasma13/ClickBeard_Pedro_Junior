"use client"

import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scissors, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, Snackbar } from "@mui/material"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error"
  }>({ open: false, message: "", severity: "error" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password, true)
      setSnackbar({
        open: true,
        message: "Login realizado com sucesso!",
        severity: "success",
      });
      if (user.role === "user") {
        router.push("/dashboard")

      } else {
        router.push("/admin/dashboard")
        
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Credenciais inválidas",
        severity: "error",
      });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scissors className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-white">Click Beard</h1>
          </div>
          <CardTitle className="text-white">Fazer Login</CardTitle>
          <CardDescription className="text-slate-300">
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Não tem uma conta?{" "}
              <Link href="/auth/register" className="text-amber-500 hover:text-amber-400">
                Cadastre-se
              </Link>
            </p>
            <Link href="/" className="text-slate-400 hover:text-white text-sm mt-2 block">
              Voltar ao início
            </Link>
          </div>
        </CardContent>
      </Card>
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
