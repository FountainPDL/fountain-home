import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/header"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "FountainHome - Stream Movies, TV Shows & Anime",
  description: "Your ultimate streaming destination with a cyber fountain experience",
  generator: "v0.app",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/icon.svg",
    apple: [{ url: "/icon.svg", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FountainHome",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ServiceWorkerRegister />
          <Suspense fallback={<div>Loading...</div>}>
            <Header />
          </Suspense>
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-border/50 bg-card/50 py-4 text-center">
            <p className="text-sm text-muted-foreground">Made with 🙂 for movie lovers</p>
          </footer>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
