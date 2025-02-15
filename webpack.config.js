const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
	module: {
		rules: [
			{
				test: /\.(tsx|ts)?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(css)$/,
				use: ['style-loader', 'css-loader'],

			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './public/index.html',
			filename: './index.html',
		}),
	],
	resolve: {
		extensions: ['.tsx', '.ts'], // Enable importing .js and .jsx files without specifying extensions
	},
};
