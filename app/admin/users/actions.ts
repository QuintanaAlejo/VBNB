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

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
      },
    },
  })

  if (authError) {
    console.error("[v0] Error al crear usuario:", authError)
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "No se pudo crear el usuario" }
  }

  const { error: profileError } = await supabase.rpc("create_profile", {
    user_id: authData.user.id,
    p_email: email,
    p_first_name: first_name,
    p_last_name: last_name,
    p_document_type: document_type,
    p_document_number: document_number,
    p_birth_date: birth_date,
    p_phone: phone,
    p_address: address,
    p_city: city,
    p_province: province,
    p_postal_code: postal_code,
    p_user_type: user_type,
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

  const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

  if (profileError) {
    console.error("[v0] Error al eliminar perfil:", profileError)
    return { error: profileError.message }
  }

  revalidatePath("/admin/users")
  return { success: true }
}
