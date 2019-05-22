const logger = require('@financial-times/lambda-logger');
const runbookMd = require('./lib/runbook.md');
const { createLambda } = require('./lib/lambda');
const { validate, updateBizOps } = require('./lib/external-apis');

const responseHeaders = {
	'Content-Type': 'application/json',
	'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
};

const htmlResponse = (status, message, details) => ({
	statusCode: status,
	body: JSON.stringify({ message, ...details }),
	headers: responseHeaders,
});
const badRequestError = (message, details) =>
	htmlResponse(400, message, details);
const success = (message, details) => htmlResponse(200, message, details);

const ingestedDetails = (parseResult, validationResult, writeResult) => ({
	...(parseResult && {
		parseErrors: parseResult.errors,
		parseData: parseResult.data,
	}),
	...(validationResult && {
		validationErrors: validationResult.errorMessages,
		validationData: validationResult.percentages,
	}),
	...(writeResult && { updatedFields: writeResult }),
});

const ingest = async (username, userRequest) => {
	if (!userRequest.systemCode) {
		return badRequestError('Please supply a systemCode');
	}
	if (!userRequest.content) {
		return badRequestError('Please supply RUNBOOK.MD content');
	}

	const parseResult = await runbookMd.parseRunbookString(userRequest.content);
	if (parseResult.errors.length) {
		return badRequestError(
			'Parse Failures. Please correct and resubmit',
			ingestedDetails(parseResult),
		);
	}

	const { json: validationResult } = await validate(parseResult.data);
	if (!userRequest.writeToBizOps || userRequest.writeToBizOps === false) {
		return success(
			'Parse & Validation Complete; Biz Ops Was NOT Updated at your request',
			ingestedDetails(parseResult, validationResult),
		);
	}

	if (!userRequest.bizOpsApiKey) {
		return badRequestError(
			'Unable to update Biz Ops. No API key was been provided',
			ingestedDetails(parseResult, validationResult),
		);
	}

	const { status: writeStatus, json: writeResult } = await updateBizOps(
		username,
		userRequest.bizOpsApiKey,
		userRequest.systemCode,
		parseResult.data,
	);
	return htmlResponse(
		writeStatus,
		writeStatus === 200
			? 'Biz Ops has been updated'
			: 'Biz Ops update failed',
		ingestedDetails(parseResult, validationResult, writeResult),
	);
};

const handler = async event => {
	const userRequest = JSON.parse(event.body);
	logger.info({ event: 'RUNBOOK_INGESTION', userRequest });
	return ingest(event.s3oUsername, userRequest);
};

module.exports = {
	handler: createLambda(handler),
	ingest,
};
