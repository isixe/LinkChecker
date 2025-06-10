import '@/styles/globals.css'
import type { Metadata } from 'next'

import { headers } from 'next/headers'

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const host = headersList.get('host') || 'localhost:3000'
  const url = `${protocol}://${host}`

  return {
    title: 'LinkChecker',
    keywords: 'check link, link check, link checker, broken link checker',
    description:
      'Check all links on a website, identify broken links, and analyze different links.',
    alternates: {
      canonical: url
    },
    openGraph: {
      title: 'LinkChecker',
      description:
        'Check all links on a website, identify broken links, and analyze different links.',
      url,
      siteName: 'LinkChecker',
      locale: 'en',
      images: '/images/preview.png'
    }
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" />
      <body>{children}</body>
    </html>
  )
}
