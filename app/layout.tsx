import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Naveen Meel — Cloud & DevOps Engineer',
  description: 'NOC Network Engineer at Airtel. Writing about Networking, Cloud, DevOps, Kubernetes, Terraform and more.',
  keywords: ['Cloud Engineer', 'DevOps', 'AWS', 'Airtel', 'Kubernetes', 'Docker', 'Terraform', 'MPLS'],
  authors: [{ name: 'Naveen Meel' }],
  icons: { icon: '/favicon.ico', apple: '/avatar.png' },
  openGraph: {
    title: 'Naveen Meel — Cloud & DevOps Engineer',
    description: 'NOC Network Engineer at Airtel. Writing about Networking, Cloud, DevOps, Kubernetes, and Terraform.',
    type: 'website',
    images: [{ url: '/avatar.png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const t = localStorage.getItem('theme');
              if (t === 'light') { document.documentElement.classList.remove('dark'); }
              else { document.documentElement.classList.add('dark'); }
            } catch(e) { document.documentElement.classList.add('dark'); }
          `,
        }} />
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
