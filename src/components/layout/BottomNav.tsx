'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Home, LayoutGrid, Plus, LineChart, Menu as MenuIcon, Scissors, Package, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/home', label: 'Início', icon: Home },
  { href: '/servicos', label: 'Serviços', icon: LayoutGrid },
  { href: '/simulacoes', label: 'Simulações', icon: LineChart },
  { href: '/menu', label: 'Menu', icon: MenuIcon },
]

const quickActions = [
  { href: '/servicos/novo', label: 'Novo serviço', desc: 'Precifique um atendimento', icon: Scissors },
  { href: '/negocio/insumos?add=1', label: 'Novo insumo', desc: 'Produto ou material', icon: Package },
  { href: '/negocio/custos?type=fixed&add=1', label: 'Novo custo', desc: 'Despesa fixa ou variável', icon: Receipt },
  { href: '/simulacoes/novo', label: 'Nova simulação', desc: 'Campanha, desconto, meta…', icon: LineChart },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Esconde a navegação nas telas de cadastro (wizards com Cancelar/Continuar).
  const isWizard =
    pathname.startsWith('/servicos/') ||
    pathname.startsWith('/simulacoes/campanha/') ||
    pathname.startsWith('/simulacoes/novo/') ||
    pathname.startsWith('/comunidade')
  if (isWizard) return null

  return (
    <>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto grid max-w-app grid-cols-5 items-center px-2 py-3">
          <NavItem {...items[0]} active={pathname.startsWith(items[0].href)} />
          <NavItem {...items[1]} active={pathname.startsWith('/servicos')} />
          <div className="flex justify-center">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Ações rápidas"
              aria-expanded={open}
              className={cn(
                'flex h-16 w-16 -translate-y-1/3 items-center justify-center rounded-pill bg-gradient-to-b from-[#4a3320] to-brown text-white shadow-float ring-4 ring-bg transition active:scale-95',
                open && 'rotate-45',
              )}
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>
          <NavItem {...items[2]} active={pathname.startsWith('/simulacoes')} />
          <NavItem {...items[3]} active={pathname.startsWith('/menu')} />
        </div>
      </nav>

      {open && (
        <>
          {/* clique fora fecha */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* dropdown ancorado acima do botão + */}
          <div className="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto max-w-app">
            <div className="relative mb-[96px] flex justify-center">
              <div className="pointer-events-auto w-[248px] overflow-hidden rounded-2xl border border-line bg-bg p-1.5 shadow-float">
                {quickActions.map((a, i) => (
                  <button
                    key={a.href}
                    onClick={() => {
                      setOpen(false)
                      router.push(a.href)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-surface active:scale-[0.99]',
                      i > 0 && 'mt-0.5',
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brown text-white">
                      <a.icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold leading-tight">{a.label}</span>
                      <span className="block text-[11px] text-muted">{a.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              {/* setinha apontando para o + */}
              <div className="pointer-events-none absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-line bg-bg" />
            </div>
          </div>
        </>
      )}
    </>
  )
}

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 py-1.5">
      <Icon className={cn('h-5 w-5', active ? 'text-ink' : 'text-subtle')} strokeWidth={active ? 2.2 : 1.8} />
      <span className={cn('text-[10px]', active ? 'font-semibold text-ink' : 'text-subtle')}>{label}</span>
    </Link>
  )
}
