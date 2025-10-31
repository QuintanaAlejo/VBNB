"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function DiagnosticsPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    envVars: { url: boolean; anonKey: boolean }
    connection: { success: boolean; error?: string }
  } | null>(null)

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const maskString = (str: string | undefined) => {
    if (!str) return "NO CONFIGURADA"
    if (str.length < 20) return "***"
    return `${str.substring(0, 10)}...${str.substring(str.length - 10)}`
  }

  const testConnection = async () => {
    setTesting(true)

    try {
      // Test 1: Check environment variables
      const envVars = {
        url: !!envUrl && envUrl.includes("supabase.co"),
        anonKey: !!envKey && envKey.length > 20,
      }

      // Test 2: Try to connect to Supabase
      let connection = { success: false, error: "" }

      if (envVars.url && envVars.anonKey) {
        try {
          console.log("[v0] Testing connection to Supabase...")
          const response = await fetch(`${envUrl}/rest/v1/`, {
            method: "GET",
            headers: {
              apikey: envKey!,
              Authorization: `Bearer ${envKey}`,
            },
          })

          console.log("[v0] Response status:", response.status)

          if (response.ok || response.status === 404) {
            // 404 is OK - means we connected but the endpoint doesn't exist
            connection = { success: true, error: "" }
          } else {
            const text = await response.text()
            console.log("[v0] Response text:", text)
            connection = {
              success: false,
              error: `HTTP ${response.status}: ${text.substring(0, 100)}`,
            }
          }
        } catch (error: any) {
          console.log("[v0] Connection error:", error)
          connection = {
            success: false,
            error: error.message || "Failed to fetch",
          }
        }
      }

      setResults({ envVars, connection })
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Diagnóstico de Supabase</h1>
          <p className="text-muted-foreground mt-2">Verifica la configuración y conectividad con Supabase</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Variables de Entorno</CardTitle>
            <CardDescription>
              Verifica que las credenciales de Supabase estén configuradas correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{maskString(envUrl)}</code>
                  {results?.envVars.url ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{maskString(envKey)}</code>
                  {results?.envVars.anonKey ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test de Conectividad</CardTitle>
            <CardDescription>Intenta conectarse a tu proyecto de Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Estado de la conexión:</span>
              <div className="flex items-center gap-2">
                {testing ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                    <span className="text-sm text-muted-foreground">Probando...</span>
                  </>
                ) : results?.connection.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Conectado</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-600 font-medium">Error de conexión</span>
                  </>
                )}
              </div>
            </div>

            {results?.connection.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Error:</strong> {results.connection.error}
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={testConnection} disabled={testing} className="w-full">
              <RefreshCw className={`h-4 w-4 mr-2 ${testing ? "animate-spin" : ""}`} />
              Probar Conexión Nuevamente
            </Button>
          </CardContent>
        </Card>

        {!results?.connection.success && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-semibold">Cómo resolver problemas de conexión:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Ve al{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Dashboard de Supabase
                    </a>
                  </li>
                  <li>Selecciona tu proyecto</li>
                  <li>
                    Ve a <strong>Settings → API</strong>
                  </li>
                  <li>
                    Copia la <strong>Project URL</strong> y la <strong>anon/public key</strong>
                  </li>
                  <li>
                    Actualiza las variables de entorno en la sección <strong>Vars</strong> del sidebar de v0
                  </li>
                  <li>Asegúrate de que el proyecto esté activo (no pausado)</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {results?.connection.success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <p className="font-semibold">¡Conexión exitosa!</p>
              <p className="text-sm mt-1">Tu proyecto de Supabase está configurado correctamente y es accesible.</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/auth/login">Volver al Login</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/dashboard">Ir al Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
