/** @type {import('next').NextConfig} */
const nextConfig = {
    /*async rewrites() {
        return [
          {
            source: `${process.env.NEXT_PUBLIC_GRAPHQL_URL}/:path*`,
            destination: `${process.env.CLIENT_BACKEND_GRAPHQL_ENDPOINT}/:path*`,
          },
        ];
      },*/
}

module.exports = nextConfig
