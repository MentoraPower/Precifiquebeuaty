'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.replace('/home')
    } catch (err) {
      setError(err instanceof Error ? traduzErro(err.message) : 'Não foi possível continuar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col justify-center px-6 py-12">
      {/* gradiente marrom subindo do rodapé, esvaindo em transparente */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-80 bg-gradient-to-t from-brown/30 via-brown/10 to-transparent" />

      <div className="relative mb-6 text-center">
        <h1 className="text-[32px] font-medium leading-tight">Acessar sua conta</h1>
        <p className="mt-1.5 text-[14px] text-muted">Entre com seu e-mail e senha para continuar.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col gap-3 rounded-[24px] border border-line bg-bg p-5 shadow-card"
      >
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          required
        />
        <div className="relative">
          <input
            className="field pr-12"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill text-subtle transition hover:text-ink"
          >
            {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {error && <p className="text-[13px] text-danger">{error}</p>}

        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-3 rounded-pill">
          Entrar
        </Button>
      </form>
    </main>
  )
}

function traduzErro(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.'
  if (/email not confirmed/i.test(msg)) return 'Confirme seu e-mail antes de entrar.'
  return msg
}
