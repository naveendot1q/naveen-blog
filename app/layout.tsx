import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Naveen Meel — Cloud & DevOps Engineer',
  description: 'Network & Cloud Engineer at Airtel. Specializing in AWS, Azure, GCP, CI/CD, Docker, Kubernetes, and enterprise networking.',
  keywords: ['Cloud Engineer', 'DevOps', 'AWS', 'Airtel', 'Kubernetes', 'Docker', 'Terraform'],
  authors: [{ name: 'Naveen Meel' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/avatar.png',
  },
  openGraph: {
    title: 'Naveen Meel — Cloud & DevOps Engineer',
    description: 'Network & Cloud Engineer specializing in AWS, Azure, GCP, and DevOps.',
    type: 'website',
    images: [{ url: '/avatar.png' }],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
