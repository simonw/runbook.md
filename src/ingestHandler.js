const logger = require('@financial-times/lambda-logger');
const runbookMd = require('./lib/runbook.md');
const { createLambda } = require('./lib/lambda');

const responseHeaders = {
	'Content-Type': 'application/json',
	'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
};

const handler = async event => {
	console.log(event);
	const request = JSON.parse(event.body);
	const result = await runbookMd.parseRunbookString(request.content);
	logger.info(
		{ event: 'RUNBOOK_INGESTION', request, result },
		'Validate json body',
	);
	return {
		statusCode: 200,
		body: JSON.stringify(result),
		headers: responseHeaders,
	};
};

exports.handler = createLambda(handler);
