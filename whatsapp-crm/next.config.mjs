/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/obtenerMensaje',
        destination: 'http://localhost:3001/api/obtenerMensaje',
      },
    ]
  },
}

export default nextConfig
