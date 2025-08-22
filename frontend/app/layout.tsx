import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Manrope } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "Inspira - Knowledge Sharing Community",
  description: "A modern platform for knowledge sharing with credits-based economy",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} ${manrope.variable} antialiased`}>
        <body>
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}
