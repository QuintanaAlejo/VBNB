"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, AlertCircle } from "lucide-react"
import type { SignUpFormData } from "@/types/profile"

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    document_type: "DNI",
    document_number: "",
    birth_date: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
  })

  const handleChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      console.log("[v0] Iniciando registro de usuario...")

      let authData, authError
      try {
        const response = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.first_name,
              last_name: formData.last_name,
            },
          },
        })
        authData = response.data
        authError = response.error
      } catch (fetchError) {
        console.error("[v0] Error de conexión con Supabase:", fetchError)
        throw new Error(
          "No se puede conectar con Supabase. Posibles causas:\n\n" +
            "1. El proyecto de Supabase está PAUSADO (muy común en proyectos gratuitos)\n" +
            "   → Ve a https://supabase.com/dashboard y reactiva tu proyecto\n\n" +
            "2. Las credenciales de Supabase son incorrectas\n" +
            "   → Verifica SUPABASE_URL y SUPABASE_ANON_KEY en las variables de entorno\n\n" +
            "3. Problema de red o CORS\n" +
            "   → Verifica tu conexión a internet",
        )
      }

      if (authError) {
        if (authError.message.includes("User already registered")) {
          throw new Error("Este email ya está registrado. Intenta iniciar sesión.")
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error("No se pudo crear el usuario")
      }

      console.log("[v0] Usuario creado, verificando sesión...")

      if (!authData.session) {
        console.log("[v0] No hay sesión activa - confirmación de email requerida")
        setError(
          "Para usar esta demo, debes deshabilitar la confirmación de email en Supabase. Ve a Authentication > Providers > Email y desactiva 'Confirm email'.",
        )
        setIsLoading(false)
        return
      }

      console.log("[v0] Usuario creado con sesión activa, creando perfil...")

      try {
        const { error: profileError } = await supabase.rpc("create_profile", {
          user_id: authData.user.id,
          p_first_name: formData.first_name,
          p_last_name: formData.last_name,
          p_document_type: formData.document_type,
          p_document_number: formData.document_number,
          p_birth_date: formData.birth_date,
          p_phone: formData.phone,
          p_address: formData.address,
          p_city: formData.city,
          p_province: formData.province,
          p_postal_code: formData.postal_code,
        })

        if (profileError) throw profileError
      } catch (profileError) {
        console.error("[v0] Error al crear perfil:", profileError)
        throw new Error("Usuario creado pero hubo un error al crear el perfil. Intenta iniciar sesión.")
      }

      console.log("[v0] Perfil creado exitosamente, redirigiendo al dashboard...")

      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      console.error("[v0] Error en registro:", err)
      setError(err instanceof Error ? err.message : "Error al registrarse")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">VBNB Seguros</h1>
        </div>

        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">Configuración requerida para la demo:</p>
              <p>
                Asegúrate de deshabilitar la confirmación de email en Supabase: <br />
                <span className="font-mono text-xs">
                  Dashboard → Authentication → Providers → Email → Desactivar "Confirm email"
                </span>
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>Completá tus datos para registrarte en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos de acceso */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Datos de Acceso</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña *</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos personales */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Datos Personales</h3>
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="document_type">Tipo de Documento *</Label>
                    <Select
                      value={formData.document_type}
                      onValueChange={(value) => handleChange("document_type", value)}
                    >
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
                      placeholder="+54 9 11 1234-5678"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Dirección</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Calle y Número *</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Av. Corrientes 1234"
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>

              <div className="text-center text-sm">
                ¿Ya tenés cuenta?{" "}
                <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                  Iniciar Sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
