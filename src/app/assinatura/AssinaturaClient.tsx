'use client'

import { useState } from 'react'
import { FileText, Download, X } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { formatCents, formatDateBR } from '@/lib/format'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import type { EntitlementRow } from '@/lib/database.types'

const METHODS: Record<string, string> = {
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  pix: 'Pix',
  boleto: 'Boleto',
}

interface HublaRaw {
  event?: { paymentMethod?: string; totalAmount?: number; paidAt?: string; transactionId?: string }
}

const YEAR_MS = 365 * 24 * 60 * 60 * 1000

export function AssinaturaClient({ email, entitlement }: { email: string; entitlement: EntitlementRow | null }) {
  const [docOpen, setDocOpen] = useState(false)

  const ev = ((entitlement?.raw as HublaRaw | null) ?? {}).event ?? {}
  const amount = entitlement?.total_amount_cents ?? (ev.totalAmount != null ? Math.round(ev.totalAmount * 100) : null)
  const paidAt = entitlement?.paid_at ?? ev.paidAt ?? null
  const method = (ev.paymentMethod && METHODS[ev.paymentMethod]) || ev.paymentMethod || '—'
  const tx = entitlement?.transaction_id ?? ev.transactionId ?? null
  const refunded = entitlement?.status === 'refunded'

  const paid = paidAt ? new Date(paidAt) : null
  const renewal = paid ? new Date(paid.getTime() + YEAR_MS) : null
  const daysLeft = renewal ? Math.ceil((renewal.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : null

  function downloadPdf() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    doc.setFillColor(44, 30, 22)
    doc.rect(0, 0, W, 110, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('Precifica Beauty', 48, 56)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text('Comprovante de pagamento', 48, 82)

    doc.setTextColor(17, 17, 17)
    let y = 168
    const line = (label: string, value: string) => {
      doc.setTextColor(130, 130, 130)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(label, 48, y)
      doc.setTextColor(17, 17, 17)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text(value, 48, y + 18)
      y += 52
    }
    line('Plano', 'Precifica Beauty')
    if (amount != null) line('Valor pago', formatCents(amount))
    line('Data do pagamento', formatDateBR(paidAt))
    line('Forma de pagamento', method)
    if (tx) line('Transação', tx)
    line('Status', refunded ? 'Reembolsado' : 'Pago')
    line('Cliente', email)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Documento gerado pelo Precifica Beauty.', 48, y + 8)
    doc.save('comprovante-precifica-beauty.pdf')
  }

  return (
    <main className="pb-16">
      <AppHeader back center title="Assinatura" subtitle="Seu pagamento e comprovante." />

      <div className="space-y-4 px-5 pt-2">
        {!entitlement ? (
          <div className="rounded-card border border-line bg-bg p-6 text-center">
            <p className="text-[15px] font-semibold">Acesso ativo</p>
            <p className="mx-auto mt-1 max-w-[280px] text-[13px] text-muted">
              Não há um pagamento registrado para esta conta.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-card border border-line bg-bg p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-subtle">Plano</p>
                  <p className="text-[18px] font-bold">Precifica Beauty</p>
                </div>
                <span
                  className={`rounded-pill px-3 py-1 text-[12px] font-semibold ${
                    refunded ? 'bg-danger/12 text-danger' : 'bg-success/12 text-success'
                  }`}
                >
                  {refunded ? 'Reembolsada' : 'Ativa'}
                </span>
              </div>

              <div className="mt-4 divide-y divide-line">
                {amount != null && <DocRow label="Valor pago" value={formatCents(amount)} />}
                <DocRow label="Data do pagamento" value={formatDateBR(paidAt)} />
                <DocRow label="Forma de pagamento" value={method} />
                <DocRow label="Renovação" value="Anual" />
              </div>

              {!refunded && daysLeft != null && (
                <div className="mt-4 rounded-xl bg-champagne/50 px-4 py-3 text-[13px] font-medium text-[#7a5c1e]">
                  {daysLeft > 0
                    ? `Renova em ${daysLeft} dia${daysLeft === 1 ? '' : 's'} · ${formatDateBR(renewal!.toISOString())}`
                    : 'Sua assinatura venceu. Renove para manter o acesso.'}
                </div>
              )}
            </div>

            <button
              onClick={() => setDocOpen(true)}
              className="flex w-full items-center gap-3.5 rounded-card border border-line bg-bg p-4 text-left transition hover:border-ink/20"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brown text-white">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">Comprovante de pagamento</p>
                <p className="text-[12px] text-muted">Abrir e baixar o documento (PDF)</p>
              </div>
            </button>
          </>
        )}
      </div>

      {docOpen && entitlement && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={() => setDocOpen(false)} />
          <div className="relative flex max-h-[88vh] w-full max-w-[460px] flex-col overflow-hidden rounded-[24px] border border-line bg-bg shadow-float">
            <div className="flex items-center justify-between px-5 pt-4">
              <h2 className="text-[16px] font-bold">Comprovante</h2>
              <button
                onClick={() => setDocOpen(false)}
                aria-label="Fechar"
                className="flex h-8 w-8 items-center justify-center rounded-pill bg-surface text-muted"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 pb-4 pt-3">
              <div className="overflow-hidden rounded-2xl border border-line">
                <div className="bg-brown px-5 py-5 text-white">
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/70">Precifica Beauty</p>
                  <p className="mt-1 text-[18px] font-semibold">Comprovante de pagamento</p>
                </div>
                <div className="divide-y divide-line px-5">
                  <DocRow label="Plano" value="Precifica Beauty" />
                  {amount != null && <DocRow label="Valor pago" value={formatCents(amount)} />}
                  <DocRow label="Data do pagamento" value={formatDateBR(paidAt)} />
                  <DocRow label="Forma de pagamento" value={method} />
                  {tx && <DocRow label="Transação" value={tx} />}
                  <DocRow label="Status" value={refunded ? 'Reembolsado' : 'Pago'} />
                  <DocRow label="Cliente" value={email} />
                </div>
                <div className="px-5 py-3 text-center text-[11px] text-subtle">Documento gerado pelo Precifica Beauty.</div>
              </div>
            </div>

            <div className="border-t border-line p-4">
              <Button fullWidth size="lg" onClick={downloadPdf} className="rounded-pill">
                <Download className="h-4 w-4" /> Baixar PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function DocRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="shrink-0 text-[13px] text-muted">{label}</span>
      <span className="max-w-[62%] truncate text-right text-[13px] font-semibold">{value}</span>
    </div>
  )
}
