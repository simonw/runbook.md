const logger = require('@financial-times/lambda-logger');
const runbookMd = require('./lib/runbook.md');
const { createLambda } = require('./lib/lambda');
const { validate, updateBizOps } = require('./lib/external-apis');

const responseHeaders = {
	'Content-Type': 'application/json',
	'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
};

const handler = async event => {
	const userRequest = JSON.parse(event.body);
	logger.info({ event: 'RUNBOOK_INGESTION', userRequest });

	const parseResult = await runbookMd.parseRunbookString(userRequest.content);
	if (parseResult.errors.length) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: 'Parse Failures. Please correct and resubmit',
				parseErrors: parseResult.errors,
				parseData: parseResult.data,
			}),
			headers: responseHeaders,
		};
	}

	const { status: validationStatus, json: validationResult } = await validate(
		event,
		parseResult.data,
	);
	// if (validationResult.errorMessages) {
	// 	return {
	// 		statusCode: validationStatus,
	// 		body: JSON.stringify({
	// 			message: 'Validation Failures. Please correct and resubmit',
	// 			parseErrors: parseResult.errors,
	// 			parseData: parseResult.data,
	// 			validationErrors: validationResult.errorMessages,
	// 			validationData: validationResult.percentages,
	// 		}),
	// 		headers: responseHeaders,
	// 	};
	// }
	if (userRequest.writeToBizOps === false) {
		return {
			statusCode: 200,
			body: JSON.stringify({
				message:
					'Parse & Validation Complete; Biz Ops Was NOT Updated at your request',
				parseErrors: parseResult.errors,
				parseData: parseResult.data,
				validationErrors: validationResult.errorMessages,
				validationData: validationResult.percentages,
			}),
			headers: responseHeaders,
		};
	}

	if (!userRequest.bizOpsApiKey) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message:
					'Unable to update Biz Ops. No API key was been provided',
				parseErrors: parseResult.errors,
				parseData: parseResult.data,
				validationErrors: validationResult.errorMessages,
				validationData: validationResult.percentages,
			}),
			headers: responseHeaders,
		};
	}

	const { status: writeStatus, json: writeResult } = await updateBizOps(
		event,
		userRequest.bizOpsApiKey,
		userRequest.systemCode,
		parseResult.data,
	);
	return {
		statusCode: writeStatus,
		body: JSON.stringify({
			message:
				writeStatus === 200
					? 'Biz Ops has been updated'
					: 'Biz Ops update failed',
			parseErrors: parseResult.errors,
			parseData: parseResult.data,
			validationErrors: validationResult.errorMessages,
			validationData: validationResult.percentages,
			updatedFields: writeResult,
		}),
		headers: responseHeaders,
	};
};

exports.handler = createLambda(handler);
