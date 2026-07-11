import type { Product } from '@/lib/pricing'
import type { ProductRow } from '@/lib/database.types'

/** Converte a linha do banco (snake_case) no contrato do motor (camelCase). */
export function toProduct(row: ProductRow): Product {
  return {
    packagePriceCents: row.package_price_cents,
    packageQuantity: row.package_quantity,
    wasteBps: row.waste_bps,
  }
}
