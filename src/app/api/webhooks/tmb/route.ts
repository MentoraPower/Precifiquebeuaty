import { NextRequest, NextResponse } from 'next/server'
import { processTmbWebhook } from '@/lib/tmb'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Webhook da TMB: libera no status aprovado (Efetivado) e encerra no cancelado/estornado.
export async function POST(req: NextRequest) {
  return processTmbWebhook(req)
}

// Só para conferir no navegador que o webhook está no ar (a TMB usa POST).
export function GET() {
  return NextResponse.json({ ok: true, webhook: 'tmb', note: 'Endpoint ativo. Use POST (a TMB envia POST).' })
}
