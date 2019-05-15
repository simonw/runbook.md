const { h } = require('hyperons');

const { HeadAssets, TailAssets } = require('./asset-loading');
const { Header } = require('./header');
const { Footer } = require('./footer');

const Layout = props => (
	<html className="core" lang="en">
		<head>
			<title>RUNBOOK.MD</title>
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1.0"
				charset="UTF-8"
			/>
			<HeadAssets />
		</head>
		<body>
			<div
				className={`o-layout o-layout--${props.layout || 'landing'}`}
				data-o-component="o-layout"
				data-o-layout-nav-heading-selector=".section-heading"
			>
				<Header {...props} />

				{props.children}
				<Footer {...props} />
			</div>
			<TailAssets />
		</body>
	</html>
);

module.exports = Layout;
