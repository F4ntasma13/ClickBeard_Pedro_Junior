import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { AppointmentsProvider } from "@/contexts/appointments-context"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Click Beard - Sistema de Agendamentos",
  description: "Sistema completo para agendamento em barbearias - Desenvolvido por Pedro Junior",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="antialiased">
        <AuthProvider>
          <AppointmentsProvider>
            {children}
          </AppointmentsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
