const logger = require('@financial-times/lambda-logger');
const runbookMd = require('./lib/runbook.md');
const { createLambda } = require('./lib/lambda');
const { validate, updateBizOps } = require('./lib/external-apis');

const responseHeaders = {
	'Content-Type': 'application/json',
	'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
};

const htmlResponse = ({ status, message, details }) => {
	return {
		statusCode: status,
		body: JSON.stringify({ message, ...details }),
		headers: responseHeaders,
	};
};
const badRequestError = ({ message, details }) =>
	htmlResponse({ status: 400, message, details });
const success = ({ message, details }) =>
	htmlResponse({ status: 200, message, details });

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
		return badRequestError({ message: 'Please supply a systemCode' });
	}
	if (!userRequest.content) {
		return badRequestError({ message: 'Please supply RUNBOOK.md content' });
	}

	const parseResult = await runbookMd.parseRunbookString(userRequest.content);
	if (parseResult.errors.length) {
		return badRequestError({
			message: 'Parse Failures. Please correct and resubmit',
			details: ingestedDetails(parseResult),
		});
	}

	const { json: validationResult } = await validate(parseResult.data);
	if (!userRequest.writeToBizOps || userRequest.writeToBizOps === false) {
		return success({
			message:
				'Parse & Validation Complete. Biz Ops Was NOT Updated as you did not enable the writeToBizOps flag.',
			details: ingestedDetails(parseResult, validationResult),
		});
	}

	if (!userRequest.bizOpsApiKey) {
		return badRequestError({
			message: 'Unable to update Biz Ops. No API key was been provided',
			details: ingestedDetails(parseResult, validationResult),
		});
	}

	const { status: writeStatus, json: writeResult } = await updateBizOps(
		username,
		userRequest.bizOpsApiKey,
		userRequest.systemCode,
		parseResult.data,
	);
	return htmlResponse({
		status: writeStatus,
		message:
			writeStatus === 200
				? `Biz Ops has been updated.`
				: `Biz Ops update failed with ${writeStatus}: ${JSON.stringify(
						writeResult,
				  )}`,
		details: ingestedDetails(parseResult, validationResult, writeResult),
	});
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
