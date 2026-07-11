/**
 * Contratos do motor de precificação.
 * Regra de ouro: dinheiro em centavos inteiros (MoneyCents),
 * percentuais em basis points (BasisPoints): 100% = 10000 bps.
 */
export type MoneyCents = number
export type BasisPoints = number

export interface BusinessSettings {
  proLaboreCents: MoneyCents
  workingDays: number
  workingHoursDay: number
}

export type CostType = 'fixed' | 'variable'

export interface BusinessCost {
  type: CostType
  amountCents: MoneyCents
  active: boolean
}

export interface Investment {
  purchaseValueCents: MoneyCents
  usefulLifeMonths: number
  residualValueCents: MoneyCents
}

export interface Product {
  packagePriceCents: MoneyCents
  packageQuantity: number
  wasteBps: BasisPoints
}

export interface PricingInput {
  durationMinutes: number
  hourlyBusinessCostCents: MoneyCents
  inputsCostCents: MoneyCents
  additionalCostCents: MoneyCents
  cardFeeBps: BasisPoints
  taxBps: BasisPoints
  partnerCommissionBps: BasisPoints
  desiredMarginBps: BasisPoints
}

export interface PricingResult {
  baseCostCents: MoneyCents
  minimumPriceCents: MoneyCents
  suggestedPriceCents: MoneyCents
  cardFeeCents: MoneyCents
  taxCents: MoneyCents
  commissionCents: MoneyCents
  profitCents: MoneyCents
  /** margem real sobre o preço sugerido, em bps */
  effectiveMarginBps: BasisPoints
  warnings: string[]
  ok: boolean
}

export type DiscountType = 'percentage' | 'amount'

export interface CampaignCalculationInput {
  investmentCents: MoneyCents
  expectedSales: number
  salePriceCents: MoneyCents
  baseCostCents: MoneyCents
  cardFeeBps: BasisPoints
  taxBps: BasisPoints
  commissionBps: BasisPoints
}

export type CampaignStatus = 'healthy' | 'attention' | 'risk' | 'loss'

export interface CampaignResult {
  viable: boolean
  reason?: 'NON_POSITIVE_CONTRIBUTION'
  investmentCents: MoneyCents
  contributionPerSaleCents: MoneyCents
  breakEvenSales: number | null
  revenueCents: MoneyCents
  campaignProfitCents: MoneyCents
  /** ROI em bps (100% = 10000) */
  roiBps: BasisPoints | null
  costPerAcquiredSaleCents: MoneyCents | null
  status: CampaignStatus
  analysis: string
}
