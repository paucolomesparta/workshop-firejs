import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
		extensions: [".ts", ".tsx", ".js", ".json"],
	},
	publicDir: "public",
	esbuild: {
		jsx: "automatic",
		jsxImportSource: "firejs",
	},
	build: {
		outDir: "dist",
	},
	server: {
		port: 3000,
	},
});
