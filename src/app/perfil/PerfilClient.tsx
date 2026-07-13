'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar, resizeImage } from '@/components/Avatar'
import { useConfirm } from '@/components/ConfirmProvider'
import { isRealImage } from '@/lib/image'

export function PerfilClient({
  email,
  fullName,
  profession,
  phone,
  avatarUrl: initialAvatarUrl,
}: {
  email: string
  fullName: string
  profession: string
  phone: string
  avatarUrl: string | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const confirm = useConfirm()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(fullName)
  const [prof, setProf] = useState(profession)
  const [tel, setTel] = useState(phone)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // troca de senha
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwDone, setPwDone] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return

    // Segurança: confirma que é uma foto de verdade (analisa o conteúdo, não a extensão).
    if (!(await isRealImage(file))) {
      await confirm({
        title: 'Foto não validada',
        message:
          'Isso não é uma foto, e existem arquivos que podem prejudicar você e a nossa estrutura. Não conseguimos validar — por favor, suba uma foto real.',
        confirmLabel: 'Ok',
        cancelLabel: 'Fechar',
      })
      return
    }

    setUploading(true)
    try {
      const blob = await resizeImage(file, 256)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const path = `${user.id}/avatar.jpg`
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      setAvatarUrl(url)
      router.refresh()
    } catch {
      await confirm({ title: 'Não foi possível enviar a foto', message: 'Tente novamente com outra imagem.', confirmLabel: 'Ok', cancelLabel: 'Fechar' })
    } finally {
      setUploading(false)
    }
  }

  async function saveProfile() {
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ full_name: name, profession: prof, phone: tel }).eq('id', user.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
    router.refresh()
  }

  async function changePassword() {
    setPwError(null)
    if (pw1.length < 6) return setPwError('A senha precisa de ao menos 6 caracteres.')
    if (pw1 !== pw2) return setPwError('As senhas não coincidem.')
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pw1 })
    setPwSaving(false)
    if (error) return setPwError('Não foi possível alterar a senha.')
    setPwDone(true)
    setPw1('')
    setPw2('')
    setTimeout(() => setPwDone(false), 2500)
  }

  return (
    <main className="pb-16">
      <AppHeader back center title="Perfil" subtitle="Seus dados e senha de acesso." />

      <div className="space-y-6 px-5 pt-2">
        {/* Foto */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar url={avatarUrl} name={name} size={96} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Trocar foto"
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-pill border-[3px] border-surface bg-ink text-white transition active:scale-95"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
          </div>
          <button onClick={() => fileRef.current?.click()} className="mt-3 text-[13px] font-semibold text-brown" disabled={uploading}>
            {uploading ? 'Enviando…' : 'Trocar foto'}
          </button>
        </div>

        {/* Dados */}
        <div className="space-y-4 rounded-card border border-line bg-bg p-5">
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          <Input label="Profissão" value={prof} onChange={(e) => setProf(e.target.value)} placeholder="Ex.: Designer de sobrancelhas" />
          <Input label="Telefone" type="tel" inputMode="tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="(11) 90000-0000" />
          <Input label="E-mail" value={email} disabled hint="O e-mail de acesso não pode ser alterado." />
          <Button fullWidth size="lg" loading={saving} onClick={saveProfile} className="rounded-pill">
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Salvo
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>

        {/* Trocar senha */}
        <div className="space-y-4 rounded-card border border-line bg-bg p-5">
          <div>
            <h2 className="text-[16px] font-semibold">Trocar senha</h2>
            <p className="text-[13px] text-muted">Defina uma nova senha de acesso.</p>
          </div>
          <Input label="Nova senha" type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="Mínimo 6 caracteres" />
          <Input label="Confirmar nova senha" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Repita a senha" />
          {pwError && <p className="text-[13px] text-danger">{pwError}</p>}
          {pwDone && (
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-success">
              <Check className="h-4 w-4" /> Senha alterada!
            </p>
          )}
          <Button fullWidth size="lg" variant="outline" loading={pwSaving} onClick={changePassword} className="rounded-pill">
            Salvar nova senha
          </Button>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </main>
  )
}
