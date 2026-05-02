/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.(frag|vert)$/i,
            use: { loader: require.resolve('./shader-loader.js') }
        })

        return config
    }
}

module.exports = nextConfig
