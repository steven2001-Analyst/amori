export async function POST() {
  const response = new Response(JSON.stringify({ success: true }))
  response.cookies.set('amori-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
