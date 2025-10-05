"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError || !profile) {
      // Try to create profile if it doesn't exist
      const { error: createError } = await supabase.rpc("create_profile", {
        user_id: data.user.id,
        p_email: data.user.email || "",
        p_first_name: "",
        p_last_name: "",
        p_document_type: "DNI",
        p_document_number: "",
        p_phone: "",
        p_address: "",
        p_city: "",
        p_province: "",
        p_postal_code: "",
        p_user_type: "cliente",
      })

      if (createError) {
        return { error: "Error al crear el perfil. Por favor contactá al administrador." }
      }
    }
  }

  redirect("/dashboard")
}
