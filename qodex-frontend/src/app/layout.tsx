import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CodeQuery - AI-Powered Code Search',
  description: 'Transform GitHub repositories into queryable knowledge bases with AI-powered natural language search',
  keywords: ['code search', 'GitHub', 'AI', 'repository analysis'],
  authors: [{ name: 'CodeQuery Team' }],
  openGraph: {
    title: 'Qodex - AI-Powered Code Search',
    description: 'Transform GitHub repositories into queryable knowledge bases',
    type: 'website',
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
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}