import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import alias from "@rollup/plugin-alias";
import path from "path";
import { fileURLToPath } from "url";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/index.cjs.js",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.build.json' })
    ],
    external: [],
  },
  {
    input: "dist/types/index.d.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
