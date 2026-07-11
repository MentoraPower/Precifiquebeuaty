'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, CalendarDays, Clock, Wallet, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MoneyField } from '@/components/ui/MoneyField'

type Step = 'intro' | 'profession' | 'proLabore' | 'days' | 'hours'
const order: Step[] = ['intro', 'profession', 'proLabore', 'days', 'hours']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>('intro')
  const [profession, setProfession] = useState('')
  const [proLaboreCents, setProLaboreCents] = useState(0)
  const [days, setDays] = useState(22)
  const [hours, setHours] = useState(8)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const index = order.indexOf(step)

  function next() {
    setStep(order[Math.min(index + 1, order.length - 1)])
  }
  function back() {
    if (index === 0) return
    setStep(order[index - 1])
  }

  async function finish() {
    setSaving(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Sessão expirada.')

      await supabase.from('business_settings').upsert(
        {
          user_id: user.id,
          pro_labore_cents: proLaboreCents,
          working_days: days,
          working_hours_day: hours,
        },
        { onConflict: 'user_id' },
      )
      await supabase
        .from('profiles')
        .update({ profession, onboarding_completed: true, onboarding_started_at: new Date().toISOString() })
        .eq('id', user.id)

      router.replace('/home')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
      setSaving(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col px-6 py-10">
      {/* progresso */}
      <div className="mb-8 flex items-center gap-1.5">
        {order.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 rounded-pill transition-all ${i <= index ? 'w-8 bg-gold' : 'w-1.5 bg-line'}`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        {step === 'intro' && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col justify-center">
              <div className="mb-8 flex h-40 items-center justify-center rounded-card bg-champagne/50">
                <Sparkles className="h-16 w-16 text-gold" strokeWidth={1.4} />
              </div>
              <h1 className="text-[28px] font-bold leading-tight">Preço certo,{'\n'}lucro real</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Entenda todos os custos, defina sua margem e precifique com confiança.
              </p>
            </div>
          </div>
        )}

        {step === 'profession' && (
          <StepShell icon={Briefcase} title="Qual é a sua profissão?" hint="Aparece no seu perfil e ajuda a personalizar o app.">
            <Input
              autoFocus
              label="Profissão"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Ex.: Designer de sobrancelhas"
            />
          </StepShell>
        )}

        {step === 'proLabore' && (
          <StepShell icon={Wallet} title="Quanto você quer ganhar por mês?" hint="Seu pró-labore — o salário que você tira do negócio.">
            <MoneyField autoFocus label="Pró-labore mensal" valueCents={proLaboreCents} onChangeCents={setProLaboreCents} />
          </StepShell>
        )}

        {step === 'days' && (
          <StepShell icon={CalendarDays} title="Quantos dias você trabalha por mês?" hint="Considere a média real de atendimento.">
            <Stepperino value={days} onChange={setDays} min={1} max={31} suffix="dias/mês" />
          </StepShell>
        )}

        {step === 'hours' && (
          <StepShell icon={Clock} title="Quantas horas por dia?" hint="Horas realmente produtivas, atendendo.">
            <Stepperino value={hours} onChange={setHours} min={1} max={16} suffix="horas/dia" />
          </StepShell>
        )}

        {error && <p className="mt-4 text-[13px] text-danger">{error}</p>}
      </div>

      <div className="mt-6 flex gap-3">
        {index > 0 && (
          <Button variant="outline" size="lg" onClick={back} className="flex-1">
            Voltar
          </Button>
        )}
        {step !== 'hours' ? (
          <Button size="lg" onClick={next} className="flex-1" disabled={step === 'profession' && !profession.trim()}>
            Continuar
          </Button>
        ) : (
          <Button size="lg" onClick={finish} loading={saving} className="flex-1">
            Concluir
          </Button>
        )}
      </div>
    </main>
  )
}

function StepShell({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: typeof Briefcase
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col">
      <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-pill bg-champagne text-gold">
        <Icon className="h-6 w-6" />
      </span>
      <h1 className="text-[24px] font-bold leading-tight">{title}</h1>
      <p className="mb-8 mt-2 text-[14px] text-muted">{hint}</p>
      {children}
    </div>
  )
}

function Stepperino({
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  suffix: string
}) {
  return (
    <div className="flex items-center justify-between rounded-card border border-line bg-bg p-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-11 w-11 items-center justify-center rounded-btn border border-line text-[22px] text-ink active:scale-95"
      >
        −
      </button>
      <div className="text-center">
        <p className="text-[28px] font-bold leading-none">{value}</p>
        <p className="mt-1 text-[12px] text-muted">{suffix}</p>
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-11 w-11 items-center justify-center rounded-btn border border-line text-[22px] text-ink active:scale-95"
      >
        +
      </button>
    </div>
  )
}
