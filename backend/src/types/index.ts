export interface User {
  id: number
  name: string
  email: string
  password: string
  created_at: Date
  is_admin: boolean
}

export interface Admin {
  id: number
  name: string
  email: string
  password: string
  created_at: Date
  is_admin: boolean
}

export interface Barber {
  id: number
  name: string
  age: number
  hire_date: Date
  created_at: Date
}

export interface Specialty {
  id: number
  name: string
  description?: string
  price: number
  duration: number
  created_at: Date
}

export interface Appointment {
  id: number
  user_id: number
  barber_id: number
  specialty_id: number
  appointment_date: Date
  appointment_time: string
  status: "scheduled" | "completed" | "cancelled"
  created_at: Date
}

export interface AuthRequest extends Request {
  user?: User | Admin
  userId?: number
  userType?: "user" | "admin"
}
