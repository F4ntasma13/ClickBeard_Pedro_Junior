"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "user" | "admin"
}

const emptyUser: User = {
  id: "",
  name: "",
  email: "",
  phone: "",
  role: "admin"
}

interface AuthContextType {
  user: User
  token: string
  login: (email: string, password: string, isAdmin: boolean) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(emptyUser);
  const [token, setToken] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("token")
      if (savedToken) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL
          const response = await fetch(`${apiUrl}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            setToken(savedToken)
            setUser(userData)
          } else {
            localStorage.removeItem("token")
          }
        } catch (error) {

          try {
            const payload = JSON.parse(atob(savedToken.split(".")[1]))
            if (payload.exp > Date.now()) {
              setUser({
                id: payload.userId,
                name: payload.name,
                email: payload.email,
                role: payload.role,
              })
              setToken(savedToken)
            } else {
              localStorage.removeItem("token")
            }
          } catch {
            localStorage.removeItem("token")
          }
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])






const login = async (email: string, password: string, isAdmin: boolean = false) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const endpoint = isAdmin ? "/api/auth/admin/login" : "/api/auth/login"

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    console.log("Status:", response.status, response.statusText)

    const responseText = await response.text()
    console.log("Resposta bruta:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Erro ao parsear JSON:", parseError)
      throw new Error("Resposta inválida do servidor")
    }

    if (response.ok) {
      console.log("Dados parseados:", data)
      
      const { token: authToken, user: userData } = data

      if (isAdmin && userData.role !== 'admin' && userData.is_admin !== true) {
        throw new Error("Acesso permitido apenas para administradores")
      }
      
      if (!isAdmin && userData.role !== 'user' && userData.is_admin !== false) {
        throw new Error("Credenciais inválidas para cliente")
      }

      setToken(authToken)
      setUser(userData)
      localStorage.setItem("token", authToken)
      return userData 
    } else {

      throw new Error(data.error || data.message || "Erro na autenticação")
    }

  } catch (error) {
    console.error("Erro completo no login:", error)
    throw error
  }
}



  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      try {
        const response = await fetch(`${apiUrl}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password, phone }),
        })

        if (response.ok) {
          const data = await response.json()
          const { token: authToken, user: userData } = data

          setToken(authToken)
          setUser(userData)
          localStorage.setItem("token", authToken)
          return
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao criar conta")
        }
      } catch (apiError) {
        console.log("API não disponível, usando dados de teste")
      }

      const userData = {
        id: `user-${Date.now()}`,
        name,
        email,
        phone,
        role: "user" as const,
      }

      setUser(userData)

    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(emptyUser)
    setToken("")
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
