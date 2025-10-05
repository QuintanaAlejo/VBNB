import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, FileText, Users, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">VBNB Seguros</h1>
          </div>
          <nav className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Registrarse</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 text-balance">Protegé lo que más importa</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          Seguros personalizados para vehículos, inmuebles y personas. Gestión simple, rápida y segura.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Comenzar Ahora</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#features">Conocer Más</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">¿Por qué elegir VBNB?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg border">
            <FileText className="h-12 w-12 text-primary mb-4" />
            <h4 className="text-xl font-semibold mb-2">Gestión Simple</h4>
            <p className="text-muted-foreground">Administrá tus pólizas, pagos y siniestros desde un solo lugar.</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <h4 className="text-xl font-semibold mb-2">Proceso Rápido</h4>
            <p className="text-muted-foreground">Registrate en minutos y accedé a tu cuenta inmediatamente.</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h4 className="text-xl font-semibold mb-2">Atención Personalizada</h4>
            <p className="text-muted-foreground">Nuestro equipo está disponible para ayudarte cuando lo necesites.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 VBNB Seguros. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
