const logger = require('@financial-times/lambda-logger');
const runbookMd = require('@financial-times/runbook.md-parser');
const { createLambda } = require('./lib/lambda');
const { validate, updateBizOps } = require('./lib/external-apis');
const {
	htmlResponse,
	success,
	badRequestError,
	ingestedDetails,
} = require('./lib/response');
const { validateCodesAgainstBizOps } = require('./lib/code-validation');

const ingest = async (username, userRequest) => {
	if (!userRequest.systemCode) {
		return badRequestError({ message: 'Please supply a systemCode' });
	}
	if (!userRequest.content) {
		return badRequestError({ message: 'Please supply RUNBOOK.md content' });
	}

	const parseResult = await runbookMd.parseRunbookString(userRequest.content);
	const checkResult = await validateCodesAgainstBizOps(
		username,
		parseResult.data,
	);
	const parseCheckResult = Object.assign({}, parseResult, checkResult);
	parseCheckResult.errors = [].concat(parseResult.errors, checkResult.errors);
	if (parseCheckResult.errors.length) {
		return badRequestError({
			message: 'Parse Failures. Please correct and resubmit',
			details: ingestedDetails(parseCheckResult),
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
