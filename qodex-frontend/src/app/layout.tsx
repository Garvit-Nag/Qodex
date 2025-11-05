import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import AuthWrapper from '@/components/auth/AuthWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Qodex - AI-Powered Code Intelligence',
  description: 'Transform GitHub repositories into queryable knowledge bases with AI-powered natural language search',
  keywords: ['code search', 'GitHub', 'AI', 'repository analysis', 'Qodex'],
  authors: [{ name: 'Qodex Team' }],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  function getInitialTheme() {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  }
  const theme = getInitialTheme();
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white dark:bg-black`}>
        <AuthProvider>
          <AuthWrapper>
            <div className="min-h-screen bg-background">
              {children}
            </div>
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}