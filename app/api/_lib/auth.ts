import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export const COOKIE_NAME = "session"
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "tu_clave_secreta")
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

export type SessionPayload = {
  uid: number
  email: string
  nombre?: string | null
  rol?: string | null
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret)
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as SessionPayload
  } catch (err) {
    return null
  }
}

export async function requireUser() {
  const user = await getSession()
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      ),
    }
  }
  return { user, errorResponse: null }
}
