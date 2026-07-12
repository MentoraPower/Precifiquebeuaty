import type { Metadata, Viewport } from 'next'
import { Instrument_Sans } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { DismissKeyboard } from '@/components/DismissKeyboard'
import { ConfirmProvider } from '@/components/ConfirmProvider'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Precifica Beauty',
  description: 'Precifique com clareza, calcule seu lucro e a viabilidade das suas campanhas.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Precifica Beauty',
  appleWebApp: { capable: true, statusBarStyle: 'black', title: 'Precifica Beauty' },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={instrumentSans.variable}>
      <body className="font-sans">
        <ConfirmProvider>
          <div className="mx-auto min-h-screen max-w-app bg-surface">{children}</div>
        </ConfirmProvider>
        <ServiceWorkerRegister />
        <DismissKeyboard />
      </body>
    </html>
  )
}
