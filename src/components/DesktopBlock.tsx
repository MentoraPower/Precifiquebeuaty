// Tela exibida no desktop: a ferramenta é feita para celular.
export function DesktopBlock({ url, qrSvg }: { url: string; qrSvg: string }) {
  const prettyUrl = url.replace(/^https?:\/\//, '')
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-white">
      <div className="flex w-full max-w-[700px] items-stretch gap-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
        {/* Bloco de texto */}
        <div className="flex flex-1 flex-col justify-center text-left">
          <h1 className="text-[26px] font-semibold leading-tight">Disponível apenas no celular</h1>
          <p className="mt-3 max-w-[340px] text-[15px] leading-relaxed text-white/60">
            O Precifica Beauty foi feito para uma experiência completa no celular. Aponte a câmera do seu celular para o
            QR code ao lado e acesse por lá.
          </p>
          <p className="mt-6 text-[13px] text-white/40">ou acesse pelo navegador do celular</p>
          <p className="mt-1 text-[15px] font-semibold text-white">{prettyUrl}</p>
        </div>

        {/* QR — acompanha a altura do bloco de texto */}
        <div className="aspect-square shrink-0 self-stretch rounded-3xl bg-white p-4">
          <div className="h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        </div>
      </div>
    </div>
  )
}
