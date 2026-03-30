import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const matchId = request.nextUrl.searchParams.get("matchId")
    if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 })

    const token = request.cookies.get("amori-token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const messages = await db.message.findMany({
      where: { matchId },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const matchId = request.nextUrl.searchParams.get("matchId")
    if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 })

    const token = request.cookies.get("amori-token")?.value
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const { content, type } = await request.json()
    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 })

    const message = await db.message.create({
      data: {
        matchId,
        senderId: payload.userId,
        content,
        type: type || "text",
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
