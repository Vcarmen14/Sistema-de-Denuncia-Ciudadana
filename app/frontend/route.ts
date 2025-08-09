import { NextResponse } from "next/server"

export async function GET(req: Request) {
  // /frontend -> /frontend/index.html
  return NextResponse.redirect(new URL("/frontend/index.html", req.url))
}
