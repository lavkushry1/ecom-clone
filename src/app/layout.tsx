import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/toaster'
import { ChatSupport } from '@/components/ecommerce/chat-support'
import { AddToCartProvider } from '@/components/ecommerce/add-to-cart-provider'
import { ThemeProvider } from '@/contexts/theme-context'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flipkart Clone - Your Online Shopping Destination',
  description: 'Shop for electronics, fashion, home & kitchen, books & more. Free shipping on eligible orders.',
  keywords: 'flipkart, online shopping, electronics, fashion, home kitchen, books',
  authors: [{ name: 'Flipkart Clone Team' }],
  creator: 'Flipkart Clone',
  publisher: 'Flipkart Clone',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://flipkart-clone.vercel.app',
    title: 'Flipkart Clone - Your Online Shopping Destination',
    description: 'Shop for electronics, fashion, home & kitchen, books & more. Free shipping on eligible orders.',
    siteName: 'Flipkart Clone',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flipkart Clone - Your Online Shopping Destination',
    description: 'Shop for electronics, fashion, home & kitchen, books & more. Free shipping on eligible orders.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="flipkart-ui-theme">
          <AuthProvider>
            <AddToCartProvider>
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
              <Toaster />
              <ChatSupport />
            </AddToCartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
