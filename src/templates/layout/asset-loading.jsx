const { h, Fragment } = require('hyperons');
const config = require('../../lib/config');
// locally webpack manifest is not created
const webpackManifest = config.get('IS_LAMBDA')
	? // built resource, so doesn't exist in local dev
	  // eslint-disable-next-line import/no-unresolved
	  require('../../browser/manifest.json')
	: {
			'main.css': 'main.css',
			'main.js': 'main.js',
	  };

// TODO serve as /statics in prod
const getPathToStaticAsset = fileName =>
	`${
		config.get('IS_LAMBDA')
			? `https://s3-eu-west-1.amazonaws.com/biz-ops-statics.${config.get(
					'AWS_ACCOUNT_ID',
			  )}/biz-ops-runbook-md`
			: 'http://local.in.ft.com:8080/statics'
	}/${webpackManifest[fileName]}`;

const buildServiceBaseUrl =
	'https://www.ft.com/__origami/service/build/v2/bundles';

const buildOrigamiUrl = (type, map) =>
	`${buildServiceBaseUrl}/${type}?brand=internal&modules=${Object.entries(map)
		.map(([key, val]) => `o-${key}@${val}`)
		.join(',')}${config.get('IS_LAMBDA') ? '' : '&minify=none'}`;

const origamiCssUrl = buildOrigamiUrl('css', {
	layout: '^3.1.0',
	'header-services': '^3.2.3',
	table: '^7.3.0',
	message: '^3.0.0',
	forms: '^6.0.0',
	normalise: '^1.6.2',
	buttons: '^5.15.1',
	colors: '^4.8.5',
	icons: '^5.9.0',
	fonts: '^3.1.1',
	labels: '^4.1.1',
	expander: '^4.4.4',
	tooltip: '^3.4.0',
	'footer-services': '^2.1.0',
});

const origamiJsUrl = buildOrigamiUrl('js', {
	layout: '^3.1.0',
	table: '^7.3.0',
	'header-services': '^3.2.3',
	expander: '^4.4.4',
	tooltip: '^3.4.0',
	date: '^2.11.0',
});

const HeadAssets = () => (
	<Fragment>
		<link
			rel="icon"
			type="image/png"
			href="https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo-v1%3Abrand-ft-logo-square?source=biz-ops-admin&amp;width=32&amp;height=32&amp;format=png"
			sizes="32x32"
		/>
		<link
			rel="icon"
			type="image/png"
			href="https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo-v1%3Abrand-ft-logo-square?source=biz-ops-admin&amp;width=194&amp;height=194&amp;format=png"
			sizes="194x194"
		/>
		<link
			rel="apple-touch-icon"
			sizes="180x180"
			href="https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo-v1%3Abrand-ft-logo-square?source=biz-ops-admin&amp;width=180&amp;height=180&amp;format=png"
		/>
		<link rel="stylesheet" href={origamiCssUrl} />
		<link href={getPathToStaticAsset('main.css')} rel="stylesheet" />
	</Fragment>
);
const TailAssets = () => (
	<Fragment>
		<script src={getPathToStaticAsset('main.js')} defer />

		<script defer src={origamiJsUrl} />
	</Fragment>
);
module.exports = { HeadAssets, TailAssets };
