import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { Policy, UserPolicy } from "@/types/policy"
import { AddPolicyButton } from "@/components/add-policy-button"

export default async function PoliciesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Obtener pólizas disponibles
  const { data: availablePolicies, error: policiesError } = await supabase
    .from("policies")
    .select("*")
    .order("category", { ascending: true })
    .order("type", { ascending: false })
    .returns<Policy[]>()

  // Obtener pólizas del usuario
  const { data: userPolicies, error: userPoliciesError } = await supabase
    .from("user_policies")
    .select(`
      *,
      policy:policies(*)
    `)
    .eq("user_id", user.id)
    .eq("status", "activa")
    .returns<(UserPolicy & { policy: Policy })[]>()

  if (policiesError) {
    console.error("[v0] Error al obtener pólizas:", policiesError)
  }

  if (userPoliciesError) {
    console.error("[v0] Error al obtener pólizas del usuario:", userPoliciesError)
  }

  const userPolicyIds = new Set(userPolicies?.map((up) => up.policy_id) || [])

  // Agrupar pólizas por categoría
  const policiesByCategory = availablePolicies?.reduce(
    (acc, policy) => {
      if (!acc[policy.category]) {
        acc[policy.category] = []
      }
      acc[policy.category].push(policy)
      return acc
    },
    {} as Record<string, Policy[]>,
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Premium":
        return "bg-amber-500"
      case "Elite":
        return "bg-blue-500"
      case "Básica":
        return "bg-slate-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">VBNB Seguros</h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Pólizas Disponibles</h2>
          <p className="text-muted-foreground">Elegí la póliza que mejor se adapte a tus necesidades</p>
        </div>

        {/* Mis Pólizas Activas */}
        {userPolicies && userPolicies.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4">Mis Pólizas Activas</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPolicies.map((userPolicy) => (
                <Card key={userPolicy.id} className="border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getTypeColor(userPolicy.policy.type)}>{userPolicy.policy.type}</Badge>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <CardTitle>{userPolicy.policy.name}</CardTitle>
                    <CardDescription>{userPolicy.policy.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{userPolicy.policy.description}</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Frecuencia de pago:</span>{" "}
                        <span className="capitalize">{userPolicy.payment_frequency}</span>
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span>{" "}
                        <Badge variant="outline" className="capitalize">
                          {userPolicy.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pólizas Disponibles por Categoría */}
        {policiesByCategory &&
          Object.entries(policiesByCategory).map(([category, policies]) => (
            <div key={category} className="mb-12">
              <h3 className="text-2xl font-bold mb-4">{category}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policies.map((policy) => {
                  const hasPolicy = userPolicyIds.has(policy.id)
                  return (
                    <Card key={policy.id} className={hasPolicy ? "opacity-60" : ""}>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getTypeColor(policy.type)}>{policy.type}</Badge>
                          {hasPolicy && <Badge variant="outline">Ya contratada</Badge>}
                        </div>
                        <CardTitle>{policy.name}</CardTitle>
                        <CardDescription>{policy.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{policy.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="text-sm">
                            <span className="font-medium">Cobertura:</span>
                            <p className="text-muted-foreground mt-1">{policy.coverage}</p>
                          </div>
                          {policy.franchise && (
                            <div className="text-sm">
                              <span className="font-medium">Franquicia:</span> $
                              {policy.franchise.toLocaleString("es-AR")}
                            </div>
                          )}
                        </div>
                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Mensual:</span>
                            <span className="font-bold">${policy.monthly_price.toLocaleString("es-AR")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Trimestral:</span>
                            <span className="font-bold">${policy.quarterly_price.toLocaleString("es-AR")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Anual:</span>
                            <span className="font-bold">${policy.annual_price.toLocaleString("es-AR")}</span>
                          </div>
                        </div>
                        <AddPolicyButton
                          policyId={policy.id}
                          userId={user.id}
                          disabled={hasPolicy}
                          className="w-full mt-4"
                        />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
      </main>
    </div>
  )
}
