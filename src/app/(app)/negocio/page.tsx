import { getBusinessContext } from '@/lib/queries'
import { AppHeader } from '@/components/layout/AppHeader'
import { NegocioClient } from './NegocioClient'

export const dynamic = 'force-dynamic'

// Tela 04 — Meu negócio.
export default async function NegocioPage() {
  const ctx = await getBusinessContext()
  return (
    <main>
      <AppHeader back title="Meu negócio" subtitle="Configure os dados para cálculos precisos." />
      <div className="px-5 pt-3">
        <NegocioClient
          initial={{
            proLaboreCents: ctx.settings?.pro_labore_cents ?? 0,
            workingDays: ctx.settings?.working_days ?? 0,
            workingHoursDay: ctx.settings?.working_hours_day ?? 0,
          }}
          fixedTotalCents={ctx.fixedTotalCents}
          variableTotalCents={ctx.variableTotalCents}
          depreciationCents={ctx.depreciationCents}
          hourlyCostCents={ctx.hourlyCostCents}
        />
      </div>
    </main>
  )
}
