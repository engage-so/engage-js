import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import license from 'rollup-plugin-license'

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
  }],
  plugins: [
    nodeResolve({
      browser: true
    }),
    commonjs(),
    license({
      banner: "Version: <%= pkg.version %>; <%= moment().format('YYYY-MM-DD') %>"
    })
  ]
}
