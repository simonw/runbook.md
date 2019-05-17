const logger = require('@financial-times/lambda-logger');
const httpError = require('http-errors');
const querystring = require('qs');
const response = require('./lib/response');
const { createLambda } = require('./lib/lambda');
const template = require('./templates/validate-page');
const {
	attemptParse,
	// attemptScore,
	updateBizOps,
} = require('./lib/external-apis');

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

	const parseResult = await attemptParse(event, jsonFormData);
	const validateResult = {}; // await attemptScore(event, parseResult.data);
	let writeResult = {};
	if (jsonFormData.writeToBizOps) {
		if (jsonFormData.apiKey) {
			writeResult = await updateBizOps(
				event,
				jsonFormData.apiKey,
				jsonFormData.systemCode,
				parseResult.data,
			);
		} else {
			writeResult = { BizOpsError: 'Please supply a Biz Ops API Key' };
		}
	} else {
		writeResult = {
			BizOpsUnchanged: 'The data has not been written to Biz Ops',
		};
	}
	return {
		statusCode: 200,
		body: JSON.stringify({ parseResult, validateResult, writeResult }),
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
