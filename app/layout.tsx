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
  title: 'Analisador de Patentes',
  description:
    'Sistema inteligente para análise de documentos de patentes. Extraia texto de imagens e PDFs com OCR e obtenha análises detalhadas. Exporte resultados em PDF.',
  keywords: [
    'análise de patentes',
    'OCR',
    'extração de texto',
    'propriedade intelectual',
    'documentos de patente',
    'processamento de imagens',
  ],
  authors: [{ name: 'Júlio Cézar' }],
  creator: 'Júlio Cézar',
  openGraph: {
    title: 'Analisador de Patentes',
    description:
      'Sistema inteligente para análise de documentos de patentes com OCR e exportação em PDF.',
    type: 'website',
    locale: 'pt_BR',
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
