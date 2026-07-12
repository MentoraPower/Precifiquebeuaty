'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, RefreshCw, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export default function SemAcessoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function recheck() {
    setChecking(true)
    // renova a sessão para pegar o acesso atualizado (app_metadata)
    await supabase.auth.refreshSession()
    const { data } = await supabase.auth.getUser()
    const active = (data.user?.app_metadata as { access_active?: boolean } | undefined)?.access_active === true
    setChecking(false)
    if (active) {
      router.replace('/home')
      router.refresh()
    }
  }

  async function signOut() {
    await supabase.auth.signOut({ scope: 'local' })
    router.replace('/auth')
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-80 bg-gradient-to-t from-brown/30 via-brown/10 to-transparent" />

      <div className="relative w-full max-w-[380px] rounded-[24px] border border-line bg-bg p-6 shadow-card">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brown text-white">
          <LockKeyhole className="h-7 w-7" />
        </span>
        <h1 className="text-[22px] font-medium leading-tight">Acesso não liberado</h1>
        <p className="mx-auto mt-2 max-w-[300px] text-[14px] text-muted">
          A conta {email ? <b className="text-ink">{email}</b> : 'atual'} não tem uma compra ativa. Após a confirmação da
          compra, seu acesso é liberado automaticamente.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button size="lg" fullWidth loading={checking} onClick={recheck}>
            <RefreshCw className="h-4 w-4" /> Já comprei, verificar de novo
          </Button>
          <Button size="lg" fullWidth variant="outline" onClick={signOut} className="text-danger">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </div>
    </main>
  )
}
