import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserTable } from "@/components/admin/user-table"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Obtener todos los usuarios con sus perfiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error al obtener usuarios:", error)
  }

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
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Administración de Usuarios</h2>
            <p className="text-muted-foreground">Gestiona todos los usuarios del sistema (ABM completo)</p>
          </div>
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardDescription>Total de usuarios: {profiles?.length || 0}</CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable users={profiles || []} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
