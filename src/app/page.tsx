import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'

// Tela 01 — Splash e entrada.
export default async function SplashPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('id', user.id).single()
    redirect(profile?.onboarding_completed ? '/home' : '/onboarding')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-16">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Logo />
        <p className="mt-6 max-w-[240px] text-center text-[14px] leading-relaxed text-muted">
          Calcule, precifique e aumente seu lucro com clareza.
        </p>
        <div className="mt-8 flex items-center gap-1.5">
          <span className="h-1.5 w-6 rounded-pill bg-gold" />
          <span className="h-1.5 w-1.5 rounded-pill bg-line" />
          <span className="h-1.5 w-1.5 rounded-pill bg-line" />
          <span className="h-1.5 w-1.5 rounded-pill bg-line" />
        </div>
      </div>
      <Link href="/auth" className="w-full">
        <Button size="lg" fullWidth>
          Começar
        </Button>
      </Link>
    </main>
  )
}
