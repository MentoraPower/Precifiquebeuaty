import { createClient } from '@/lib/supabase/server'
import {
  calculateHourlyBusinessCost,
  calculateMonthlyDepreciation,
  calculateMonthlyHours,
  sumCosts,
} from '@/lib/pricing'
import type { BusinessCost, BusinessSettings, Investment } from '@/lib/pricing'
import type { BusinessCostRow, BusinessSettingsRow, InvestmentRow } from '@/lib/database.types'

export interface BusinessContext {
  settings: BusinessSettingsRow | null
  costs: BusinessCostRow[]
  investments: InvestmentRow[]
  fixedTotalCents: number
  variableTotalCents: number
  depreciationCents: number
  monthlyHours: number
  hourlyCostCents: number | null
  monthlyCostCents: number
  configured: boolean
}

function toSettings(row: BusinessSettingsRow | null): BusinessSettings {
  return {
    proLaboreCents: row?.pro_labore_cents ?? 0,
    workingDays: row?.working_days ?? 0,
    workingHoursDay: row?.working_hours_day ?? 0,
  }
}

function toCosts(rows: BusinessCostRow[]): BusinessCost[] {
  return rows.map((r) => ({ type: r.type, amountCents: r.amount_cents, active: r.active }))
}

function toInvestments(rows: InvestmentRow[]): Investment[] {
  return rows.map((r) => ({
    purchaseValueCents: r.purchase_value_cents,
    usefulLifeMonths: r.useful_life_months,
    residualValueCents: r.residual_value_cents,
  }))
}

/** Contexto do negócio + custo da hora, base de todos os cálculos. */
export async function getBusinessContext(): Promise<BusinessContext> {
  const supabase = createClient()
  const [settingsRes, costsRes, invRes] = await Promise.all([
    supabase.from('business_settings').select('*').maybeSingle(),
    supabase.from('business_costs').select('*').eq('active', true),
    supabase.from('investments').select('*'),
  ])

  const settings = settingsRes.data
  const costs = costsRes.data ?? []
  const investments = invRes.data ?? []

  const s = toSettings(settings)
  const c = toCosts(costs)
  const inv = toInvestments(investments)

  const fixedTotalCents = sumCosts(c, 'fixed')
  const variableTotalCents = sumCosts(c, 'variable')
  const depreciationCents = calculateMonthlyDepreciation(inv)
  const monthlyHours = calculateMonthlyHours(s)
  const hourlyCostCents = calculateHourlyBusinessCost(s, c, inv)
  const monthlyCostCents = s.proLaboreCents + fixedTotalCents + variableTotalCents + depreciationCents

  return {
    settings,
    costs,
    investments,
    fixedTotalCents,
    variableTotalCents,
    depreciationCents,
    monthlyHours,
    hourlyCostCents,
    monthlyCostCents,
    configured: !!settings && monthlyHours > 0,
  }
}
