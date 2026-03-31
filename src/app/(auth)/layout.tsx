import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 p-12 text-white lg:flex lg:w-1/2">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <img src="/logo.png" alt="Amori" className="h-8 w-8 object-contain" />
          </div>
          <span className="text-xl font-bold">Amori</span>
        </Link>

        <div className="max-w-md">
          <Heart className="mb-6 h-12 w-12 text-white/60" />
          <h2 className="mb-4 text-3xl font-bold">
            Where real love stories begin
          </h2>
          <p className="text-lg text-white/80">
            Join thousands of people who have found meaningful connections on Amori.
            Your perfect match is just a swipe away.
          </p>
        </div>

        <p className="text-sm text-white/60">
          &copy; {new Date().getFullYear()} Amori. All rights reserved.
        </p>
      </div>

      {/* Right panel - auth forms */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="relative h-8 w-8">
              <img src="/logo.png" alt="Amori" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-xl font-bold gradient-text-rose">Amori</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
