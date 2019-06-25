const path = require('path');
/* eslint-disable import/no-extraneous-dependencies */
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

const isProduction = process.env.NODE_ENV === 'production';

const sls = {
	entry: slsw.lib.entries,
	target: 'node',
	mode: isProduction ? 'production' : 'development',
	output: {
		libraryTarget: 'commonjs2',
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
	},
	stats: 'minimal',
	externals: [nodeExternals()],
	performance: {
		hints: false,
	},
	resolve: {
		extensions: ['.js', '.jsx'],
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: [/node_modules/],
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env',
								{
									targets: {
										node: true,
									},
								},
							],
						],
						plugins: [
							[
								'@babel/plugin-transform-react-jsx',
								{
									pragma: 'h', // default pragma is React.createElement
									pragmaFrag: 'Fragment', // default is React.Fragment
									throwIfNamespace: false, // defaults to true
								},
							],
						],
					},
				},
			},
			{
				test: /\.md$/i,
				use: 'raw-loader',
			},
		],
	},
};

module.exports = sls;
