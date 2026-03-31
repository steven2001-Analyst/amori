// Real-time helper using polling (Socket.io requires custom server setup)
// This provides a clean API that can be swapped to Socket.io later

type MessageCallback = (message: any) => void

export function createRealtimeConnection(matchId: string, onMessage: MessageCallback) {
  let pollingInterval: ReturnType<typeof setInterval> | null = null
  let lastMessageId: string | null = null
  
  async function poll() {
    try {
      const res = await fetch(`/api/messages/room?matchId=${matchId}`)
      if (res.ok) {
        const data = await res.json()
        const messages = data.messages || []
        
        // Find new messages
        const newMessages = lastMessageId 
          ? messages.filter((m: any) => m.id > lastMessageId)
          : messages
        
        if (newMessages.length > 0) {
          lastMessageId = newMessages[newMessages.length - 1].id
          newMessages.forEach(onMessage)
        }
      }
    } catch {
      // silent
    }
  }

  function start() {
    poll() // immediate first poll
    pollingInterval = setInterval(poll, 3000)
  }

  function stop() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  return { start, stop }
}
