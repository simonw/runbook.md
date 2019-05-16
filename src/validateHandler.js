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

const attemptParse = async (event, request) => {
	const options = {
		method: 'POST',
		body: JSON.stringify(request),
		headers: { Cookie: event.headers.Cookie },
	};
	const fetchResponse = await nodeFetch(
		`${process.env.BASE_URL}/ingest`,
		options,
	);
	if (!fetchResponse.ok) {
		throw httpError(
			fetchResponse.status,
			`Attempt to access runbook.mk ingest failed with ${
				fetchResponse.statusText
			}`,
		);
	}
	logger.info(
		{ event: 'POSTED to runbook.mk /ingest endpoint', options },
		'Waiting for validation response',
	);
	const result = await fetchResponse.json();
	logger.info(
		{ event: 'Result from runbook.mk /ingest endpoint', result },
		'Validation response',
	);
	return result;
};

const attemptScore = async (event, request) => {
	const options = {
		method: 'POST',
		body: JSON.stringify(request.content),
		headers: { Cookie: event.headers.Cookie },
	};
	const fetchResponse = await nodeFetch(
		`${process.env.SOS_URL}/validate`,
		options,
	);
	if (!fetchResponse.ok) {
		throw httpError(
			fetchResponse.status,
			`Attempt to access SOS ${
				process.env.SOS_URL
			}/validate failed with ${fetchResponse.statusText}`,
		);
	}
	logger.info(
		{ event: 'POSTED to /ingest endpoint', options },
		'Waiting for SOS validation response',
	);
	const result = await fetchResponse.json();
	logger.info(
		{ event: 'Result from SOS /validate endpoint', result },
		'SOS validate response',
	);
	return result;
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

	const parseResult = await attemptParse(event, jsonFormData);
	const validateResult = await attemptScore(event, parseResult.data);
	return {
		statusCode: 200,
		body: JSON.stringify({ parseResult, validateResult }),
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
