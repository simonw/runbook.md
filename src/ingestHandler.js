const logger = require('@financial-times/lambda-logger');

const { createLambda } = require('./lib/lambda');

const responseHeaders = {
	'Content-Type': 'application/json',
	'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
};

const handler = async event => {
	const runbook = event.body || '{}';
	const result = JSON.parse(runbook);
	logger.info(
		{ event: 'RUNBOOK_INGESTION', runbook, result },
		'Validate json body',
	);
	return {
		statusCode: 200,
		body: JSON.stringify(result),
		headers: responseHeaders,
	};
};

exports.handler = createLambda(handler);
