const logger = require('@financial-times/lambda-logger');
const httpError = require('http-errors');
const httpRequest = require('request-promise');
const querystring = require('qs');
const response = require('./lib/response');
const { createLambda } = require('./lib/lambda');
const template = require('./templates/validate-page');

const responseHeaders = {
	'Content-Type': 'application/json',
	'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
};

const displayForm = async event => {
	logger.info(
		{ event: 'GET RUNBOOK-MD INGEST FORM', params: event },
		'Request for runbook.md form',
	);
	return response.page(template, {}, event);
};

const handleForm = async event => {
	logger.info(
		{ event: 'POST RUNBOOK-MD INGEST FORM', params: event },
		'Result of runbook.md form',
	);
	const formData = event.body;
	const jsonFormData = querystring.parse(formData);
	const result = await httpRequest({
		method: 'POST',
		uri: `${process.env.BASE_URL}/ingest`,
		body: jsonFormData,
		json: true,
	});
	return {
		statusCode: 200,
		body: JSON.stringify(result),
		headers: responseHeaders,
	};
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
