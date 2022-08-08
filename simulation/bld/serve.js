import esbuildServe from 'esbuild-serve';

export const OPTIONS = {
  entryPoints: ['src/main.js'],
  bundle: true,

  minify: false,
  sourcemap: true,

  // Load shaders as text for WebGL.
  loader: {
    '.vs': 'text',
    '.fs': 'text',
    '.eot': 'file',
    '.woff': 'file',
    '.ttf': 'file'
  },

  platform: 'node',
  target: ['node10.4'],
  outfile: 'pub/bundle.js'

};

esbuildServe(
  OPTIONS,
  {
    port: +process.env.PORT || 8080,
    root: 'pub'
  }
);