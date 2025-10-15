"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, Home } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Error en dashboard:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Error en el Dashboard</CardTitle>
          </div>
          <CardDescription>No se pudo cargar el dashboard correctamente</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Problema de Conexión</AlertTitle>
            <AlertDescription>
              {error.message.includes("fetch") || error.message.includes("Supabase")
                ? "No se puede conectar con la base de datos. Verifica que tu proyecto de Supabase esté activo."
                : error.message || "Ocurrió un error al cargar tus datos."}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button variant="outline" asChild>
            <a href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Inicio
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
