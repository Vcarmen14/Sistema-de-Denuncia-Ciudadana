export type Usuario = {
  id: number
  email: string
  password_hash: string
  nombre: string | null
  telefono: string | null
  rol: "user" | "admin"
  fecha_registro: string
}


export type Notificacion = {
  id: number
  usuario_id: number
  titulo: string
  mensaje: string
  tipo: "info" | "advertencia" | "error" | "exito"
  leida: boolean
  fecha_creacion: string
}
