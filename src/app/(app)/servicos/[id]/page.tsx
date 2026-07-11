import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { getBusinessContext } from '@/lib/queries'
import { ServiceWizard } from './ServiceWizard'

export const dynamic = 'force-dynamic'

// Telas 08 e 09 — Wizard/editor de serviço + resultado.
export default async function ServicoEditorPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { new?: string }
}) {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const [{ data: service }, { data: inputs }, { data: products }, ctx] = await Promise.all([
    supabase.from('services').select('*').eq('id', params.id).single(),
    supabase.from('service_inputs').select('*').eq('service_id', params.id),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    getBusinessContext(),
  ])

  if (!service) notFound()

  return (
    <ServiceWizard
      service={service}
      initialInputs={inputs ?? []}
      products={products ?? []}
      hourlyCostCents={ctx.hourlyCostCents}
      isNew={searchParams.new === '1'}
    />
  )
}
