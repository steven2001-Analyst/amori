import { NextRequest, NextResponse } from 'next/server'
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

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = session.userId + '/' + Date.now() + '.' + ext

    const uploadRes = await fetch(SUPABASE_URL + '/storage/v1/object/photos/' + filename, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SERVICE_KEY, 'Content-Type': file.type },
      body: file,
    })
    if (!uploadRes.ok) { const err = await uploadRes.text(); console.error('Upload failed:', err); return NextResponse.json({ error: 'Upload failed' }, { status: 500 }) }

    const url = SUPABASE_URL + '/storage/v1/object/public/photos/' + filename
    return NextResponse.json({ url })
  } catch (error) { console.error('Upload error:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
}
