const logger = require('@financial-times/lambda-logger');
const httpError = require('http-errors');
const querystring = require('qs');
const fs = require('fs');
const path = require('path');
const response = require('./lib/response');
const { createLambda } = require('./lib/lambda');
const template = require('./templates/form-input-page');
const { ingest } = require('./ingest/external-apis');

const sampleRunbook = fs.readFileSync(
	path.resolve(__dirname, '../EXAMPLE.md'),
	'utf8',
);

const displayForm = async event => {
	logger.info(
		{ event: 'GET RUNBOOK-md INGEST FORM', params: event },
		'Request for runbook.md form',
	);
	return response.page(template, { exampleContent: sampleRunbook }, event);
};

const handleForm = async event => {
	logger.info(
		{ event: 'Received RUNBOOK-md INGEST FORM', params: event },
		'Result of runbook.md form',
	);
	const formData = event.body;
	const jsonFormData = querystring.parse(formData);
	jsonFormData.writeToBizOps = jsonFormData.writeToBizOps === 'true';
	const { status: ingestStatus, json: ingestResponse } = await ingest(
		event,
		jsonFormData,
	);

	return response.page(
		template,
		{
			status: ingestStatus,
			message: ingestResponse.message,
			systemCode: jsonFormData.systemCode,
			writeToBizOps: jsonFormData.writeToBizOps,
			bizOpsApiKey: jsonFormData.bizOpsApiKey,
			content: jsonFormData.content,
			parseErrors: ingestResponse.parseErrors,
			parseData: ingestResponse.parseData,
			validationErrors: ingestResponse.validationErrors,
			validationData: ingestResponse.validationData,
			updatedFields: ingestResponse.updatedData,
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
