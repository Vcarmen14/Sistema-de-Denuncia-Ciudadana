import { NextResponse } from "next/server"
import { getSql } from "../../_lib/neon"
import { createSessionToken, verifyPassword, SessionPayload, COOKIE_NAME } from "../../_lib/auth"

const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
    }

    const sql = getSql()
    const [user] = await sql<{
      id: number
      email: string
      nombre: string | null
      rol: string | null
      password_hash: string
    }[]>`
      select id, email, nombre, rol, password_hash
      from usuarios
      where email = ${email}
      limit 1
    `

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const payload: SessionPayload = {
      uid: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    }

    const token = await createSessionToken(payload)

    const response = NextResponse.json({ usuario: payload })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return response
  } catch (err: any) {
    console.error("Error en login:", err)
    return NextResponse.json(
      { error: "Error en login", message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
