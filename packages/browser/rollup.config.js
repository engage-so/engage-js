import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import license from 'rollup-plugin-license'
// import babel from '@rollup/plugin-babel'

export default {
  input: 'index.js',
  output: [{
    file: './dist/engage.js',
    format: 'umd',
    name: 'Engage'
  }, {
    file: './dist/engage.min.js',
    format: 'umd',
    name: 'Engage',
    sourcemap: true,
    plugins: [terser()]
  // }, {
  //   file: './dist/index.es.js',
  //   format: 'es',
  //   name: 'Engage',
  //   sourcemap: true
  }],
  plugins: [
    nodeResolve({
      browser: true
    }),
    commonjs(),
    license({
      banner: "Version: <%= pkg.version %>; <%= moment().format('YYYY-MM-DD') %>"
    })
    /*
    babel({
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
      presets: [['@babel/preset-env', {
        targets: 'cover 99.5%',
        useBuiltIns: 'usage',
        modules: false,
        corejs: { version: 3, proposals: true }
      }]],
      plugins: [['@babel/plugin-transform-runtime', {
        regenerator: true
      }]]
    })
    */
  ]
}
