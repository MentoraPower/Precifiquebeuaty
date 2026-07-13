import { NextRequest } from 'next/server'
import { processHublaWebhook } from '@/lib/hubla'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Oferta "Power Academy + Precifica Beauty".
// Sem validação de sellerId: como só essa oferta dispara para este link,
// receber aqui já significa que a compra é dessa oferta.
export async function POST(req: NextRequest) {
  return processHublaWebhook(req, { endpoint: 'hubla-power' })
}
