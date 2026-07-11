'use client'

import { useEffect, useState } from 'react'
import { Download, Share, Plus, ChevronRight, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Linha "Instalar app" no menu que abre um popup centralizado. */
export function InstallPWARow() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [standalone, setStandalone] = useState(true)
  const [open, setOpen] = useState(false)

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

  if (standalone) return null
  if (!deferred && !isIOS) return null

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setOpen(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-champagne text-gold">
          <Download className="h-[18px] w-[18px]" />
        </span>
        <span className="flex-1 text-[14px] font-medium">Instalar app</span>
        <ChevronRight className="h-5 w-5 text-subtle" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Instalar o app" subtitle="Tenha o W Calculadora na tela de início.">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-champagne text-gold">
            <Smartphone className="h-8 w-8" />
          </span>

          {deferred ? (
            <>
              <p className="text-[14px] text-muted">Instale para abrir mais rápido, em tela cheia, direto do seu celular.</p>
              <Button size="lg" fullWidth className="mt-5" onClick={install}>
                <Download className="h-4 w-4" /> Instalar agora
              </Button>
            </>
          ) : (
            <div className="w-full text-left">
              <p className="mb-4 text-center text-[14px] text-muted">No iPhone, adicione pela barra do Safari:</p>
              <ol className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-surface text-gold">
                    <Share className="h-5 w-5" />
                  </span>
                  <span className="text-[14px]">
                    Toque em <b>Compartilhar</b>.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-surface text-gold">
                    <Plus className="h-5 w-5" />
                  </span>
                  <span className="text-[14px]">
                    Escolha <b>Adicionar à Tela de Início</b>.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-surface text-[13px] font-bold text-gold">
                    3
                  </span>
                  <span className="text-[14px]">
                    Confirme em <b>Adicionar</b>.
                  </span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
