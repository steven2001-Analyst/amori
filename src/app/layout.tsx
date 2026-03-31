import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })

export const metadata: Metadata = {
  title: "Amori — Find Your Perfect Match",
  description: "Amori is a modern dating platform designed to help you find meaningful connections.",
  icons: { icon: "/logo.png" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" richColors theme="light" />
      </body>
    </html>
  )
}
