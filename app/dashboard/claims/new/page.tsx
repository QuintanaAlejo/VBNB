import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { createClaim } from "../actions"
import type { UserPolicy } from "@/types/policy"

export default async function NewClaimPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener pólizas activas del usuario
  const { data: userPolicies, error } = await supabase
    .from("user_policies")
    .select(
      `
      *,
      policy:policies(*)
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "activa")

  if (error) {
    console.error("[v0] Error al obtener pólizas:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reportar Siniestro</h1>
          <p className="text-muted-foreground">Completá el formulario para reportar un siniestro</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Información del Siniestro</CardTitle>
            <CardDescription>Proporcioná los detalles del incidente</CardDescription>
          </CardHeader>
          <CardContent>
            {!userPolicies || userPolicies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No tenés pólizas activas para reportar un siniestro</p>
                <Button asChild>
                  <Link href="/dashboard/policies">Ver Pólizas Disponibles</Link>
                </Button>
              </div>
            ) : (
              <form action={createClaim} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="policy_id">Póliza Asociada *</Label>
                  <Select name="policy_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná una póliza" />
                    </SelectTrigger>
                    <SelectContent>
                      {userPolicies.map((up: UserPolicy & { policy: any }) => (
                        <SelectItem key={up.id} value={up.id}>
                          {up.policy.name} - {up.policy.category} ({up.policy.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incident_date">Fecha y Hora del Incidente *</Label>
                  <Input
                    type="datetime-local"
                    id="incident_date"
                    name="incident_date"
                    required
                    max={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del Siniestro *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describí detalladamente lo ocurrido..."
                    required
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Incluí todos los detalles relevantes del incidente para agilizar el proceso de gestión
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                    <Link href="/dashboard/claims">Cancelar</Link>
                  </Button>
                  <Button type="submit" className="flex-1">
                    Reportar Siniestro
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
