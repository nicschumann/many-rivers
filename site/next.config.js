/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(frag|vert)$/i,
      use: "raw-loader",
    });

    return config;
  },
  async redirects() {
    return [{ source: "/", destination: "/rivers/el-horcon", permanent: true }];
  },
};

module.exports = nextConfig;
