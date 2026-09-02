/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // The packaged Electron app loads out/index.html over file://, where absolute
  // /_next/... paths resolve against the filesystem root and 404. Relative asset
  // paths keep the export working both on a web server and inside the .app.
  assetPrefix: './',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
