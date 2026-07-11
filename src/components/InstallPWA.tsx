'use client'

import { useEffect, useState } from 'react'
import { Download, Share, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWA() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [standalone, setStandalone] = useState(true)
  const [iosHelp, setIosHelp] = useState(false)

  useEffect(() => {
    const ua = window.navigator.userAgent
    setIsIOS(/iphone|ipad|ipod/i.test(ua))
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setStandalone(isStandalone)

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', () => setStandalone(true))
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  // Já instalado / rodando como app: não mostra nada.
  if (standalone) return null
  // Sem prompt (Android) e não é iOS: navegador não suporta instalar — não mostra.
  if (!deferred && !isIOS) return null

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <>
      <Button
        variant="outline"
        fullWidth
        size="lg"
        onClick={() => (deferred ? install() : setIosHelp(true))}
      >
        <Download className="h-4 w-4" /> Instalar app
      </Button>

      <BottomSheet
        open={iosHelp}
        onClose={() => setIosHelp(false)}
        title="Instalar no iPhone"
        subtitle="Adicione o W Calculadora à tela de início."
      >
        <ol className="space-y-3">
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-champagne text-gold">
              <Share className="h-5 w-5" />
            </span>
            <span className="text-[14px]">
              Toque no botão <b>Compartilhar</b> na barra do Safari.
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-champagne text-gold">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-[14px]">
              Escolha <b>Adicionar à Tela de Início</b>.
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-champagne text-[13px] font-bold text-gold">
              3
            </span>
            <span className="text-[14px]">
              Confirme em <b>Adicionar</b>. Pronto!
            </span>
          </li>
        </ol>
      </BottomSheet>
    </>
  )
}
