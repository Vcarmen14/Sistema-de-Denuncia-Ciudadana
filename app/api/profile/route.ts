import { NextResponse } from "next/server"
import { getSql } from "../_lib/neon"
import { requireUser, hashPassword } from "../_lib/auth"

export async function PATCH(req: Request) {
  const { user, errorResponse } = await requireUser()
  if (!user) return errorResponse!

  try {
    const { nombre, telefono, email, password } = await req.json()
    const sql = getSql()

    // Validar email único si se cambia
    if (email && email !== user.email) {
      const exist = await sql.unsafe(
        `SELECT 1 FROM usuarios WHERE email = $1 AND id <> $2`,
        [email, user.uid]
      )
      if (exist.length > 0) {
        return NextResponse.json({ error: "El email ya está en uso" }, { status: 409 })
      }
    }

    const updates: string[] = []
    const params: any[] = []
    let i = 1

    if (nombre !== undefined) {
      updates.push(`nombre = $${i++}`)
      params.push(nombre)
    }
    if (telefono !== undefined) {
      updates.push(`telefono = $${i++}`)
      params.push(telefono)
    }
    if (email !== undefined) {
      updates.push(`email = $${i++}`)
      params.push(email)
    }
    if (password) {
      const hash = await hashPassword(password)
      updates.push(`password_hash = $${i++}`)
      params.push(hash)
    }

    if (!updates.length) {
      return NextResponse.json({ success: true })
    }

    params.push(user.uid)
    const updateSQL = `UPDATE usuarios SET ${updates.join(", ")} WHERE id = $${i}`

    await sql.unsafe(updateSQL, params)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("PATCH /api/profile error:", e)
    return NextResponse.json({ error: "Error actualizando perfil" }, { status: 500 })
  }
}
