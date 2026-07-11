'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Telas principais pré-carregadas ao entrar no app (código + dados via servidor).
// Com o cache de rotas dinâmicas (staleTimes), clicar abre na hora.
const ROUTES = [
  '/home',
  '/servicos',
  '/servicos/novo',
  '/simulacoes',
  '/simulacoes/novo',
  '/negocio',
  '/negocio/custos?type=fixed',
  '/negocio/custos?type=variable',
  '/negocio/insumos',
  '/negocio/investimentos',
  '/menu',
]

export function RoutePrefetcher() {
  const router = useRouter()

  useEffect(() => {
    // pequeno atraso para não competir com a renderização da tela atual
    const id = setTimeout(() => {
      for (const route of ROUTES) router.prefetch(route)
    }, 250)
    return () => clearTimeout(id)
  }, [router])

  return null
}
