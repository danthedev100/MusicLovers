/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['i.ytimg.com', 'i1.sndcdn.com', 'i.scdn.co'],
  },
}

module.exports = nextConfig
