/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mantém no cache do cliente as páginas já visitadas/pré-carregadas (com dados),
  // para reabrir instantâneo. Revalida em segundo plano após o tempo abaixo.
  experimental: {
    staleTimes: {
      dynamic: 180,
      static: 300,
    },
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

export default nextConfig
