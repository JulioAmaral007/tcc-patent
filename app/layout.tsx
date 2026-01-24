import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Patent Analyzer',
  description:
    'Intelligent system for patent document analysis. Extract text from images and PDFs with OCR and get detailed analysis. Export results as PDF.',
  keywords: [
    'patent analysis',
    'OCR',
    'text extraction',
    'intellectual property',
    'patent documents',
    'image processing',
  ],
  authors: [{ name: 'Júlio Cézar' }],
  creator: 'Júlio Cézar',
  openGraph: {
    title: 'Patent Analyzer',
    description:
      'Intelligent system for patent document analysis with OCR and PDF export.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
