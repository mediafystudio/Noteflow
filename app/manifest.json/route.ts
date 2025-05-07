import { NextResponse } from "next/server"
import manifest from "../manifest"

export function GET() {
  return NextResponse.json(manifest())
}
