/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.(frag|vert)$/i,
            use: 'raw-loader'
        })

        return config
    }
}

module.exports = nextConfig
