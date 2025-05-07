import { NextResponse } from "next/server"
import generateSW from "../sw"

export function GET() {
  const serviceWorkerContent = generateSW()

  return new NextResponse(serviceWorkerContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
