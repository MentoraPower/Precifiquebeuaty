import { describe, expect, it } from 'vitest'
import {
  calculateCampaign,
  calculateHourlyBusinessCost,
  calculateMonthlyDepreciation,
  calculateMonthlyHours,
  calculatePricing,
  calculateProductUnitCost,
  calculateServiceInputCost,
} from './engine'
import { reaisToCents, percentToBps } from './money'

describe('custo da hora do negócio', () => {
  it('calcula com 22 dias, 8 horas e custos conhecidos', () => {
    const settings = { proLaboreCents: reaisToCents(5000), workingDays: 22, workingHoursDay: 8 }
    const costs = [
      { type: 'fixed' as const, amountCents: reaisToCents(2350), active: true },
      { type: 'variable' as const, amountCents: reaisToCents(600), active: true },
    ]
    expect(calculateMonthlyHours(settings)).toBe(176)
    // (5000 + 2350 + 600) / 176 = 45,17...
    const hourly = calculateHourlyBusinessCost(settings, costs, [])
    expect(hourly).toBe(reaisToCents(45.17))
  })

  it('retorna null quando não há horas (divisor zero)', () => {
    const settings = { proLaboreCents: reaisToCents(5000), workingDays: 0, workingHoursDay: 8 }
    expect(calculateHourlyBusinessCost(settings, [], [])).toBeNull()
  })

  it('inclui depreciação mensal dos investimentos', () => {
    const invs = [{ purchaseValueCents: reaisToCents(1200), usefulLifeMonths: 24, residualValueCents: 0 }]
    expect(calculateMonthlyDepreciation(invs)).toBe(reaisToCents(50))
  })
})

describe('produto com desperdício', () => {
  it('aplica waste no rendimento efetivo', () => {
    // Embalagem R$ 58,00, 150 g, 10% de desperdício => 135 g efetivos.
    const product = { packagePriceCents: reaisToCents(58), packageQuantity: 150, wasteBps: percentToBps(10) }
    const unit = calculateProductUnitCost(product)
    expect(unit).toBeCloseTo(reaisToCents(58) / 135, 5)
    // 0,25 g usados
    const cost = calculateServiceInputCost(product, 0.25)
    expect(cost).toBe(Math.round((reaisToCents(58) / 135) * 0.25))
  })
})

describe('precificação de serviço', () => {
  it('serviço de 90 min com múltiplos insumos, taxas + margem abaixo de 100%', () => {
    const result = calculatePricing({
      durationMinutes: 90,
      hourlyBusinessCostCents: reaisToCents(45.17),
      inputsCostCents: reaisToCents(12.5),
      additionalCostCents: 0,
      cardFeeBps: percentToBps(3),
      taxBps: percentToBps(6),
      partnerCommissionBps: 0,
      desiredMarginBps: percentToBps(45),
    })
    expect(result.ok).toBe(true)
    expect(result.suggestedPriceCents).toBeGreaterThan(result.minimumPriceCents)
    // lucro = preço - base - taxas
    const recomposed =
      result.suggestedPriceCents -
      result.baseCostCents -
      result.cardFeeCents -
      result.taxCents -
      result.commissionCents
    expect(result.profitCents).toBe(recomposed)
  })

  it('bloqueia quando percentuais somam 100% ou mais', () => {
    const result = calculatePricing({
      durationMinutes: 60,
      hourlyBusinessCostCents: reaisToCents(50),
      inputsCostCents: 0,
      additionalCostCents: 0,
      cardFeeBps: percentToBps(60),
      taxBps: percentToBps(30),
      partnerCommissionBps: percentToBps(10),
      desiredMarginBps: percentToBps(20),
    })
    expect(result.ok).toBe(false)
    expect(result.suggestedPriceCents).toBe(0)
    expect(result.warnings.length).toBeGreaterThan(0)
  })
})

describe('campanha', () => {
  it('investimento R$1.000 e contribuição R$100/venda => ponto de equilíbrio 10', () => {
    const r = calculateCampaign({
      investmentCents: reaisToCents(1000),
      expectedSales: 30,
      salePriceCents: reaisToCents(100),
      baseCostCents: 0,
      cardFeeBps: 0,
      taxBps: 0,
      commissionBps: 0,
    })
    expect(r.contributionPerSaleCents).toBe(reaisToCents(100))
    expect(r.breakEvenSales).toBe(10)
    expect(r.status).toBe('healthy')
  })

  it('vendas previstas abaixo do ponto de equilíbrio => risco', () => {
    const r = calculateCampaign({
      investmentCents: reaisToCents(1000),
      expectedSales: 5,
      salePriceCents: reaisToCents(100),
      baseCostCents: 0,
      cardFeeBps: 0,
      taxBps: 0,
      commissionBps: 0,
    })
    expect(r.breakEvenSales).toBe(10)
    expect(['risk', 'loss']).toContain(r.status)
  })

  it('contribuição <= 0 bloqueia resultado positivo', () => {
    const r = calculateCampaign({
      investmentCents: reaisToCents(1000),
      expectedSales: 30,
      salePriceCents: reaisToCents(50),
      baseCostCents: reaisToCents(60),
      cardFeeBps: 0,
      taxBps: 0,
      commissionBps: 0,
    })
    expect(r.viable).toBe(false)
    expect(r.reason).toBe('NON_POSITIVE_CONTRIBUTION')
  })

  it('ROI usa lucro líquido / investimento (não receita / investimento)', () => {
    const r = calculateCampaign({
      investmentCents: reaisToCents(1000),
      expectedSales: 30,
      salePriceCents: reaisToCents(100),
      baseCostCents: 0,
      cardFeeBps: 0,
      taxBps: 0,
      commissionBps: 0,
    })
    // lucro = 30*100 - 1000 = 2000; ROI = 2000/1000 = 200% = 20000 bps
    expect(r.campaignProfitCents).toBe(reaisToCents(2000))
    expect(r.roiBps).toBe(20000)
  })
})
