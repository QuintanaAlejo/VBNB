"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface AddPolicyButtonProps {
  policyId: string
  userId: string
  disabled?: boolean
  className?: string
}

export function AddPolicyButton({ policyId, userId, disabled, className }: AddPolicyButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentFrequency, setPaymentFrequency] = useState<"mensual" | "trimestral" | "anual">("mensual")
  const router = useRouter()

  const handleAddPolicy = async () => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("user_policies").insert({
      user_id: userId,
      policy_id: policyId,
      payment_frequency: paymentFrequency,
      status: "activa",
    })

    if (error) {
      console.error("[v0] Error al agregar póliza:", error)
      alert("Error al agregar la póliza. Por favor, intentá nuevamente.")
    } else {
      setOpen(false)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={disabled} className={className}>
        {disabled ? "Ya contratada" : "Contratar Póliza"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contratar Póliza</DialogTitle>
            <DialogDescription>Elegí la frecuencia de pago para tu nueva póliza</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label className="mb-4 block">Frecuencia de Pago</Label>
            <RadioGroup value={paymentFrequency} onValueChange={(value: any) => setPaymentFrequency(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mensual" id="mensual" />
                <Label htmlFor="mensual" className="cursor-pointer">
                  Mensual
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="trimestral" id="trimestral" />
                <Label htmlFor="trimestral" className="cursor-pointer">
                  Trimestral
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="anual" id="anual" />
                <Label htmlFor="anual" className="cursor-pointer">
                  Anual
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleAddPolicy} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
