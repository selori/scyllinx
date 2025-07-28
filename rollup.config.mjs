import typescript from "rollup-plugin-typescript2"
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import { visualizer } from 'rollup-plugin-visualizer'
import path from "path"
import { fileURLToPath } from 'url'
import pkg from './package.json' assert { type: 'json' }

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = __dirname

const aliases = alias({
    entries: [
        {
            find: '@',
            replacement: path.resolve(projectRoot, 'src')
        }
    ]
})

export default [
    // ESM Build
    {
        input: 'src/index.ts',
        output: {
            dir: 'dist/esm',
            format: 'esm',
            sourcemap: false,
            // preserveModules: true,
            entryFileNames: '[name].min.js',
            
        },
        plugins: [
            aliases,
            resolve({preferBuiltins: true}),
            commonjs(),
            json(),
            typescript({
                tsconfig: './tsconfig.build.json',
                useTsconfigDeclarationDir: true
            }),
            terser(),
            visualizer({ open: true }),
        ],
        external
    },
    // Commonjs Build
    {
        input: 'src/index.ts',
        output: {
            dir: 'dist/cjs',
            format: 'cjs',
            sourcemap: false,
            // preserveModules: true,
            entryFileNames: '[name].min.js',
        },
        plugins: [
            aliases,
            resolve({preferBuiltins: true}),
            commonjs(),
            json(),
            typescript({
                tsconfig: './tsconfig.build.json',
                useTsconfigDeclarationDir: false
            }),
            terser(),
            visualizer({ open: true }),
        ],
        external
    }
]