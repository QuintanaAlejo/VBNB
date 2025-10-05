"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Profile } from "@/types/profile"

interface ProfileFormProps {
  profile: Profile
  userEmail: string
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    document_type: profile.document_type,
    document_number: profile.document_number,
    birth_date: profile.birth_date,
    phone: profile.phone,
    address: profile.address,
    city: profile.city,
    province: profile.province,
    postal_code: profile.postal_code,
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          document_type: formData.document_type,
          document_number: formData.document_number,
          birth_date: formData.birth_date,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postal_code,
        })
        .eq("id", profile.id)

      if (updateError) throw updateError

      setSuccess(true)
      router.refresh()
    } catch (err: unknown) {
      console.error("[v0] Error al actualizar perfil:", err)
      setError(err instanceof Error ? err.message : "Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Personales</CardTitle>
        <CardDescription>Modificá tu información personal y de contacto</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (solo lectura) */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={userEmail} disabled />
            <p className="text-xs text-muted-foreground">El email no puede ser modificado</p>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
              />
            </div>
          </div>

          {/* Documento */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="document_type">Tipo de Documento *</Label>
              <Select value={formData.document_type} onValueChange={(value) => handleChange("document_type", value)}>
                <SelectTrigger id="document_type">
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
            <div className="grid gap-2">
              <Label htmlFor="document_number">Número de Documento *</Label>
              <Input
                id="document_number"
                type="text"
                required
                value={formData.document_number}
                onChange={(e) => handleChange("document_number", e.target.value)}
              />
            </div>
          </div>

          {/* Fecha de nacimiento y teléfono */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
              <Input
                id="birth_date"
                type="date"
                required
                value={formData.birth_date}
                onChange={(e) => handleChange("birth_date", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dirección</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Calle y Número *</Label>
                <Input
                  id="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="province">Provincia *</Label>
                  <Input
                    id="province"
                    type="text"
                    required
                    value={formData.province}
                    onChange={(e) => handleChange("province", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postal_code">Código Postal *</Label>
                  <Input
                    id="postal_code"
                    type="text"
                    required
                    value={formData.postal_code}
                    onChange={(e) => handleChange("postal_code", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500 rounded-md">
              <p className="text-sm text-green-600 dark:text-green-400">Perfil actualizado correctamente</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Guardando cambios..." : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
