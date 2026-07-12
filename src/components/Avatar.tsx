'use client'

import { initials } from '@/lib/format'

export function Avatar({ url, name, size }: { url: string | null; name: string; size: number }) {
  const cls = 'flex shrink-0 items-center justify-center overflow-hidden rounded-pill bg-ink text-white font-bold'
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className={`${cls} object-cover`} style={{ width: size, height: size }} />
  }
  return (
    <span className={cls} style={{ width: size, height: size, fontSize: size * 0.32 }}>
      {initials(name)}
    </span>
  )
}

/** Redimensiona/recorta a imagem para um quadrado pequeno (JPEG leve). */
export function resizeImage(file: File, size = 256): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read'))
    reader.onload = () => {
      const img = new window.Image()
      img.onerror = () => reject(new Error('img'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('ctx'))
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/jpeg', 0.85)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
