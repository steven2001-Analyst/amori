'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
        <h2 style={{ color: '#e11d48', marginBottom: 16 }}>Something went wrong!</h2>
        <p style={{ color: '#666', marginBottom: 12 }}>Error: {error.message || 'Unknown error'}</p>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: 16, 
          borderRadius: 8, 
          fontSize: 12, 
          overflow: 'auto',
          maxHeight: 300,
          border: '1px solid #ddd'
        }}>{error.stack || 'No stack trace'}</pre>
        <button 
          onClick={reset}
          style={{
            marginTop: 16,
            padding: '10px 24px',
            background: '#f43f5e',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
