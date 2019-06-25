const logger = require('@financial-times/lambda-logger');
const httpError = require('http-errors');
const querystring = require('qs');
const response = require('./lib/response');
const { createLambda } = require('./lib/lambda');
const template = require('./templates/form-input-page');
const { ingest } = require('./commands/ingest');
const { default: exampleContent } = require('../../../docs/example.md');

const displayForm = event => {
	logger.info(
		{ event: 'GET RUNBOOK-md INGEST FORM' },
		'Request for runbook.md form',
	);
	return response.page(template, { exampleContent, layout: 'docs' }, event);
};

const handleForm = async event => {
	logger.info(
		{ event: 'Received RUNBOOK-md INGEST FORM' },
		'Result of runbook.md form',
	);
	const formData = event.body;
	const jsonFormData = querystring.parse(formData);
	jsonFormData.writeToBizOps = jsonFormData.writeToBizOps === 'true';

	const responseProperties = { status: 200 };

	try {
		logger.info({ event: 'RUNBOOK_MANUAL_CHECK_START', jsonFormData });
		const ingestResponse = await ingest(event.s3oUsername, jsonFormData);
		const ingestJson = await ingestResponse.json();
		logger.info({
			event: 'RUNBOOK_MANUAL_CHECK_SUCCESFUL',
			response: ingestJson,
		});
		Object.assign(responseProperties, ingestJson);
	} catch (error) {
		Object.assign(responseProperties, { ...error });
		logger.info({
			event: 'RUNBOOK_MANUAL_CHECK_FAILED',
			error: { ...error },
		});
	}

	return response.page(
		template,
		{
			status: responseProperties.status,
			message: responseProperties.message,
			...jsonFormData,
			...responseProperties.details,
		},
		event,
	);
};

const handler = async event => {
	if (event.httpMethod === 'GET') {
		return displayForm(event);
	}
	if (event.httpMethod === 'POST') {
		return handleForm(event);
	}
	throw httpError(405, 'Method Not Allowed');
};

exports.handler = createLambda(handler);
