"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function SupabaseStatusChecker() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const supabase = createClient()

        // Intentar una operación simple para verificar conectividad
        const { error } = await supabase.from("profiles").select("count").limit(1).single()

        if (error && error.message.includes("Failed to fetch")) {
          setStatus("error")
          setErrorMessage("No se puede conectar con Supabase. El proyecto puede estar pausado.")
        } else {
          setStatus("connected")
        }
      } catch (error) {
        setStatus("error")
        setErrorMessage("Error de conexión con la base de datos.")
      }
    }

    checkConnection()
  }, [])

  if (status === "checking") {
    return null
  }

  if (status === "error") {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-md">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problema de Conexión</AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            {errorMessage}
            <div className="mt-2 space-y-1">
              <p className="font-semibold">Soluciones:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Verifica que tu proyecto de Supabase esté activo</li>
                <li>Ve a supabase.com/dashboard y reactiva el proyecto si está pausado</li>
                <li>Verifica las credenciales en las variables de entorno</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return null
}
