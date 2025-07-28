import typescript from "rollup-plugin-typescript2"
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import json from '@rollup/plugin-json'
import path from "path"
import { fileURLToPath } from 'url'

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
            sourcemap: true,
            // preserveModules: true,
            entryFileNames: '[name].js'
        },
        plugins: [
            aliases,
            resolve(),
            commonjs(),
            json(),
            typescript({
                tsconfig: './tsconfig.build.json',
                useTsconfigDeclarationDir: true
            })
        ],
        external: []
    },
    // Commonjs Build
    {
        input: 'src/index.ts',
        output: {
            dir: 'dist/cjs',
            format: 'cjs',
            sourcemap: true,
            // preserveModules: true,
            entryFileNames: '[name].js'
        },
        plugins: [
            aliases,
            resolve(),
            commonjs(),
            json(),
            typescript({
                tsconfig: './tsconfig.build.json',
                useTsconfigDeclarationDir: false
            })
        ],
        external: []
    }
]