import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "./components/theme/theme-provider"
import { MainNav } from "@/components/navigation/main-nav"
import { Footer } from "@/components/navigation/footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "BlogCraft - Modern Blog Platform",
    template: "%s | BlogCraft",
  },
  description: "A modern blog platform built for writers who want to focus on creating amazing content.",
  keywords: ["blog", "writing", "markdown", "content", "publishing"],
  authors: [{ name: "BlogCraft Team" }],
  creator: "BlogCraft",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blogcraft.app",
    title: "BlogCraft - Modern Blog Platform",
    description: "A modern blog platform built for writers who want to focus on creating amazing content.",
    siteName: "BlogCraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlogCraft - Modern Blog Platform",
    description: "A modern blog platform built for writers who want to focus on creating amazing content.",
    creator: "@blogcraft",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
