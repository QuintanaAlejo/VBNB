export type ClaimStatus = "pendiente" | "en_revision" | "aprobado" | "rechazado" | "cerrado"

export interface Claim {
  id: string
  user_id: string
  policy_id: string
  description: string
  incident_date: string
  status: ClaimStatus
  created_at: string
  updated_at: string
}

export interface ClaimWithPolicy extends Claim {
  user_policy?: {
    policy?: {
      name: string
      category: string
      type: string
    }
  }
}
