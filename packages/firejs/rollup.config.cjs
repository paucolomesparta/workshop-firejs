const typescript = require("@rollup/plugin-typescript").default;
const resolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs").default;
const path = require("path");

module.exports = [
	{
		input: "src/index.ts",
		output: {
			dir: "dist",
			format: "esm",
			entryFileNames: "[name].js",
			sourcemap: true,
		},
		plugins: [
			resolve({ extensions: [".js", ".ts"] }),
			commonjs(),
			typescript({
				tsconfig: path.resolve(__dirname, "tsconfig.json"),
				declaration: true,
				declarationDir: "dist",
				sourceMap: true,
			}),
		],
		external: [], // Add external dependencies here if needed
	},
	{
		input: "src/jsx-runtime.ts",
		output: {
			file: "dist/jsx-runtime.js",
			format: "esm",
			sourcemap: true,
		},
		plugins: [
			resolve({ extensions: [".js", ".ts"] }),
			commonjs(),
			typescript({
				tsconfig: path.resolve(__dirname, "tsconfig.json"),
				declaration: false,
				sourceMap: true,
			}),
		],
		external: [],
	},
];
