const APP_URL = 'https://precifica.biteti.co'
const FROM = 'Precifica Beauty <contato@biteti.com.br>'

/** Envolve o conteúdo no visual moderno (estilo login): card claro arredondado. */
function shell({ title, subtitle, inner }: { title: string; subtitle?: string; inner: string }): string {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${subtitle ?? title}</div>
<style>@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');</style>
<div style="font-family:'Instrument Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#F7F4EF;margin:0;padding:40px 16px">
  <div style="max-width:460px;margin:0 auto;background:#FFFFFF;border:1px solid #EAE7E1;border-radius:24px;padding:36px 30px;text-align:center">
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:500;line-height:1.2;color:#111111">${title}</h1>
    ${subtitle ? `<p style="margin:0 0 24px;font-size:14px;line-height:1.55;color:#6B6B6B">${subtitle}</p>` : ''}
    ${inner}
  </div>
  <p style="text-align:center;color:#9A968E;font-size:12px;margin:18px 0 0;font-family:'Instrument Sans',Arial,sans-serif">Precifica Beauty</p>
</div>`
}

function pillButton(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#111111;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:15px 32px;border-radius:999px">${label}</a>`
}

export function accessGrantedEmail({
  name,
  email,
  password,
}: {
  name?: string
  email?: string
  password?: string
}): { subject: string; html: string } {
  const hi = name ? `${name}, sua` : 'Sua'
  const block =
    password && email
      ? `
        <div style="background:#F7F4EF;border:1px solid #EAE7E1;border-radius:16px;padding:18px 18px;text-align:left;margin:0 0 22px">
          <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#9A968E;font-weight:700">Seus dados de acesso</p>
          <p style="margin:0 0 8px;font-size:14px;color:#111111"><span style="color:#6B6B6B">E-mail:</span> <b>${email}</b></p>
          <p style="margin:0;font-size:14px;color:#111111"><span style="color:#6B6B6B">Senha:</span> <b style="letter-spacing:.5px">${password}</b></p>
          <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:#9A968E">Recomendamos trocar a senha depois de entrar, em Perfil.</p>
        </div>`
      : `
        <div style="background:#F7F4EF;border:1px solid #EAE7E1;border-radius:16px;padding:16px 18px;text-align:left;margin:0 0 24px">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#6B6B6B">
            Você já tem uma conta. Entre com a sua senha atual. Se não lembrar, toque em <b style="color:#111111">Esqueceu a senha?</b> na tela de login.
          </p>
        </div>`
  return {
    subject: 'Acesso liberado - Precifica Beauty',
    html: shell({
      title: 'Acesso liberado',
      subtitle: `${hi} compra foi confirmada e seu acesso ao Precifica Beauty já está ativo.`,
      inner: `${block}${pillButton('Acessar o app', `${APP_URL}/auth`)}`,
    }),
  }
}

export function accessRevokedEmail(name?: string): { subject: string; html: string } {
  const who = name ? `${name}, seu` : 'Seu'
  return {
    subject: 'Acesso encerrado - Precifica Beauty',
    html: shell({
      title: 'Acesso encerrado',
      subtitle: `${who} acesso ao Precifica Beauty foi encerrado devido ao reembolso da compra.`,
      inner: `
        <div style="background:#F7F4EF;border:1px solid #EAE7E1;border-radius:16px;padding:16px 18px;text-align:left">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#6B6B6B">
            Se você acredita que isso foi um engano, entre em contato pelo e-mail <b style="color:#111111">contato@biteti.com.br</b>.
          </p>
        </div>`,
    }),
  }
}

/** Envia um e-mail via Resend. Silencioso em caso de falha (não quebra o webhook). */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    })
  } catch {
    // ignora — o acesso já foi liberado/encerrado; o e-mail é complementar.
  }
}
