import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserForm } from "@/components/admin/user-form"
import { notFound } from "next/navigation"
import type { Profile } from "@/types/profile"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", params.id).single<Profile>()

  if (error || !profile) {
    notFound()
  }

  // Obtener email del usuario
  const email = profile.email || ""

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">VBNB Seguros - Admin</h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Usuarios
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Editar Usuario</h2>
          <p className="text-muted-foreground">
            Modifica los datos del usuario {profile.first_name} {profile.last_name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos del Usuario</CardTitle>
            <CardDescription>Email: {email}</CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm mode="edit" user={profile} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
