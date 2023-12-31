import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.mjs",
        format: "es",
      },
      {
        file: "dist/index.cjs",
        format: "commonjs",
      },
    ],
    plugins: [typescript()],
    external: ["path"],
  },
];
