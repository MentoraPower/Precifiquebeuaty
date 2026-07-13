import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Sondagens comuns de bots/scanners — travadas na hora.
// NÃO afeta rotas do app nem os webhooks (Hubla/TMB) das ferramentas.
const SUSPICIOUS =
  /(^|\/)(\.env|\.git|\.aws|\.ssh|\.svn|\.htaccess|wp-admin|wp-login|xmlrpc|phpmyadmin|phpunit|eval-stdin|vendor\/|config\.php|backup)(\/|$|\?)|\.(php|asp|aspx|jsp|cgi|bak|sql|env)($|\?)/i

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Webhooks das ferramentas passam intactos (Hubla/TMB).
  if (!pathname.startsWith('/api/webhooks') && SUSPICIOUS.test(pathname)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
}
