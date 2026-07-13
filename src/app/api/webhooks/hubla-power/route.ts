import { NextRequest } from 'next/server'
import { processHublaWebhook } from '@/lib/hubla'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Oferta "Power Academy + Precifica Beauty":
// só libera acesso se o event.sellerId bater com o id abaixo.
const POWER_SELLER_ID = 'sEYelMfYP4JMXrKRGS60'

export async function POST(req: NextRequest) {
  return processHublaWebhook(req, { requireSellerId: POWER_SELLER_ID })
}
