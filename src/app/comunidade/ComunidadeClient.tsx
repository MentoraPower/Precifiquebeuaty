'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ImagePlus, Send, Smile, MessagesSquare, X, Loader2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useConfirm } from '@/components/ConfirmProvider'
import type { CommunityPostRow, CommunityReactionRow } from '@/lib/database.types'

const EMOJIS = ['❤️', '🔥', '👏', '😍', '👍', '🎉']

type Counts = Record<string, Record<string, number>>

function buildCounts(rows: CommunityReactionRow[]) {
  const counts: Counts = {}
  for (const r of rows) {
    counts[r.post_id] ??= {}
    counts[r.post_id][r.emoji] = (counts[r.post_id][r.emoji] ?? 0) + 1
  }
  return counts
}

export function ComunidadeClient({
  userId,
  isAdmin,
  initialPosts,
  initialReactions,
}: {
  userId: string
  isAdmin: boolean
  initialPosts: CommunityPostRow[]
  initialReactions: CommunityReactionRow[]
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const confirm = useConfirm()

  const [posts, setPosts] = useState<CommunityPostRow[]>(initialPosts)
  const [counts, setCounts] = useState<Counts>(() => buildCounts(initialReactions))
  const [mine, setMine] = useState<Set<string>>(
    () => new Set(initialReactions.filter((r) => r.user_id === userId).map((r) => `${r.post_id}:${r.emoji}`)),
  )
  const [pickerFor, setPickerFor] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useEffect(() => {
    scrollToBottom(false)
  }, [scrollToBottom])

  // --- Realtime ---
  useEffect(() => {
    const channel = supabase
      .channel('comunidade')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, (payload) => {
        const post = payload.new as CommunityPostRow
        setPosts((prev) => (prev.some((p) => p.id === post.id) ? prev : [...prev, post]))
        setTimeout(() => scrollToBottom(true), 60)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'community_posts' }, (payload) => {
        const old = payload.old as { id: string }
        setPosts((prev) => prev.filter((p) => p.id !== old.id))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_reactions' }, (payload) => {
        const r = payload.new as CommunityReactionRow
        if (r.user_id === userId) return // já aplicado de forma otimista
        bump(r.post_id, r.emoji, 1)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'community_reactions' }, (payload) => {
        const r = payload.old as CommunityReactionRow
        if (!r?.post_id || r.user_id === userId) return
        bump(r.post_id, r.emoji, -1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, userId])

  function bump(postId: string, emoji: string, delta: number) {
    setCounts((prev) => {
      const post = { ...(prev[postId] ?? {}) }
      const next = (post[emoji] ?? 0) + delta
      if (next <= 0) delete post[emoji]
      else post[emoji] = next
      return { ...prev, [postId]: post }
    })
  }

  async function toggleReaction(postId: string, emoji: string) {
    const key = `${postId}:${emoji}`
    const has = mine.has(key)
    // otimista
    setMine((prev) => {
      const n = new Set(prev)
      has ? n.delete(key) : n.add(key)
      return n
    })
    bump(postId, emoji, has ? -1 : 1)
    setPickerFor(null)

    if (has) {
      await supabase.from('community_reactions').delete().eq('post_id', postId).eq('emoji', emoji).eq('user_id', userId)
    } else {
      const { error } = await supabase.from('community_reactions').insert({ post_id: postId, emoji, user_id: userId })
      if (error) {
        // reverte em caso de falha
        setMine((prev) => {
          const n = new Set(prev)
          n.delete(key)
          return n
        })
        bump(postId, emoji, -1)
      }
    }
  }

  async function deletePost(post: CommunityPostRow) {
    const ok = await confirm({ title: 'Excluir publicação', message: 'Deseja remover esta publicação da comunidade?', confirmLabel: 'Excluir', danger: true })
    if (!ok) return
    setPosts((prev) => prev.filter((p) => p.id !== post.id))
    await supabase.from('community_posts').delete().eq('id', post.id)
  }

  return (
    <main className="flex h-[100dvh] flex-col bg-surface">
      {/* Cabeçalho do canal */}
      <header
        className="flex shrink-0 items-center gap-3 border-b border-line bg-bg px-4 pb-3"
        style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 0px) + 12px)' }}
      >
        <button onClick={() => router.back()} aria-label="Voltar" className="-ml-1 rounded-pill p-1.5 text-ink hover:bg-line/50">
          <ChevronLeft className="h-6 w-6" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="Precifica Beauty" className="h-11 w-11 rounded-2xl object-cover ring-1 ring-line" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold leading-tight">Comunidade Precifica</p>
          <p className="text-[12px] text-muted">Novidades e conteúdos exclusivos</p>
        </div>
      </header>

      {/* Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4" onClick={() => setPickerFor(null)}>
        {posts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brown/10 text-brown">
              <MessagesSquare className="h-7 w-7" />
            </span>
            <p className="mt-4 text-[15px] font-semibold">Nada por aqui ainda</p>
            <p className="mt-1 max-w-[240px] text-[13px] text-muted">
              Em breve, novidades e conteúdos vão aparecer neste canal.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostBubble
                key={post.id}
                post={post}
                counts={counts[post.id] ?? {}}
                mine={mine}
                isAdmin={isAdmin}
                pickerOpen={pickerFor === post.id}
                onOpenPicker={() => setPickerFor((v) => (v === post.id ? null : post.id))}
                onReact={(emoji) => toggleReaction(post.id, emoji)}
                onDelete={() => deletePost(post)}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {isAdmin ? (
        <Composer supabase={supabase} userId={userId} onSent={() => scrollToBottom(true)} />
      ) : (
        <div
          className="shrink-0 border-t border-line bg-bg px-5 pt-3 text-center text-[12px] text-muted"
          style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 0px) + 12px)' }}
        >
          Somente leitura · reaja aos conteúdos ✨
        </div>
      )}
    </main>
  )
}

function PostBubble({
  post,
  counts,
  mine,
  isAdmin,
  pickerOpen,
  onOpenPicker,
  onReact,
  onDelete,
}: {
  post: CommunityPostRow
  counts: Record<string, number>
  mine: Set<string>
  isAdmin: boolean
  pickerOpen: boolean
  onOpenPicker: () => void
  onReact: (emoji: string) => void
  onDelete: () => void
}) {
  const time = new Date(post.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const active = EMOJIS.filter((e) => (counts[e] ?? 0) > 0)

  return (
    <div className="flex max-w-[86%] flex-col">
      <div className="relative overflow-hidden rounded-2xl rounded-tl-md border border-line bg-bg shadow-[0_1px_2px_rgba(17,17,17,0.04)]">
        {isAdmin && (
          <button
            onClick={onDelete}
            aria-label="Excluir"
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-pill bg-ink/50 text-white backdrop-blur"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        {post.media_url && post.media_type === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.media_url} alt="" className="max-h-[420px] w-full object-cover" />
        )}
        {post.media_url && post.media_type === 'video' && (
          <video src={post.media_url} controls playsInline className="max-h-[420px] w-full bg-black object-contain" />
        )}

        {post.body && <p className="whitespace-pre-wrap px-4 py-3 text-[14px] leading-relaxed text-ink">{post.body}</p>}

        <div className={`flex items-center justify-end gap-1 px-3 ${post.body ? 'pb-2' : 'py-2'}`}>
          <span className="text-[11px] text-subtle">{time}</span>
        </div>
      </div>

      {/* Reações */}
      <div className="relative mt-1.5 flex flex-wrap items-center gap-1.5 pl-1">
        {active.map((e) => {
          const isMine = mine.has(`${post.id}:${e}`)
          return (
            <button
              key={e}
              onClick={() => onReact(e)}
              className={`flex items-center gap-1 rounded-pill border px-2 py-1 text-[13px] transition ${
                isMine ? 'border-brown/40 bg-brown/10' : 'border-line bg-bg'
              }`}
            >
              <span>{e}</span>
              <span className="text-[12px] font-semibold text-muted">{counts[e]}</span>
            </button>
          )
        })}

        <button
          onClick={(ev) => {
            ev.stopPropagation()
            onOpenPicker()
          }}
          aria-label="Reagir"
          className="flex h-7 w-7 items-center justify-center rounded-pill border border-line bg-bg text-muted transition active:scale-95"
        >
          <Smile className="h-4 w-4" />
        </button>

        {pickerOpen && (
          <div
            onClick={(ev) => ev.stopPropagation()}
            className="absolute bottom-9 left-1 z-20 flex items-center gap-1 rounded-pill border border-line bg-bg px-2 py-1.5 shadow-float"
          >
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => onReact(e)}
                className={`flex h-8 w-8 items-center justify-center rounded-pill text-[18px] transition active:scale-90 ${
                  mine.has(`${post.id}:${e}`) ? 'bg-brown/10' : 'hover:bg-surface'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Composer({
  supabase,
  userId,
  onSent,
}: {
  supabase: ReturnType<typeof createClient>
  userId: string
  onSent: () => void
}) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (fileRef.current) fileRef.current.value = ''
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
  }

  async function send() {
    const body = text.trim()
    if (!body && !file) return
    setSending(true)
    try {
      let media_url: string | null = null
      let media_type: 'image' | 'video' | null = null
      if (file) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
        const path = `${userId}/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('community')
          .upload(path, file, { contentType: file.type || undefined, upsert: false })
        if (upErr) throw upErr
        media_url = supabase.storage.from('community').getPublicUrl(path).data.publicUrl
        media_type = file.type.startsWith('video') ? 'video' : 'image'
      }
      const { error } = await supabase
        .from('community_posts')
        .insert({ author_id: userId, body: body || null, media_url, media_type })
      if (error) throw error
      setText('')
      clearFile()
      onSent()
    } catch {
      // silencioso; poderia mostrar um toast
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="shrink-0 border-t border-line bg-bg px-3 pt-2.5"
      style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 0px) + 10px)' }}
    >
      {preview && file && (
        <div className="mb-2 flex items-center gap-3 rounded-2xl border border-line bg-surface p-2">
          {file.type.startsWith('video') ? (
            <video src={preview} className="h-14 w-14 rounded-xl bg-black object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-14 w-14 rounded-xl object-cover" />
          )}
          <span className="flex-1 truncate text-[13px] text-muted">{file.name}</span>
          <button onClick={clearFile} aria-label="Remover" className="flex h-8 w-8 items-center justify-center rounded-pill bg-bg text-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          aria-label="Anexar mídia"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-surface text-brown transition active:scale-95"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          placeholder="Escreva uma novidade…"
          className="max-h-28 flex-1 resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none placeholder:text-subtle"
        />
        <button
          onClick={send}
          disabled={sending || (!text.trim() && !file)}
          aria-label="Publicar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-brown text-white transition active:scale-95 disabled:opacity-40"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={pickFile} />
    </div>
  )
}
