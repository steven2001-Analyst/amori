import ChatRoomView from "@/components/chat/chat-room-view"

export default async function ChatRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ matchId?: string }>
}) {
  const { matchId } = await searchParams
  return <ChatRoomView matchId={matchId} />
}
