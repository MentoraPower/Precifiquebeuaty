import { NextRequest, NextResponse } from 'next/server'
import { processHublaWebhook } from '@/lib/hubla'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Webhook padrão (oferta avulsa do Precifica Beauty).
export async function POST(req: NextRequest) {
  return processHublaWebhook(req, { endpoint: 'hubla' })
}

// Só para conferir no navegador que o webhook está no ar (a Hubla usa POST).
export function GET() {
  return NextResponse.json({ ok: true, webhook: 'hubla', note: 'Endpoint ativo. Use POST (a Hubla envia POST).' })
}
