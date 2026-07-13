'use client'

// Valida se o arquivo é REALMENTE uma foto — analisa a assinatura binária
// (magic bytes) do conteúdo, não a extensão, e depois decodifica de verdade.
// Bloqueia renomeados (ex.: .exe virado .png), SVG (pode conter script) e corrompidos.

type Sig = (b: Uint8Array) => boolean

const SIGNATURES: Sig[] = [
  // JPEG: FF D8 FF
  (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  // GIF: "GIF8"
  (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
  // WEBP: "RIFF"...."WEBP"
  (b) =>
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  // HEIC/HEIF (iPhone): "....ftypheic/heif/mif1"
  (b) =>
    b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
    (String.fromCharCode(b[8], b[9], b[10], b[11]).match(/heic|heif|mif1|hevc|msf1/i) != null),
]

export async function isRealImage(file: File): Promise<boolean> {
  try {
    // 1) Assinatura binária do conteúdo (magic bytes).
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
    if (!SIGNATURES.some((check) => check(head))) return false

    // 2) Decodifica de verdade (só passa se renderizar como imagem).
    const url = URL.createObjectURL(file)
    try {
      return await new Promise<boolean>((resolve) => {
        const img = new Image()
        img.onload = () => resolve(img.naturalWidth > 0 && img.naturalHeight > 0)
        img.onerror = () => resolve(false)
        img.src = url
      })
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch {
    return false
  }
}
