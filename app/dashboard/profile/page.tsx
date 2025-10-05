import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProfileForm } from "@/components/profile-form"
import type { Profile } from "@/types/profile"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>()

  if (profileError) {
    console.error("[v0] Error al obtener perfil:", profileError)
    redirect("/dashboard")
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
          <Button asChild variant="outline">
            <Link href="/dashboard">Volver al Dashboard</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Mi Perfil</h2>
          <p className="text-muted-foreground">Actualizá tus datos personales y de contacto</p>
        </div>

        <ProfileForm profile={profile} userEmail={user.email || ""} />
      </main>
    </div>
  )
}
