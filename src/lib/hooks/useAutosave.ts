'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SaveState } from '@/components/ui/SaveStatus'

/**
 * Autosave com debounce (~700ms) e feedback Salvando/Salvo/Erro.
 * Passe uma função `save` que persiste o valor atual.
 */
export function useAutosave<T>(save: (value: T) => Promise<void>, delay = 700) {
  const [state, setState] = useState<SaveState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const lastValue = useRef<T>()
  const savedTimer = useRef<ReturnType<typeof setTimeout>>()

  const run = useCallback(
    async (value: T) => {
      setState('saving')
      try {
        await save(value)
        setState('saved')
        clearTimeout(savedTimer.current)
        savedTimer.current = setTimeout(() => setState('idle'), 1800)
      } catch {
        setState('error')
      }
    },
    [save],
  )

  const trigger = useCallback(
    (value: T) => {
      lastValue.current = value
      clearTimeout(timer.current)
      timer.current = setTimeout(() => run(value), delay)
    },
    [run, delay],
  )

  const retry = useCallback(() => {
    if (lastValue.current !== undefined) run(lastValue.current)
  }, [run])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { state, trigger, retry }
}
