'use client'

import { useEffect, useState } from 'react'

// Saudação de acordo com o horário LOCAL da pessoa (navegador).
// 00–04h: Hora de dormir · 05–11h: Bom dia · 12–17h: Boa tarde · 18–23h: Boa noite
function greetingFor(hour: number) {
  if (hour < 5) return 'Hora de dormir'
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function Greeting({ name }: { name: string }) {
  const [prefix, setPrefix] = useState<string | null>(null)

  useEffect(() => {
    setPrefix(greetingFor(new Date().getHours()))
  }, [])

  return (
    <h1 className="text-[22px] font-semibold leading-tight">
      {prefix ? `${prefix}, ${name}` : name}
    </h1>
  )
}
