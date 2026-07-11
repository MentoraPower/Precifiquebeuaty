/**
 * Motor de cálculo central — funções puras, nunca duplicadas nos componentes.
 * Baseado nas "Regras financeiras consolidadas" da especificação.
 *
 * ATENÇÃO TÉCNICA: taxas, impostos, comissão e margem são percentuais do
 * PREÇO FINAL. Nunca somar percentuais diretamente ao custo.
 */
import { BPS_DENOMINATOR, percentOfCents, roundCents } from './money'
import type {
  BusinessCost,
  BusinessSettings,
  CampaignCalculationInput,
  CampaignResult,
  CampaignStatus,
  Investment,
  MoneyCents,
  PricingInput,
  PricingResult,
  Product,
} from './types'

/** Horas produtivas no mês. */
export function calculateMonthlyHours(settings: Pick<BusinessSettings, 'workingDays' | 'workingHoursDay'>): number {
  return settings.workingDays * settings.workingHoursDay
}

/** Depreciação mensal somada de todos os investimentos. */
export function calculateMonthlyDepreciation(investments: Investment[]): MoneyCents {
  return roundCents(
    investments.reduce((sum, inv) => {
      if (inv.usefulLifeMonths <= 0) return sum
      const depreciable = inv.purchaseValueCents - inv.residualValueCents
      if (depreciable <= 0) return sum
      return sum + depreciable / inv.usefulLifeMonths
    }, 0),
  )
}

export function sumCosts(costs: BusinessCost[], type: BusinessCost['type']): MoneyCents {
  return costs
    .filter((c) => c.active && c.type === type)
    .reduce((sum, c) => sum + c.amountCents, 0)
}

/**
 * Custo da hora do negócio.
 * Retorna null quando não há horas mensais (divisor zero) — a UI deve orientar.
 */
export function calculateHourlyBusinessCost(
  settings: BusinessSettings,
  costs: BusinessCost[],
  investments: Investment[],
): MoneyCents | null {
  const monthlyHours = calculateMonthlyHours(settings)
  if (monthlyHours <= 0) return null

  const fixed = sumCosts(costs, 'fixed')
  const variable = sumCosts(costs, 'variable')
  const depreciation = calculateMonthlyDepreciation(investments)
  const monthlyCost = settings.proLaboreCents + fixed + variable + depreciation

  return roundCents(monthlyCost / monthlyHours)
}

/** Custo unitário de um produto/insumo considerando desperdício (waste). */
export function calculateProductUnitCost(product: Product): MoneyCents {
  const effectiveQty = product.packageQuantity * (1 - product.wasteBps / BPS_DENOMINATOR)
  if (effectiveQty <= 0) return 0
  // Custo por unidade — não arredondado aqui para preservar precisão em multiplicações.
  return product.packagePriceCents / effectiveQty
}

/** Custo de um insumo dentro de um serviço. */
export function calculateServiceInputCost(product: Product, quantityUsed: number): MoneyCents {
  return roundCents(calculateProductUnitCost(product) * quantityUsed)
}

/** Custo base do serviço = tempo + insumos + custos adicionais fixos. */
export function calculateServiceBaseCost(input: {
  durationMinutes: number
  hourlyBusinessCostCents: MoneyCents
  inputsCostCents: MoneyCents
  additionalCostCents: MoneyCents
}): MoneyCents {
  const timeCost = input.hourlyBusinessCostCents * (input.durationMinutes / 60)
  return roundCents(timeCost + input.inputsCostCents + input.additionalCostCents)
}

/**
 * Precificação completa de um serviço.
 * suggestedPrice = baseCost / (1 - mandatoryRate - profitRate)
 * minimumPrice   = baseCost / (1 - mandatoryRate)
 */
export function calculatePricing(input: PricingInput): PricingResult {
  const warnings: string[] = []

  const baseCostCents = calculateServiceBaseCost(input)

  const mandatoryBps = input.cardFeeBps + input.taxBps + input.partnerCommissionBps
  const mandatoryRate = mandatoryBps / BPS_DENOMINATOR
  const profitRate = input.desiredMarginBps / BPS_DENOMINATOR

  const empty: PricingResult = {
    baseCostCents,
    minimumPriceCents: 0,
    suggestedPriceCents: 0,
    cardFeeCents: 0,
    taxCents: 0,
    commissionCents: 0,
    profitCents: 0,
    effectiveMarginBps: 0,
    warnings,
    ok: false,
  }

  if (mandatoryRate >= 1) {
    warnings.push('As taxas obrigatórias somam 100% ou mais do preço. Revise taxas, impostos e comissão.')
    return empty
  }
  if (mandatoryRate + profitRate >= 1) {
    warnings.push('Taxas + margem desejada somam 100% ou mais. Reduza a margem ou as taxas.')
    return empty
  }

  const suggestedPriceCents = roundCents(baseCostCents / (1 - mandatoryRate - profitRate))
  const minimumPriceCents = roundCents(baseCostCents / (1 - mandatoryRate))

  const cardFeeCents = percentOfCents(suggestedPriceCents, input.cardFeeBps)
  const taxCents = percentOfCents(suggestedPriceCents, input.taxBps)
  const commissionCents = percentOfCents(suggestedPriceCents, input.partnerCommissionBps)
  const profitCents = suggestedPriceCents - baseCostCents - cardFeeCents - taxCents - commissionCents

  const effectiveMarginBps =
    suggestedPriceCents > 0 ? Math.round((profitCents / suggestedPriceCents) * BPS_DENOMINATOR) : 0

  if (profitCents < 0) warnings.push('O preço sugerido resulta em prejuízo. Revise custos e taxas.')

  return {
    baseCostCents,
    minimumPriceCents,
    suggestedPriceCents,
    cardFeeCents,
    taxCents,
    commissionCents,
    profitCents,
    effectiveMarginBps,
    warnings,
    ok: true,
  }
}

function campaignAnalysis(status: CampaignStatus, breakEven: number | null, expected: number, profit: MoneyCents): string {
  const disclaimer = ' Os resultados são projeções baseadas nos dados inseridos.'
  switch (status) {
    case 'risk':
      return 'Sua previsão não recupera o investimento. Aumente as vendas, reduza gastos ou ajuste a oferta.' + disclaimer
    case 'attention':
      return 'A campanha se paga, mas o retorno está baixo para o risco assumido.' + disclaimer
    case 'loss':
      return 'A campanha gera prejuízo com as premissas atuais. Ajuste investimento, preço ou volume.' + disclaimer
    case 'healthy':
    default:
      if (breakEven != null && expected >= breakEven && profit >= 0) {
        return 'A campanha apresenta retorno saudável com as premissas atuais.' + disclaimer
      }
      return 'A campanha apresenta forte potencial de retorno, desde que a previsão de vendas seja realista.' + disclaimer
  }
}

/**
 * Viabilidade de campanha: ponto de equilíbrio, lucro previsto e ROI.
 * ROI = lucro líquido da campanha / investimento (nunca receita/investimento).
 */
export function calculateCampaign(input: CampaignCalculationInput): CampaignResult {
  const variableFees = percentOfCents(input.salePriceCents, input.cardFeeBps + input.taxBps + input.commissionBps)
  const contributionPerSaleCents = input.salePriceCents - input.baseCostCents - variableFees

  const base: CampaignResult = {
    viable: false,
    investmentCents: input.investmentCents,
    contributionPerSaleCents,
    breakEvenSales: null,
    revenueCents: roundCents(input.salePriceCents * input.expectedSales),
    campaignProfitCents: 0,
    roiBps: null,
    costPerAcquiredSaleCents: input.expectedSales > 0 ? roundCents(input.investmentCents / input.expectedSales) : null,
    status: 'loss',
    analysis: '',
  }

  if (contributionPerSaleCents <= 0) {
    return {
      ...base,
      reason: 'NON_POSITIVE_CONTRIBUTION',
      analysis: 'A oferta não gera lucro por venda. Ajuste preço, custo ou taxas antes de investir na campanha.',
    }
  }

  const breakEvenSales = Math.ceil(input.investmentCents / contributionPerSaleCents)
  const campaignProfitCents = roundCents(contributionPerSaleCents * input.expectedSales - input.investmentCents)
  const roiBps =
    input.investmentCents > 0 ? Math.round((campaignProfitCents / input.investmentCents) * BPS_DENOMINATOR) : null

  let status: CampaignStatus
  if (campaignProfitCents < 0) status = 'loss'
  else if (breakEvenSales > input.expectedSales) status = 'risk'
  else if (roiBps != null && roiBps < 2000) status = 'attention'
  else status = 'healthy'

  return {
    ...base,
    viable: campaignProfitCents >= 0,
    breakEvenSales,
    campaignProfitCents,
    roiBps,
    status,
    analysis: campaignAnalysis(status, breakEvenSales, input.expectedSales, campaignProfitCents),
  }
}
