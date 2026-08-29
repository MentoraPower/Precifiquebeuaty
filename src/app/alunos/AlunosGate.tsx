'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

/**
 * Porta de entrada da /alunos (roda no desktop). Login próprio da aba — separado
 * do login do app (que é só do celular) — e tela de "acesso não permitido".
 */
export function AlunosGate({ mode }: { mode: 'login' | 'denied' }) {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
      router.refresh() // re-renderiza a página no servidor com a sessão nova
    } catch {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
    }
  }

  async function switchAccount() {
    await supabase.auth.signOut({ scope: 'local' })
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-[400px]">
        {mode === 'login' ? (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-[26px] font-bold leading-tight">Painel de administração</h1>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-3 rounded-[24px] border border-line bg-bg p-5 shadow-card">
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
              <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2 rounded-pill">
                Entrar
              </Button>
            </form>
          </>
        ) : (
          <div className="rounded-[24px] border border-line bg-bg p-7 text-center shadow-card">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-pill bg-danger/12 text-danger">
              <ShieldAlert className="h-6 w-6" />
            </span>
            <h1 className="text-[22px] font-bold leading-tight">Acesso não permitido</h1>
            <p className="mx-auto mt-2 max-w-[300px] text-[14px] text-muted">
              Esta conta não tem permissão para o painel administrativo de alunos.
            </p>
            <Button variant="outline" size="lg" fullWidth onClick={switchAccount} className="mt-6 rounded-pill">
              Entrar com outra conta
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
