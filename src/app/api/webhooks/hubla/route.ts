import { NextRequest } from 'next/server'
import { processHublaWebhook } from '@/lib/hubla'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Webhook padrão (oferta avulsa do Precifica Beauty).
export async function POST(req: NextRequest) {
  return processHublaWebhook(req, { endpoint: 'hubla' })
}
