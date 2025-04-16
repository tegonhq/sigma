import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: 'backend/index.ts',
    external: ['axios'],
    output: [
      {
        file: 'dist/backend/index.js',
        sourcemap: true,
        format: 'cjs',
        exports: 'named',
        preserveModules: false,
      },
    ],
    plugins: [
      nodePolyfills(),
      json(),
      resolve({ extensions: ['.js', '.ts'] }),
      commonjs({
        include: /\/node_modules\//,
      }),
      typescript({
        tsconfig: 'tsconfig.backend.json',
      }),
      terser(),
    ],
  },
];
