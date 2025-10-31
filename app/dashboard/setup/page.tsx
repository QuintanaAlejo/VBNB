import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SetupPage() {
  const supabase = await createClient()

  // Verificar si las tablas existen
  const checks = {
    profiles: false,
    policies: false,
    claims: false,
  }

  // Verificar tabla profiles
  try {
    const { error } = await supabase.from("profiles").select("id").limit(1)
    // PGRST205 = tabla no encontrada, PGRST204 = sin resultados (tabla existe pero vacía)
    checks.profiles = !error || error.code === "PGRST204"
  } catch (e) {
    checks.profiles = false
  }

  // Verificar tabla policies
  try {
    const { error } = await supabase.from("policies").select("id").limit(1)
    checks.policies = !error || error.code === "PGRST204"
  } catch (e) {
    checks.policies = false
  }

  // Verificar tabla claims
  try {
    const { error } = await supabase.from("claims").select("id").limit(1)
    checks.claims = !error || error.code === "PGRST204"
  } catch (e) {
    checks.claims = false
  }

  const allReady = checks.profiles && checks.policies && checks.claims

  const scripts = [
    { name: "001_create_users_table.sql", description: "Crea la tabla profiles y políticas RLS" },
    { name: "002_fix_profile_creation.sql", description: "Crea la función create_profile" },
    { name: "003_fix_rls_recursion.sql", description: "Corrige recursión en RLS" },
    { name: "004_reset_rls_policies.sql", description: "Resetea políticas RLS" },
    { name: "005_create_policies_tables.sql", description: "Crea tablas de pólizas" },
    { name: "006_admin_policies.sql", description: "Agrega políticas de administrador" },
    { name: "007_add_email_to_profiles.sql", description: "Agrega campo email a profiles" },
    { name: "008_update_create_profile_function.sql", description: "Actualiza función create_profile" },
    { name: "009_create_claims_table.sql", description: "Crea tabla de siniestros" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Configuración de Base de Datos</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Para que la aplicación funcione correctamente, necesitás ejecutar los scripts SQL en tu base de datos de
            Supabase.
          </p>
        </div>

        {/* Estado de las tablas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Estado de la Base de Datos</CardTitle>
            <CardDescription>Verificación de tablas y funciones necesarias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {checks.profiles ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <span className={checks.profiles ? "text-green-500" : "text-destructive"}>
                Tabla profiles {checks.profiles ? "existe" : "no existe"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {checks.policies ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <span className={checks.policies ? "text-green-500" : "text-destructive"}>
                Tabla policies {checks.policies ? "existe" : "no existe"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {checks.claims ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <span className={checks.claims ? "text-green-500" : "text-destructive"}>
                Tabla claims {checks.claims ? "existe" : "no existe"}
              </span>
            </div>
          </CardContent>
        </Card>

        {!allReady ? (
          <>
            {/* Instrucciones */}
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Acción Requerida</AlertTitle>
              <AlertDescription>
                Necesitás ejecutar los scripts SQL para crear las tablas y funciones necesarias en tu base de datos.
              </AlertDescription>
            </Alert>

            {/* Scripts a ejecutar */}
            <Card>
              <CardHeader>
                <CardTitle>Scripts SQL a Ejecutar</CardTitle>
                <CardDescription>Ejecutá estos scripts en orden desde la interfaz de v0</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Cómo ejecutar los scripts:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>En el chat de v0, buscá los botones "Run Script" debajo de cada script SQL</li>
                      <li>Hacé clic en cada botón en el orden listado abajo</li>
                      <li>Esperá a que cada script se ejecute correctamente antes de continuar con el siguiente</li>
                      <li>Una vez ejecutados todos los scripts, recargá esta página</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Scripts en orden:</h3>
                    <ol className="list-decimal list-inside space-y-2">
                      {scripts.map((script, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{script.name}</span>
                          <span className="text-muted-foreground ml-2">- {script.description}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      Si ya ejecutaste los scripts pero seguís viendo este mensaje, puede ser que haya un error en la
                      ejecución. Verificá los logs de cada script para ver si hubo errores.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                ¡Base de Datos Configurada!
              </CardTitle>
              <CardDescription>Todas las tablas y funciones necesarias están disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Tu base de datos está correctamente configurada. Podés continuar usando la aplicación.
              </p>
              <Button asChild>
                <Link href="/dashboard">Ir al Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
