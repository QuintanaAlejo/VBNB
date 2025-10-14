"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Por favor completá todos los campos" }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[v0] Variables de entorno de Supabase no configuradas")
    return {
      error: "Error de configuración: Las credenciales de Supabase no están configuradas correctamente.",
    }
  }

  console.log("[v0] Intentando login con email:", email)
  console.log("[v0] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

  try {
    const supabase = await createClient()

    console.log("[v0] Cliente de Supabase creado, intentando signInWithPassword...")

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("[v0] Respuesta de signInWithPassword:", { data: !!data, error: error?.message })

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
      console.log("[v0] Usuario autenticado:", data.user.id)

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

      console.log("[v0] Login exitoso, redirigiendo al dashboard...")
    }
  } catch (error: unknown) {
    console.error("[v0] Error capturado en login:", error)

    if (error instanceof Error) {
      console.error("[v0] Mensaje de error:", error.message)
      console.error("[v0] Stack:", error.stack)

      if (error.message.includes("not valid JSON") || error.message.includes("Unexpected token")) {
        return {
          error:
            "Error de conexión con Supabase. Posibles causas:\n\n" +
            "1. El proyecto de Supabase está PAUSADO (muy común en proyectos gratuitos)\n" +
            "2. La URL o API key de Supabase son incorrectas\n" +
            "3. El proyecto de Supabase fue eliminado\n\n" +
            "Por favor verificá el estado de tu proyecto en https://supabase.com/dashboard",
        }
      }

      if (error.message.includes("fetch")) {
        return {
          error:
            "No se pudo conectar con el servidor. Verificá que:\n" +
            "1. El proyecto de Supabase esté activo\n" +
            "2. Las credenciales sean correctas\n" +
            "3. Tengas conexión a internet",
        }
      }

      return { error: `Error: ${error.message}` }
    }

    return { error: "Error de conexión. Por favor intentá nuevamente." }
  }

  redirect("/dashboard")
}
