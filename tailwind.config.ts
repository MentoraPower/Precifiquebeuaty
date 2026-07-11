import type { Config } from 'tailwindcss'

/**
 * Design system — Precifica Beauty / W Calculadora
 * Fundo branco/off-white, CTA preto, destaque dourado, bordas suaves, grid 8px.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        surface: '#F7F4EF',
        ink: '#111111',
        muted: '#6B6B6B',
        subtle: '#9A968E',
        gold: '#D3A13B',
        champagne: '#F3E7CE',
        brown: '#2C1E16',
        line: '#EAE7E1',
        success: '#2E9E5B',
        danger: '#D1483A',
        attention: '#C8871E',
      },
      borderRadius: {
        card: '20px',
        btn: '16px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['var(--font-instrument)', 'Instrument Sans', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // grid de 8px reforçado
        '18': '4.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,17,17,0.04)',
        sheet: '0 -8px 40px rgba(17,17,17,0.12)',
        float: '0 8px 24px rgba(17,17,17,0.12)',
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
}

export default config
