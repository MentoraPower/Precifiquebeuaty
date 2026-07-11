'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useConfirm } from '@/components/ConfirmProvider'

export function DeleteSimulationButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()
  const confirm = useConfirm()
  const [loading, setLoading] = useState(false)

  async function remove() {
    const ok = await confirm({ title: 'Excluir simulação', message: 'Deseja excluir esta simulação?', confirmLabel: 'Excluir', danger: true })
    if (!ok) return
    setLoading(true)
    await supabase.from('simulations').delete().eq('id', id)
    router.push('/simulacoes')
    router.refresh()
  }

  return (
    <Button variant="danger" className="flex-1" onClick={remove} loading={loading}>
      Excluir
    </Button>
  )
}
