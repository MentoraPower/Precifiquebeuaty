/**
 * Detecção por DISPOSITIVO (user-agent), não por tamanho de tela.
 * Celulares e tablets touch são permitidos; desktop é bloqueado.
 */
const MOBILE_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB10|IEMobile|Opera Mini|Mobile|Silk|Kindle|PlayBook/i

export function isMobileDevice(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return MOBILE_RE.test(userAgent)
}
