const path = require('path');
/* eslint-disable import/no-extraneous-dependencies */
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

const sls = {
	entry: slsw.lib.entries,
	target: 'node',
	mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
	output: {
		libraryTarget: 'commonjs2',
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
	},
	stats: 'minimal',
	externals: slsw.lib.webpack.isLocal ? [nodeExternals()] : [],
	performance: {
		hints: false,
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			'@financial-times/runbook.md-parser': path.resolve(
				__dirname,
				'../../libraries/parser/',
			),
		},
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
