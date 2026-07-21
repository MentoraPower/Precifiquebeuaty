import type { Metadata, Viewport } from 'next'
import { Instrument_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import QRCode from 'qrcode'
import './globals.css'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { DismissKeyboard } from '@/components/DismissKeyboard'
import { ContentProtection } from '@/components/ContentProtection'
import { AntiInspect } from '@/components/AntiInspect'
import { IdleLogout } from '@/components/IdleLogout'
import { ConfirmProvider } from '@/components/ConfirmProvider'
import { DesktopBlock } from '@/components/DesktopBlock'
import { isMobileDevice } from '@/lib/device'

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = headers()
  const ua = h.get('user-agent')
  const isMobile = isMobileDevice(ua)

  // Área administrativa (/alunos): abre no desktop em largura total. A tela de
  // login (/auth) também abre no desktop, para o admin conseguir entrar. O
  // restante do app continua só no celular (QR code no desktop).
  const pathname = h.get('x-pathname') || ''
  // SÓ a /alunos abre no desktop (com login próprio da aba). Todo o resto do app
  // — inclusive o login do app (/auth) — continua só no celular (QR no desktop).
  const isAdminArea = pathname.startsWith('/alunos')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://precifica.biteti.co'
  const qrSvg = isMobile || isAdminArea
    ? ''
    : await QRCode.toString(siteUrl, { type: 'svg', margin: 0, color: { dark: '#2C1E16', light: '#00000000' } })

  return (
    <html lang="pt-BR" className={instrumentSans.variable}>
      <body className="font-sans">
        {isAdminArea ? (
          // Painel de admin — largura total, desktop e celular.
          <>
            <ConfirmProvider>
              <div className="min-h-screen bg-surface">{children}</div>
            </ConfirmProvider>
            <IdleLogout />
            <AntiInspect />
          </>
        ) : isMobile ? (
          <>
            <ConfirmProvider>
              <div className="mx-auto min-h-screen max-w-app bg-surface">{children}</div>
            </ConfirmProvider>
            <ServiceWorkerRegister />
            <DismissKeyboard />
            <ContentProtection />
            <IdleLogout />
            <AntiInspect />
          </>
        ) : (
          <>
            <DesktopBlock url={siteUrl} qrSvg={qrSvg} />
            <AntiInspect />
          </>
        )}
      </body>
    </html>
  )
}
