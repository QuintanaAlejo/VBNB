import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import type { ClaimWithPolicy } from "@/types/claim"

export default async function ClaimsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener siniestros del usuario con información de la póliza
  const { data: claims, error } = await supabase
    .from("claims")
    .select(
      `
      *,
      user_policy:user_policies!claims_policy_id_fkey(
        policy:policies(name, category, type)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error al obtener siniestros:", error)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pendiente: "secondary",
      en_revision: "default",
      aprobado: "default",
      rechazado: "destructive",
      cerrado: "outline",
    }
    return variants[status] || "default"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendiente: "Pendiente",
      en_revision: "En Revisión",
      aprobado: "Aprobado",
      rechazado: "Rechazado",
      cerrado: "Cerrado",
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Siniestros</h1>
            <p className="text-muted-foreground">Gestioná tus reportes de siniestros</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">Volver</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/claims/new">
                <Plus className="h-4 w-4 mr-2" />
                Reportar Siniestro
              </Link>
            </Button>
          </div>
        </div>

        {!claims || claims.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tenés siniestros reportados</h3>
              <p className="text-muted-foreground mb-4">Reportá un siniestro para comenzar el proceso de gestión</p>
              <Button asChild>
                <Link href="/dashboard/claims/new">Reportar Siniestro</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {claims.map((claim: ClaimWithPolicy) => (
              <Card key={claim.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{claim.user_policy?.policy?.name || "Póliza"}</CardTitle>
                      <CardDescription>
                        {claim.user_policy?.policy?.category} - {claim.user_policy?.policy?.type}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadge(claim.status)}>{getStatusLabel(claim.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                      <p className="text-sm">{claim.description}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Fecha del Incidente</p>
                        <p>{new Date(claim.incident_date).toLocaleString("es-AR")}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Fecha de Reporte</p>
                        <p>{new Date(claim.created_at).toLocaleString("es-AR")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
