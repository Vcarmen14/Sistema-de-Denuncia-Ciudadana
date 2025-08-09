import { NextResponse } from "next/server"
import { getSql } from "../../_lib/neon"
import { createSessionToken, COOKIE_NAME, hashPassword } from "../../_lib/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "")
    const nombre = body.nombre ? String(body.nombre).trim() : null
    const telefono = body.telefono ? String(body.telefono).trim() : null

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }
    const sql = getSql()

    const exists = await sql<{ count: number }[]>`
      select count(*)::int as count from usuarios where email = ${email}
    `
    if (exists[0]?.count > 0) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })
    }

    const password_hash = await hashPassword(password)
    const rows = await sql<
      { id: number; email: string; nombre: string | null; rol: string | null }[]
    >`
      insert into usuarios (email, password_hash, nombre, telefono)
      values (${email}, ${password_hash}, ${nombre}, ${telefono})
      returning id, email, nombre, rol
    `
    const user = rows[0]

    const token = await createSessionToken({
      uid: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol ?? "user",
    })
    const res = NextResponse.json({ user }, { status: 201 })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error registrando usuario", message: err?.message || String(err) },
      { status: 500 }
    )
  }
}
