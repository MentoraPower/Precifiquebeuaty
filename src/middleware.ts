import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Sondagens comuns de bots/scanners — travadas na hora.
// NÃO afeta rotas do app nem os webhooks (Hubla/TMB) das ferramentas.
const SUSPICIOUS =
  /(^|\/)(\.env|\.git|\.aws|\.ssh|\.svn|\.htaccess|wp-admin|wp-login|xmlrpc|phpmyadmin|phpunit|eval-stdin|vendor\/|config\.php|backup)(\/|$|\?)|\.(php|asp|aspx|jsp|cgi|bak|sql|env)($|\?)/i

// Crawlers de IA / raspadores conhecidos — recebem 403 (o app é privado).
const BOT_UA =
  /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|CCBot|Google-Extended|PerplexityBot|Bytespider|Amazonbot|cohere-ai|Diffbot|ImagesiftBot|Omgili(bot)?|meta-externalagent|FacebookBot|Scrapy|DataForSeoBot|SemrushBot|AhrefsBot|MJ12bot|DotBot/i

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isWebhook = pathname.startsWith('/api/webhooks')

  // robots.txt/sitemap: serve o arquivo estático sem passar pelo gate de login.
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
    return NextResponse.next()
  }

  // Webhooks das ferramentas (Hubla/TMB) passam intactos.
  if (!isWebhook) {
    // Sondagens de bots/scanners — travadas na hora.
    if (SUSPICIOUS.test(pathname)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    // Crawlers de IA / raspadores — não recebem nada útil.
    const ua = request.headers.get('user-agent') || ''
    if (BOT_UA.test(ua)) {
      return new NextResponse('Not available', {
        status: 403,
        headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
      })
    }
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
}
