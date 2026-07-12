'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type View = 'login' | 'forgot' | 'reset'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()

  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // reset
  const [code, setCode] = useState('')
  const [newPw, setNewPw] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  function reset(v: View) {
    setView(v)
    setError(null)
    setInfo(null)
  }

  async function handleLogin(e: React.FormEvent) {
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

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (!email.trim()) return setError('Informe seu e-mail.')
    setLoading(true)
    try {
      // só envia se o e-mail tiver conta na plataforma
      const { data: exists, error: checkErr } = await supabase.rpc('email_has_account', { p_email: email })
      if (checkErr) throw checkErr
      if (!exists) {
        setError('Não encontramos uma conta com esse e-mail.')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      })
      if (error) throw error
      setView('reset')
      setInfo('Enviamos um código de 6 dígitos para o seu e-mail.')
    } catch (err) {
      setError(err instanceof Error ? traduzErro(err.message) : 'Não foi possível enviar o código.')
    } finally {
      setLoading(false)
    }
  }

  async function confirmReset(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (code.trim().length < 6) return setError('Digite o código de 6 dígitos.')
    if (newPw.length < 6) return setError('A nova senha precisa de ao menos 6 caracteres.')
    setLoading(true)
    try {
      const { error: otpErr } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'recovery' })
      if (otpErr) throw otpErr
      const { error: pwErr } = await supabase.auth.updateUser({ password: newPw })
      if (pwErr) throw pwErr
      router.replace('/home')
    } catch (err) {
      setError(err instanceof Error ? traduzErro(err.message) : 'Não foi possível redefinir a senha.')
    } finally {
      setLoading(false)
    }
  }

  const titles: Record<View, { title: string; subtitle: string }> = {
    login: { title: 'Acessar sua conta', subtitle: 'Entre com seu e-mail e senha para continuar.' },
    forgot: { title: 'Esqueceu a senha?', subtitle: 'Informe seu e-mail para receber um código.' },
    reset: { title: 'Redefinir senha', subtitle: 'Digite o código enviado e a nova senha.' },
  }

  return (
    <main className="relative flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-80 bg-gradient-to-t from-brown/30 via-brown/10 to-transparent" />

      <div className="relative mb-6 text-center">
        <h1 className="text-[32px] font-medium leading-tight">{titles[view].title}</h1>
        <p className="mx-auto mt-1.5 max-w-[300px] text-[14px] text-muted">{titles[view].subtitle}</p>
      </div>

      {view === 'login' && (
        <form onSubmit={handleLogin} className="relative flex flex-col gap-3 rounded-[24px] border border-line bg-bg p-5 shadow-card">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
          <PasswordField value={password} onChange={setPassword} show={showPw} onToggle={() => setShowPw((v) => !v)} placeholder="Senha" autoComplete="current-password" />
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <Button type="submit" size="lg" fullWidth loading={loading} className="mt-3 rounded-pill">
            Entrar
          </Button>
          <button type="button" onClick={() => reset('forgot')} className="mt-1 text-center text-[13px] font-semibold text-brown">
            Esqueceu a senha?
          </button>
        </form>
      )}

      {view === 'forgot' && (
        <form onSubmit={sendCode} className="relative flex flex-col gap-3 rounded-[24px] border border-line bg-bg p-5 shadow-card">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <Button type="submit" size="lg" fullWidth loading={loading} className="mt-3 rounded-pill">
            Enviar código
          </Button>
          <BackButton onClick={() => reset('login')} />
        </form>
      )}

      {view === 'reset' && (
        <form onSubmit={confirmReset} className="relative flex flex-col gap-3 rounded-[24px] border border-line bg-bg p-5 shadow-card">
          {info && <p className="text-[13px] text-success">{info}</p>}
          <Input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Código de 6 dígitos"
            required
          />
          <PasswordField value={newPw} onChange={setNewPw} show={showNewPw} onToggle={() => setShowNewPw((v) => !v)} placeholder="Nova senha" autoComplete="new-password" />
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <Button type="submit" size="lg" fullWidth loading={loading} className="mt-3 rounded-pill">
            Redefinir senha
          </Button>
          <button type="button" onClick={sendCode} className="text-center text-[13px] font-medium text-gold">
            Reenviar código
          </button>
          <BackButton onClick={() => reset('login')} />
        </form>
      )}
    </main>
  )
}

function PasswordField({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  autoComplete,
}: {
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  placeholder: string
  autoComplete: string
}) {
  return (
    <div className="relative">
      <input
        className="field pr-12"
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill text-subtle transition hover:text-ink"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-1 flex items-center justify-center gap-1.5 text-[13px] font-medium text-muted">
      <ArrowLeft className="h-4 w-4" /> Voltar ao login
    </button>
  )
}

function traduzErro(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.'
  if (/email not confirmed/i.test(msg)) return 'Confirme seu e-mail antes de entrar.'
  if (/token has expired|invalid.*token|otp.*expired|invalid otp/i.test(msg)) return 'Código inválido ou expirado.'
  if (/rate limit|too many/i.test(msg)) return 'Muitas tentativas. Aguarde um pouco e tente de novo.'
  if (/for security purposes/i.test(msg)) return 'Aguarde alguns segundos antes de reenviar.'
  return msg
}
