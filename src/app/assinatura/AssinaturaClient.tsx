'use client'

import { useState } from 'react'
import { FileText, Download, X } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { formatCents, formatDateBR, formatDateTimeBR } from '@/lib/format'
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

type Section = { title: string; rows: [string, string][] }

// jsPDF (Helvetica/WinAnsi) não tem os espaços especiais que o Intl usa em "R$ 10,00".
const pdfSafe = (v: string) => v.replace(/[\u00a0\u202f]/g, ' ')

export function AssinaturaClient({ email, entitlement }: { email: string; entitlement: EntitlementRow | null }) {
  const [docOpen, setDocOpen] = useState(false)

  const ev = ((entitlement?.raw as HublaRaw | null) ?? {}).event ?? {}
  const amount = entitlement?.total_amount_cents ?? (ev.totalAmount != null ? Math.round(ev.totalAmount * 100) : null)
  const paidAt = entitlement?.paid_at ?? ev.paidAt ?? null
  const method = (ev.paymentMethod && METHODS[ev.paymentMethod]) || ev.paymentMethod || null
  const tx = entitlement?.transaction_id ?? ev.transactionId ?? null
  const refunded = entitlement?.status === 'refunded'
  const hasPayment = paidAt != null || amount != null
  const docTitle = hasPayment ? 'Comprovante de pagamento' : 'Comprovante de acesso'
  const status = refunded ? 'Reembolsado' : hasPayment ? 'Pago' : 'Ativo'
  const heroValue = amount != null ? formatCents(amount) : 'Acesso vitalício'
  const heroDate = paidAt ? formatDateTimeBR(paidAt) : null

  // Seções do comprovante — só entra o que existe, sem campos vazios.
  const pagamento: [string, string][] = [
    ['Tipo', 'Assinatura vitalícia'],
    ['Plano', 'Precifica Beauty'],
    ['Validade', 'Sem vencimento'],
  ]
  if (method) pagamento.push(['Forma de pagamento', method])
  if (paidAt) pagamento.push(['Data e hora', formatDateTimeBR(paidAt)])
  pagamento.push(['Situação', status])

  const pagador: [string, string][] = []
  if (entitlement?.user_name) pagador.push(['Nome', entitlement.user_name])
  if (email) pagador.push(['E-mail', email])

  const sections: Section[] = [
    { title: 'Dados do pagamento', rows: pagamento },
    ...(pagador.length ? [{ title: 'Pagador', rows: pagador }] : []),
    { title: 'Recebedor', rows: [['Nome', 'Precifica Beauty']] },
  ]
  const authCode = tx ?? entitlement?.id ?? null
  const authLabel = tx ? 'ID da transação' : 'ID do registro'

  function downloadPdf() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    const L = 56
    const R = W - 56
    const ink = () => doc.setTextColor(17, 17, 17)
    const gray = () => doc.setTextColor(120, 120, 120)
    const rule = (yy: number, dashed = false) => {
      doc.setDrawColor(215, 215, 215)
      doc.setLineWidth(0.8)
      if (dashed) doc.setLineDashPattern([3, 3], 0)
      doc.line(L, yy, R, yy)
      doc.setLineDashPattern([], 0)
    }

    let y = 72
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    ink()
    doc.text(docTitle, W / 2, y, { align: 'center' })
    y += 36

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    gray()
    doc.text(amount != null ? 'Valor' : 'Plano', W / 2, y, { align: 'center' })
    y += 30
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(amount != null ? 28 : 22)
    ink()
    doc.text(pdfSafe(heroValue), W / 2, y, { align: 'center' })
    if (heroDate) {
      y += 22
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      gray()
      doc.text(heroDate, W / 2, y, { align: 'center' })
    }
    y += 28
    rule(y, true)

    for (const sec of sections) {
      y += 30
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      ink()
      doc.text(sec.title.toUpperCase(), L, y)
      y += 8
      for (const [label, value] of sec.rows) {
        y += 20
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        gray()
        doc.text(label, L, y)
        doc.setFont('helvetica', 'bold')
        ink()
        const lines = doc.splitTextToSize(pdfSafe(value), (R - L) * 0.6) as string[]
        doc.text(lines, R, y, { align: 'right' })
        y += (lines.length - 1) * 13
      }
      y += 18
      rule(y, true)
    }

    if (authCode) {
      y += 30
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      ink()
      doc.text('AUTENTICAÇÃO', L, y)
      y += 20
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      gray()
      doc.text(authLabel, L, y)
      y += 16
      doc.setFont('courier', 'normal')
      doc.setFontSize(10)
      ink()
      const lines = doc.splitTextToSize(authCode, R - L) as string[]
      doc.text(lines, L, y)
      y += (lines.length - 1) * 12 + 18
      rule(y, true)
    }

    y += 28
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    gray()
    doc.text(`Emitido em ${formatDateTimeBR(new Date().toISOString())}`, W / 2, y, { align: 'center' })
    doc.text('Documento emitido pela Precifica Beauty.', W / 2, y + 14, { align: 'center' })
    doc.save('comprovante-precifica-beauty.pdf')
  }

  return (
    <main className="pb-16">
      <AppHeader back center title="Assinatura" subtitle="Seu plano e comprovante." />

      <div className="space-y-4 px-5 pt-2">
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
              {refunded ? 'Reembolsada' : 'Vitalícia'}
            </span>
          </div>

          <div className="mt-4 divide-y divide-line">
            <DocRow label="Tipo de acesso" value="Vitalício" />
            <DocRow label="Validade" value="Sem vencimento" />
            {amount != null && <DocRow label="Valor pago" value={formatCents(amount)} />}
            {paidAt && <DocRow label="Data do pagamento" value={formatDateBR(paidAt)} />}
            {method && <DocRow label="Forma de pagamento" value={method} />}
          </div>

          {!refunded && (
            <div className="mt-4 rounded-xl bg-champagne/50 px-4 py-3 text-[13px] font-medium text-[#7a5c1e]">
              Acesso vitalício · sem renovação e sem cobranças futuras.
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
            <p className="text-[15px] font-semibold">{docTitle}</p>
            <p className="text-[12px] text-muted">Abrir e baixar o documento (PDF)</p>
          </div>
        </button>
      </div>

      {docOpen && (
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
              <div className="rounded-2xl border border-line bg-white px-5 py-6 text-[#111]">
                <p className="text-center text-[15px] font-bold">{docTitle}</p>

                <div className="mt-5 text-center">
                  <p className="text-[11px] text-[#777]">{amount != null ? 'Valor' : 'Plano'}</p>
                  <p className={`mt-1 font-bold ${amount != null ? 'text-[28px]' : 'text-[20px]'}`}>{heroValue}</p>
                  {heroDate && <p className="mt-1 text-[12px] text-[#777]">{heroDate}</p>}
                </div>

                {sections.map((sec) => (
                  <div key={sec.title} className="mt-5 border-t border-dashed border-[#d7d7d7] pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide">{sec.title}</p>
                    <div className="mt-2 space-y-2">
                      {sec.rows.map(([label, value]) => (
                        <ReceiptRow key={label} label={label} value={value} />
                      ))}
                    </div>
                  </div>
                ))}

                {authCode && (
                  <div className="mt-5 border-t border-dashed border-[#d7d7d7] pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide">Autenticação</p>
                    <p className="mt-2 text-[12px] text-[#777]">{authLabel}</p>
                    <p className="mt-0.5 break-all font-mono text-[12px]">{authCode}</p>
                  </div>
                )}

                <p className="mt-6 border-t border-dashed border-[#d7d7d7] pt-4 text-center text-[11px] text-[#777]">
                  Documento emitido pela Precifica Beauty.
                </p>
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

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[12px]">
      <span className="shrink-0 text-[#777]">{label}</span>
      <span className="break-all text-right font-semibold">{value}</span>
    </div>
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
