import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const { pathname } = request.nextUrl
  const isLpHost = host.includes('precificabeauty')

  // Domínio da landing page (precificabeauty.biteti.co) ou rota /lp:
  // página pública de vendas, sem gate de login e liberada no desktop.
  if (isLpHost || pathname.startsWith('/lp')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-lp', '1')
    if (isLpHost && !pathname.startsWith('/lp')) {
      const url = request.nextUrl.clone()
      url.pathname = '/lp'
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    }
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
}
