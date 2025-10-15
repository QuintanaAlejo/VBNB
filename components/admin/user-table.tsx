"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteUser } from "@/app/admin/users/actions"
import { useState } from "react"
import type { Profile } from "@/types/profile"

export function UserTable({ users }: { users: Profile[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${userName}?`)) {
      return
    }

    setDeletingId(userId)
    const result = await deleteUser(userId)
    setDeletingId(null)

    if (result.error) {
      alert(`Error al eliminar usuario: ${result.error}`)
    }
  }

  const getUserTypeBadge = (userType: Profile["user_type"]) => {
    const variants = {
      cliente: "default",
      empleado: "secondary",
      administrador: "destructive",
    } as const

    return <Badge variant={variants[userType]}>{userType.charAt(0).toUpperCase() + userType.slice(1)}</Badge>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email || "N/A"}</TableCell>
                <TableCell>
                  {user.document_type} {user.document_number}
                </TableCell>
                <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.id, `${user.first_name} ${user.last_name}`)}
                      disabled={deletingId === user.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
