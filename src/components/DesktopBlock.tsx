import { Smartphone } from 'lucide-react'

// Tela exibida no desktop: a ferramenta é feita para celular.
export function DesktopBlock({ url, qrSvg }: { url: string; qrSvg: string }) {
  const prettyUrl = url.replace(/^https?:\/\//, '')
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-white">
      <div className="w-full max-w-[440px] text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="Precifica Beauty" className="mx-auto h-16 w-16 rounded-2xl ring-1 ring-white/15" />

        <div className="mx-auto mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <Smartphone className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-[26px] font-semibold leading-tight">Disponível apenas no celular</h1>
        <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-relaxed text-white/60">
          O Precifica Beauty foi feito para uma experiência completa no celular. Aponte a câmera do seu celular para o
          QR code abaixo e acesse por lá.
        </p>

        <div className="mx-auto mt-8 w-fit rounded-3xl bg-white p-5 shadow-float">
          <div className="h-[220px] w-[220px] [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        </div>

        <p className="mt-6 text-[13px] text-white/40">ou acesse pelo navegador do celular</p>
        <p className="mt-1 text-[15px] font-semibold text-white">{prettyUrl}</p>
      </div>
    </div>
  )
}
