const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/index.tsx",
	output: {
		filename: "bundle.js",
		// @ts-ignore
		path: __dirname + "/dist",
	},
	devtool: "source-map",
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
			},
		],
	},
    devServer: {
		static: {
			// @ts-ignore
            directory: __dirname + "/dist",
        },
        compress: true,
        port: 3000,
    },
	plugins: [
		new HTMLWebpackPlugin({
			template: "./public/index.html",
		}),
	],
};
