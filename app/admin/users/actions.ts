"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Profile } from "@/types/profile"

export async function createUser(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const document_type = formData.get("document_type") as Profile["document_type"]
  const document_number = formData.get("document_number") as string
  const birth_date = formData.get("birth_date") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const city = formData.get("city") as string
  const province = formData.get("province") as string
  const postal_code = formData.get("postal_code") as string
  const user_type = formData.get("user_type") as Profile["user_type"]

  // Crear usuario en auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirmar el email
  })

  if (authError) {
    console.error("[v0] Error al crear usuario:", authError)
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "No se pudo crear el usuario" }
  }

  // Crear perfil usando la función RPC
  const { error: profileError } = await supabase.rpc("create_profile", {
    user_id: authData.user.id,
    profile_data: {
      first_name,
      last_name,
      document_type,
      document_number,
      birth_date,
      phone,
      address,
      city,
      province,
      postal_code,
      user_type,
    },
  })

  if (profileError) {
    console.error("[v0] Error al crear perfil:", profileError)
    return { error: profileError.message }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function updateUser(userId: string, formData: FormData) {
  const supabase = await createClient()

  const profileData = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    document_type: formData.get("document_type") as Profile["document_type"],
    document_number: formData.get("document_number") as string,
    birth_date: formData.get("birth_date") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    province: formData.get("province") as string,
    postal_code: formData.get("postal_code") as string,
    user_type: formData.get("user_type") as Profile["user_type"],
  }

  const { error } = await supabase.from("profiles").update(profileData).eq("id", userId)

  if (error) {
    console.error("[v0] Error al actualizar usuario:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // Primero eliminar el perfil
  const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

  if (profileError) {
    console.error("[v0] Error al eliminar perfil:", profileError)
    return { error: profileError.message }
  }

  // Luego eliminar el usuario de auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)

  if (authError) {
    console.error("[v0] Error al eliminar usuario de auth:", authError)
    return { error: authError.message }
  }

  revalidatePath("/admin/users")
  return { success: true }
}
