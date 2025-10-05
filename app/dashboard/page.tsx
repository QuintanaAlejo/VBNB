import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, User, FileText, CreditCard } from "lucide-react"
import Link from "next/link"
import type { Profile } from "@/types/profile"
import { signOut } from "@/app/auth/sign-out/actions"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Obtener perfil del usuario
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>()

  if (profileError) {
    console.error("[v0] Error al obtener perfil:", profileError)
    if (profileError.code === "PGRST116") {
      redirect("/dashboard/profile/edit")
    }
  }

  if (!profile) {
    console.error("[v0] Perfil no encontrado para usuario:", user.id)
    redirect("/dashboard/profile/edit")
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile?.first_name} {profile?.last_name}
            </span>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bienvenido, {profile?.first_name}</h2>
          <p className="text-muted-foreground">Gestioná tus pólizas y siniestros desde tu panel de control</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Perfil */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Mi Perfil</CardTitle>
              </div>
              <CardDescription>Administrá tus datos personales</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/profile">Ver Perfil</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pólizas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Mis Pólizas</CardTitle>
              </div>
              <CardDescription>Consultá tus coberturas activas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/dashboard/policies">Ver Pólizas</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pagos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-muted-foreground">Pagos</CardTitle>
              </div>
              <CardDescription>Disponible en próximos sprint</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full bg-transparent" variant="outline">
                Ver Pagos
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info del usuario */}
        {profile && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground">Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Tipo de Usuario</dt>
                  <dd className="capitalize">{profile.user_type}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Documento</dt>
                  <dd>
                    {profile.document_type} {profile.document_number}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Teléfono</dt>
                  <dd>{profile.phone}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
