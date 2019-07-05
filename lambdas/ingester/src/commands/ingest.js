const runbookMd = require('../lib/parser');
const { validate, updateBizOps } = require('../lib/external-apis');
const { validateCodesAgainstBizOps } = require('../lib/code-validation');
const excluded = require('../../../../schema/excluded-properties');

const checkScopeOfProperties = data => {
	const errors = [];
	Object.entries(data).forEach(([property]) => {
		if (excluded.includes(property)) {
			errors.push({
				message: `${property} is not permitted in runbook.md`,
			});
			delete data[property];
		}
	});
	return errors;
};

const transformIngestedDetails = (
	parseResult,
	validationResult,
	writeResult,
) => ({
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

const decorateError = props => {
	const error = new Error();
	Object.assign(error, { ...props });
	return error;
};

const ingest = async (username, payload) => {
	const { content, writeToBizOps, systemCode, bizOpsApiKey } = payload;
	if (!content) {
		throw decorateError({ message: 'Please supply RUNBOOK.md content' });
	}
	// parse RUNBOOK.MD to JSON
	const parseResult = await runbookMd.parseRunbookString(content);

	// check that only expected properties have been provided
	const scopeErrors = checkScopeOfProperties(parseResult.data);

	// validate JSON against the System properties
	// in biz-ops schema
	const checkResult = await validateCodesAgainstBizOps(
		username,
		parseResult.data,
	);

	const parseCheckResult = { ...parseResult, ...checkResult };
	parseCheckResult.errors = [
		...(parseResult.errors || []),
		...(checkResult.errors || []),
		...(scopeErrors || []),
	];

	if (parseCheckResult.errors.length) {
		throw decorateError({
			message: 'Parse Failures. Please correct and resubmit',
			details: transformIngestedDetails(parseCheckResult),
		});
	}

	// validate against SOS ruleset
	const { json: validationResult } = await validate(parseResult.data);

	const details = transformIngestedDetails(parseResult, validationResult);

	if (!writeToBizOps || writeToBizOps === 'no') {
		return {
			message:
				'Parse & Validation Complete. Biz Ops Was NOT Updated as you did not enable the writeToBizOps flag.',
			details,
		};
	}

	// we don't need systemCode until this point
	if (!systemCode) {
		throw decorateError({
			message: 'Please supply a systemCode',
			details,
		});
	}

	if (!bizOpsApiKey) {
		throw decorateError({
			message: 'Please supply a Biz-Ops API keyyy',
			details,
		});
	}

	const { status, json: response } = await updateBizOps(
		username,
		bizOpsApiKey,
		systemCode,
		parseResult.data,
	);

	if (status !== 200) {
		return decorateError({
			status,
			message: `Biz Ops update failed (status ${status})`,
			response,
			details,
		});
	}

	return {
		status,
		message: `Biz Ops has been updated.`,
		details: transformIngestedDetails(
			parseResult,
			validationResult,
			response,
		),
	};
};

module.exports = {
	ingest,
};
