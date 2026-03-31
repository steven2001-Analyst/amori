import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qysepabvnoftgtisqdic.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2VwYWJ2bm9mdGd0aXNxZGljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg1NzQ3NCwiZXhwIjoyMDkwNDMzNDc0fQ.1Z707jR1zo66CF0f0X-wPonEZPIGumHDrJ3vZJSF2mA'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const isProfile = formData.get('isProfile') === 'true'
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only images allowed' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 })

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = session.userId + '/' + Date.now() + '.' + ext

    const uploadRes = await fetch(SUPABASE_URL + '/storage/v1/object/photos/' + filename, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SERVICE_KEY, 'Content-Type': file.type },
      body: file,
    })
    if (!uploadRes.ok) { const err = await uploadRes.text(); console.error('Upload failed:', err); return NextResponse.json({ error: 'Upload failed' }, { status: 500 }) }

    const url = SUPABASE_URL + '/storage/v1/object/public/photos/' + filename

    // If this is a profile photo, update the User avatar and manage Photo table
    if (isProfile) {
      // Unset previous profile photos
      await supabase.from('Photo').update({ isProfile: false }).eq('userId', session.userId).eq('isProfile', true)
      // Insert new photo record
      const crypto = await import('crypto')
      await supabase.from('Photo').insert({ id: crypto.randomUUID(), userId: session.userId, url, order: 0, isProfile: true })
      // Update User avatar
      await supabase.from('User').update({ avatar: url }).eq('id', session.userId)
    } else {
      // Get current max order
      const { data: existing } = await supabase.from('Photo').select('order').eq('userId', session.userId).order('order', { ascending: false }).limit(1)
      const maxOrder = existing && existing.length > 0 ? (existing[0].order || 0) + 1 : 0
      const crypto = await import('crypto')
      await supabase.from('Photo').insert({ id: crypto.randomUUID(), userId: session.userId, url, order: maxOrder, isProfile: false })
    }

    return NextResponse.json({ url })
  } catch (error) { console.error('Upload error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
