"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Por favor completá todos los campos" }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[v0] Error en signInWithPassword:", error)

      if (error.message.includes("Invalid login credentials")) {
        return { error: "Email o contraseña incorrectos" }
      }
      if (error.message.includes("Email not confirmed")) {
        return { error: "Debés confirmar tu email antes de iniciar sesión" }
      }

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
        console.log("[v0] Perfil no encontrado, intentando crear...")
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
          console.error("[v0] Error al crear perfil:", createError)
          return { error: "Error al crear el perfil. Por favor contactá al administrador." }
        }
      }
    }

    redirect("/dashboard")
  } catch (error: unknown) {
    console.error("[v0] Error de conexión en login:", error)

    if (error instanceof Error && error.message.includes("fetch")) {
      return {
        error:
          "No se pudo conectar con el servidor. Verificá que:\n1. El proyecto de Supabase esté activo\n2. Las credenciales sean correctas\n3. Tengas conexión a internet",
      }
    }

    return { error: "Error de conexión. Por favor intentá nuevamente." }
  }
}
