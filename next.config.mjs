/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        hostname: "bncvbl4s07.ufs.sh",
      },
      {
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
