const logger = require('@financial-times/lambda-logger');
const httpError = require('http-errors');
const nodeFetch = require('node-fetch');
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
		{ event: 'Received RUNBOOK-MD INGEST FORM', params: event },
		'Result of runbook.md form',
	);
	const formData = event.body;
	const jsonFormData = querystring.parse(formData);
	const options = {
		method: 'POST',
		body: JSON.stringify(jsonFormData),
	};
	const fetchResponse = await nodeFetch(
		`${process.env.BASE_URL}/ingest`,
		options,
	);
	if (!fetchResponse.ok) {
		throw httpError(
			fetchResponse.status,
			`Attempt to access ingest failed with ${fetchResponse.statusText}`,
		);
	}
	logger.info(
		{ event: 'POSTED to /ingest endpoint', options },
		'Waiting for validation response',
	);
	const result = await fetchResponse.json();
	logger.info(
		{ event: 'Result from /ingest endpoint', result },
		'Validation response',
	);
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
