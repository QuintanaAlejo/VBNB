"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createClaim(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const policyId = formData.get("policy_id") as string
  const description = formData.get("description") as string
  const incidentDate = formData.get("incident_date") as string

  if (!policyId || !description || !incidentDate) {
    return { error: "Todos los campos son requeridos" }
  }

  const { data, error } = await supabase
    .from("claims")
    .insert({
      user_id: user.id,
      policy_id: policyId,
      description,
      incident_date: incidentDate,
      status: "pendiente",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error al crear siniestro:", error)
    return { error: "Error al crear el siniestro" }
  }

  revalidatePath("/dashboard/claims")
  return { success: true, data }
}
