import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["esm", "cjs"],
  splitting: false,
  clean: true,
  outDir: "dist",
  cjsInterop: true,
  shims: true,
  outExtension({ format }) {
    return format === "cjs" ? { js : ".cjs" } : { js: ".js" };
  },
});