/** Formatação pt-BR de dinheiro (centavos) e percentuais (bps). */

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

export function formatCents(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '—'
  return brl.format(cents / 100)
}

export function formatBps(bps: number | null | undefined): string {
  if (bps == null || Number.isNaN(bps)) return '—'
  const pct = bps / 100
  return `${Number.isInteger(pct) ? pct : pct.toFixed(1).replace('.', ',')}%`
}

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function initials(name: string | null | undefined): string {
  if (!name) return 'W'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'W'
}
