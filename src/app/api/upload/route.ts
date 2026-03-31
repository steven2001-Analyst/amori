import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 1. Verify auth via cookie token
    const token = request.cookies.get('amori-token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // 2. Parse request body
    const body = await request.json()
    const { file, isProfile } = body

    if (!file || typeof file !== 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 3. Determine mime type and extension from base64 prefix
    let mimeType = 'image/jpeg'
    let ext = 'jpg'
    if (file.startsWith('data:image/png')) { mimeType = 'image/png'; ext = 'png' }
    else if (file.startsWith('data:image/gif')) { mimeType = 'image/gif'; ext = 'gif' }
    else if (file.startsWith('data:image/webp')) { mimeType = 'image/webp'; ext = 'webp' }

    // 4. Decode base64 to buffer
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // 5. Generate unique filename
    const filename = `profile-${payload.userId}-${Date.now()}.${ext}`

    // 6. Upload to Supabase Storage via fetch API
    const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qysepabvnoftgtisqdic.supabase.co'
    const storageKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2VwYWJ2bm9mdGd0aXNxZGljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg1NzQ3NCwiZXhwIjoyMDkwNDMzNDc0fQ.1Z707jR1zo66CF0f0X-wPonEZPIGumHDrJ3vZJSF2mA'

    const formData = new FormData()
    formData.append('file', new Blob([buffer], { type: mimeType }), filename)

    const uploadRes = await fetch(`${storageUrl}/storage/v1/object/photos/${filename}`, {
      method: 'POST',
      headers: {
        'apikey': storageKey,
        'Authorization': `Bearer ${storageKey}`,
      },
      body: formData,
    })

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Storage upload failed:', errText)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // 7. Get the public URL
    const publicUrl = `${storageUrl}/storage/v1/object/public/photos/${filename}`

    // 8. If isProfile, update User table avatar field
    if (isProfile) {
      const { error: userError } = await supabase
        .from('User')
        .update({ avatar: publicUrl })
        .eq('id', payload.userId)

      if (userError) {
        console.error('Avatar update error:', userError)
        return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 })
      }
    } else {
      // 9. If !isProfile, create a Photo record in the Photo table
      const { error: photoError } = await supabase
        .from('Photo')
        .insert({
          userId: payload.userId,
          url: publicUrl,
          order: 0,
          isProfile: false,
        })

      if (photoError) {
        console.error('Photo record creation error:', photoError)
        return NextResponse.json({ error: 'Failed to save photo record' }, { status: 500 })
      }
    }

    // 10. Return the public URL
    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
