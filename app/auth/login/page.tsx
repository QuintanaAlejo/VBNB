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
import { Shield, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      console.log("[v0] Intentando login con email:", email)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (authError) {
        console.error("[v0] Error en signInWithPassword:", authError)

        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("invalid_credentials")
        }

        if (authError.message.includes("Email not confirmed")) {
          throw new Error("email_not_confirmed")
        }

        // Error genérico
        throw new Error(authError.message)
      }

      if (!data.user) {
        throw new Error("No se pudo iniciar sesión")
      }

      console.log("[v0] Login exitoso, redirigiendo al dashboard...")

      // Redirigir al dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      console.error("[v0] Error en login:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión"

      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
        setError("connection")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">VBNB Seguros</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Ingresá tu email y contraseña para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error === "connection" ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">No se puede conectar a Supabase</p>
                    <p className="text-sm mb-3">
                      Hay un problema de conectividad con tu proyecto de Supabase. Esto puede deberse a credenciales
                      incorrectas o un proyecto pausado.
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                      <Link href="/auth/diagnostics">Ejecutar Diagnóstico</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : error === "invalid_credentials" ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Email o contraseña incorrectos</p>
                    <p className="text-sm mb-3">
                      Las credenciales ingresadas no son válidas. Si no tenés una cuenta, podés registrarte.
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                      <Link href="/auth/sign-up">Crear una cuenta</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : error === "email_not_confirmed" ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Email no confirmado</p>
                    <p className="text-sm">
                      Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada y hace clic en el
                      enlace de confirmación.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>

              <div className="text-center text-sm">
                ¿No tenés cuenta?{" "}
                <Link href="/auth/sign-up" className="underline underline-offset-4 hover:text-primary">
                  Registrate
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                ¿Problemas para conectar?{" "}
                <Link href="/auth/diagnostics" className="underline underline-offset-4 hover:text-primary">
                  Ejecutar diagnóstico
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
