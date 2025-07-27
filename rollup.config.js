import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  output: [
    {
      dir: "dist/esm",
      format: "esm",
      entryFileNames: "[name].js",
      sourcemap: true,
    },
    {
      dir: "dist/cjs",
      format: "cjs",
      entryFileNames: "[name].js",
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.build.json" }),
    json(),
  ],
  external: [
    "cassandra-driver",
    "util",
    "@faker-js/faker",
    "reflect-metadata",
    "mysql2/promise",
    "better-sqlite3",
    "pg",
    "mongodb",
  ],
};
