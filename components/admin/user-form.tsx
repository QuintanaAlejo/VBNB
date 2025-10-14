"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser, updateUser } from "@/app/admin/users/actions"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Profile } from "@/types/profile"

interface UserFormProps {
  mode: "create" | "edit"
  user?: Profile
}

export function UserForm({ mode, user }: UserFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    let result
    if (mode === "create") {
      result = await createUser(formData)
    } else if (user) {
      result = await updateUser(user.id, formData)
    }

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      router.push("/admin/users")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">{error}</div>}

      {mode === "create" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required placeholder="usuario@ejemplo.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Nombre *</Label>
          <Input id="first_name" name="first_name" required defaultValue={user?.first_name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Apellido *</Label>
          <Input id="last_name" name="last_name" required defaultValue={user?.last_name} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="document_type">Tipo de Documento *</Label>
          <Select name="document_type" defaultValue={user?.document_type || "DNI"} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DNI">DNI</SelectItem>
              <SelectItem value="CUIT">CUIT</SelectItem>
              <SelectItem value="CUIL">CUIL</SelectItem>
              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document_number">Número de Documento *</Label>
          <Input id="document_number" name="document_number" required defaultValue={user?.document_number} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
        <Input id="birth_date" name="birth_date" type="date" required defaultValue={user?.birth_date} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+54 9 11 1234-5678"
          defaultValue={user?.phone}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección *</Label>
        <Input id="address" name="address" required defaultValue={user?.address} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad *</Label>
          <Input id="city" name="city" required defaultValue={user?.city} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Provincia *</Label>
          <Input id="province" name="province" required defaultValue={user?.province} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Código Postal *</Label>
          <Input id="postal_code" name="postal_code" required defaultValue={user?.postal_code} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user_type">Tipo de Usuario *</Label>
        <Select name="user_type" defaultValue={user?.user_type || "cliente"} required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="empleado">Empleado</SelectItem>
            <SelectItem value="administrador">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando..." : mode === "create" ? "Crear Usuario" : "Guardar Cambios"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/users")} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
