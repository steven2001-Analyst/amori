import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qysepabvnoftgtisqdic.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2VwYWJ2bm9mdGd0aXNxZGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTc0NzR9.CYYAQ5kJ7H5-qqZFr_vyMr7bQ7fOwT3K8iSFH0a6K60'

// Realtime client for subscriptions (client-side only)
export function createRealtimeClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  })
}

export function subscribeToMessages(matchId: string, onNewMessage: (message: any) => void) {
  const client = createRealtimeClient()
  const channel = client.channel('chat-' + matchId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'Message',
      filter: 'matchId=eq.' + matchId,
    }, (payload: { new: any }) => {
      onNewMessage(payload.new)
    })
    .subscribe()

  return () => { client.removeChannel(channel) }
}

export function subscribeToNotifications(userId: string, onNewNotification: (notification: any) => void) {
  const client = createRealtimeClient()
  const channel = client.channel('notifications-' + userId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'Notification',
      filter: 'userId=eq.' + userId,
    }, (payload: { new: any }) => {
      onNewNotification(payload.new)
    })
    .subscribe()

  return () => { client.removeChannel(channel) }
}
