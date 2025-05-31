import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Use require for path to avoid TypeScript import error
const path = require("path");

export default defineConfig({
	plugins: [
		react({
			jsxImportSource: "firejs",
			babel: {
				plugins: [
					[
						"@babel/plugin-transform-react-jsx",
						{
							runtime: "automatic",
							importSource: "firejs",
							pragma: "firejs.createElement",
							pragmaFrag: "firejs.Fragment",
						},
					],
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
		extensions: [".ts", ".tsx", ".js", ".json"],
	},
	build: {
		outDir: "dist",
	},
	server: {
		port: 3000,
	},
});
