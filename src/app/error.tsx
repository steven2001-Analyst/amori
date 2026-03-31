'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-rose-600 mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition">Try again</button>
      </div>
    </div>
  )
}
