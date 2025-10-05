export type PolicyType = "Premium" | "Elite" | "Básica"
export type PolicyCategory = "Automóvil" | "Vivienda" | "Persona"
export type PolicyStatus = "activa" | "suspendida" | "cancelada"
export type PaymentFrequency = "mensual" | "trimestral" | "anual"

export interface Policy {
  id: string
  name: string
  type: PolicyType
  category: PolicyCategory
  description: string
  coverage: string
  monthly_price: number
  quarterly_price: number
  annual_price: number
  franchise: number | null
  created_at: string
  updated_at: string
}

export interface UserPolicy {
  id: string
  user_id: string
  policy_id: string
  status: PolicyStatus
  start_date: string
  end_date: string | null
  payment_frequency: PaymentFrequency
  created_at: string
  updated_at: string
  policy?: Policy
}
