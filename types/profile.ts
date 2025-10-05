export interface Profile {
  id: string
  first_name: string
  last_name: string
  document_type: "DNI" | "CUIT" | "CUIL" | "Pasaporte"
  document_number: string
  birth_date: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
  user_type: "cliente" | "empleado" | "administrador"
  created_at: string
  updated_at: string
}

export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  first_name: string
  last_name: string
  document_type: "DNI" | "CUIT" | "CUIL" | "Pasaporte"
  document_number: string
  birth_date: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
}
