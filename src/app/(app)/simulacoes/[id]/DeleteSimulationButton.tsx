'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function DeleteSimulationButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function remove() {
    if (!confirm('Excluir esta simulação?')) return
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
