/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['prod-files-secure.s3.us-west-2.amazonaws.com'], // 許可するホスト名をここに追加
  },
}

module.exports = nextConfig
