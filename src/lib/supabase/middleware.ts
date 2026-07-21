import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

const PUBLIC_PATHS = ['/auth', '/api', '/_next', '/favicon', '/manifest', '/sw.js', '/icons']

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Repassa a rota atual num header para o layout raiz (decide desktop x mobile).
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  let response = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === '/'

  // Área administrativa (/alunos): tem login próprio e roda no desktop. Não
  // redireciona para o /auth (que é só do celular) e não passa pelo gate de
  // compra — a própria página faz login e checagem de admin.
  const isAdminArea = pathname.startsWith('/alunos')

  if (!user && !isPublic && !isAdminArea) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  // Controle de acesso por compra: só entra quem tem acesso ativo.
  if (user && !isPublic && !isAdminArea) {
    const active = (user.app_metadata as { access_active?: boolean } | undefined)?.access_active === true
    if (!active && pathname !== '/sem-acesso') {
      const url = request.nextUrl.clone()
      url.pathname = '/sem-acesso'
      return NextResponse.redirect(url)
    }
    if (active && pathname === '/sem-acesso') {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
  }

  return response
}
