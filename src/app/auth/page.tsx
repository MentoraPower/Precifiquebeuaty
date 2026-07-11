'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/` },
        })
        if (error) throw error
        if (data.session) {
          router.replace('/onboarding')
          router.refresh()
        } else {
          setInfo('Enviamos um e-mail de confirmação. Confirme para entrar.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace('/')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? traduzErro(err.message) : 'Não foi possível continuar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col px-6 py-12">
      <div className="mb-8 mt-4 flex justify-center">
        <Logo />
      </div>

      <div className="mb-6 flex rounded-pill border border-line bg-bg p-1">
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m)
              setError(null)
              setInfo(null)
            }}
            className={`flex-1 rounded-pill py-2 text-[14px] font-medium transition ${
              mode === m ? 'bg-ink text-white' : 'text-muted'
            }`}
          >
            {m === 'signin' ? 'Entrar' : 'Criar conta'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'signup' && (
          <Input label="Nome" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" required />
        )}
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          required
        />
        <Input
          label="Senha"
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          required
        />

        {error && <p className="text-[13px] text-danger">{error}</p>}
        {info && <p className="text-[13px] text-success">{info}</p>}

        <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
          {mode === 'signin' ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>
    </main>
  )
}

function traduzErro(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.'
  if (/already registered/i.test(msg)) return 'Este e-mail já possui conta. Faça login.'
  if (/password should be at least/i.test(msg)) return 'A senha precisa de ao menos 6 caracteres.'
  return msg
}
