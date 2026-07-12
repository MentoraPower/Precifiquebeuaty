'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Store, Boxes, Percent, LogOut, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatBps } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PercentField } from '@/components/ui/MoneyField'
import { Avatar } from '@/components/Avatar'
import { InstallPWARow } from '@/components/InstallPWA'
import { useConfirm } from '@/components/ConfirmProvider'

interface Defaults {
  cardFeeBps: number
  taxBps: number
  commissionBps: number
  marginBps: number
}

export function MenuClient({
  email,
  fullName,
  avatarUrl,
  defaults,
}: {
  email: string
  fullName: string
  profession: string
  plan: string
  avatarUrl: string | null
  defaults: Defaults
}) {
  const router = useRouter()
  const supabase = createClient()
  const confirm = useConfirm()

  const [feesOpen, setFeesOpen] = useState(false)
  const [fees, setFees] = useState(defaults)
  const [savingFees, setSavingFees] = useState(false)

  async function saveFees() {
    setSavingFees(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('business_settings').upsert(
        {
          user_id: user.id,
          default_card_fee_bps: fees.cardFeeBps,
          default_tax_bps: fees.taxBps,
          default_commission_bps: fees.commissionBps,
          default_margin_bps: fees.marginBps,
        },
        { onConflict: 'user_id' },
      )
    }
    setSavingFees(false)
    setFeesOpen(false)
    router.refresh()
  }

  async function signOut() {
    const ok = await confirm({ title: 'Sair da conta', message: 'Deseja encerrar sua sessão?', confirmLabel: 'Sair' })
    if (!ok) return
    await supabase.auth.signOut({ scope: 'local' })
    router.replace('/auth')
  }

  return (
    <main>
      <div
        className="space-y-6 px-5"
        style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 0px) + 18px)' }}
      >
        {/* Perfil → abre a página de perfil */}
        <Link
          href="/perfil"
          className="flex w-full items-center gap-4 rounded-card border border-line bg-bg p-4 transition hover:border-ink/20"
        >
          <Avatar url={avatarUrl} name={fullName} size={68} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold">{fullName || 'Sua conta'}</p>
            <p className="truncate text-[13px] text-muted">{email}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-subtle" />
        </Link>

        <Section title="Negócio">
          <Row icon={Store} label="Meu negócio" href="/negocio" />
          <Row icon={Boxes} label="Investimentos" href="/negocio/investimentos" />
          <Row icon={Percent} label="Impostos e taxas" hint={`Margem padrão ${formatBps(fees.marginBps)}`} onClick={() => setFeesOpen(true)} />
        </Section>

        <InstallPWARow />

        <Button variant="outline" fullWidth size="lg" onClick={signOut} className="text-danger">
          <LogOut className="h-4 w-4" /> Sair da conta
        </Button>
      </div>

      {/* Impostos e taxas */}
      <Modal open={feesOpen} onClose={() => setFeesOpen(false)} title="Impostos e taxas padrão" subtitle="Copiados para novos serviços; não altera os já criados.">
        <div className="space-y-4">
          <PercentField label="Taxa da maquininha" valueBps={fees.cardFeeBps} onChangeBps={(b) => setFees((f) => ({ ...f, cardFeeBps: b }))} />
          <PercentField label="Impostos" valueBps={fees.taxBps} onChangeBps={(b) => setFees((f) => ({ ...f, taxBps: b }))} />
          <PercentField label="Comissão de parceiro" valueBps={fees.commissionBps} onChangeBps={(b) => setFees((f) => ({ ...f, commissionBps: b }))} />
          <PercentField label="Margem desejada" valueBps={fees.marginBps} onChangeBps={(b) => setFees((f) => ({ ...f, marginBps: b }))} />
          <Button fullWidth size="lg" loading={savingFees} onClick={saveFees}>
            Salvar
          </Button>
        </div>
      </Modal>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-subtle">{title}</p>
      <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-bg">{children}</div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  hint,
  href,
  onClick,
}: {
  icon: typeof Store
  label: string
  hint?: string
  href?: string
  onClick?: () => void
}) {
  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-brown text-white">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium">{label}</p>
        {hint && <p className="truncate text-[12px] text-subtle">{hint}</p>}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-subtle" />
    </>
  )
  const cls = 'flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface'
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}
