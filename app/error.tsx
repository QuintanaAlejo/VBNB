"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Error capturado por Error Boundary:", error)
  }, [error])

  const isSupabaseError =
    error.message.includes("Failed to fetch") || error.message.includes("fetch") || error.message.includes("Supabase")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Error de Conexión</CardTitle>
          </div>
          <CardDescription>Hubo un problema al conectarse con el servidor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSupabaseError ? (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Problema de Conexión con Supabase</AlertTitle>
                <AlertDescription>
                  No se puede conectar con la base de datos. Esto generalmente ocurre cuando:
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-1">1. Proyecto de Supabase Pausado</h4>
                  <p className="text-muted-foreground">
                    Los proyectos gratuitos de Supabase se pausan automáticamente después de 1 semana de inactividad.
                  </p>
                  <p className="text-muted-foreground mt-1">
                    <strong>Solución:</strong> Ve a{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      tu dashboard de Supabase
                      <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    y reactiva el proyecto.
                  </p>
                </div>

                <div className="border-l-4 border-muted pl-4">
                  <h4 className="font-semibold mb-1">2. Credenciales Incorrectas</h4>
                  <p className="text-muted-foreground">
                    Las variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY pueden ser incorrectas.
                  </p>
                  <p className="text-muted-foreground mt-1">
                    <strong>Solución:</strong> Verifica las variables de entorno en la sección "Vars" del sidebar.
                  </p>
                </div>

                <div className="border-l-4 border-muted pl-4">
                  <h4 className="font-semibold mb-1">3. Problema de Red</h4>
                  <p className="text-muted-foreground">Puede haber un problema temporal de conectividad.</p>
                  <p className="text-muted-foreground mt-1">
                    <strong>Solución:</strong> Espera unos minutos e intenta nuevamente.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Inesperado</AlertTitle>
              <AlertDescription>{error.message || "Ocurrió un error inesperado"}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Intentar Nuevamente
          </Button>
          <Button variant="outline" asChild>
            <a href="/auth/login">Volver al Login</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
