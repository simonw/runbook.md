const schema = require('@financial-times/runbook.md-parser/lib/get-configured-schema.js');
const { queryBizOps } = require('./external-apis');

const pushUnique = (accumulator, valuesToAdd) => {
	valuesToAdd.forEach(valueToAdd => {
		if (
			!accumulator.find(
				existing =>
					valueToAdd.type === existing.type &&
					valueToAdd.code === existing.code,
			)
		)
			accumulator.push(valueToAdd);
	});
};

const getTypesAndCodesFromRelationships = (systemSchema, data) =>
	Object.entries(data).reduce((accumulator, [property, value]) => {
		const { type, isRelationship } = systemSchema.properties[property];
		if (isRelationship) {
			if (typeof value === 'string') {
				pushUnique(accumulator, [{ type, code: value }]);
			} else {
				pushUnique(accumulator, value.map(code => ({ type, code })));
			}
		}
		return accumulator;
	}, []);

const buildGraphQLQuery = bizOpsCodes =>
	`query getStuff {
	${bizOpsCodes
		.map(
			({ type, code }) =>
				`${type}_${code.replace(
					/[-.]/g,
					'_',
				)}:${type} (code:"${code}") {code}`,
		)
		.join('\n')}
	}`;

const formatBizOpsResponse = bizOpsResponse => {
	const bizOpsData = {};
	const errors = [];
	Object.entries(bizOpsResponse.data).forEach(([key, value]) => {
		const [type, code] = key.split(/_(.+)/);
		if (value === null) {
			errors.push({
				message: `There is no ${type} with a code of ${code} stored within Biz Ops`,
			});
		} else {
			bizOpsData[code] = value;
		}
	});
	return { bizOpsData, errors };
};

const validateCodesAgainstBizOps = async (username, data) => {
	const systemSchema = schema.getTypes().find(type => type.name === 'System');
	const uniqueBizOpsCodes = getTypesAndCodesFromRelationships(
		systemSchema,
		data,
	);
	if (!uniqueBizOpsCodes.length) {
		return { bizOpsData: {}, errors: [] };
	}
	const query = buildGraphQLQuery(uniqueBizOpsCodes);
	const { json: bizOpsResponse } = await queryBizOps(
		username,
		process.env.BIZ_OPS_API_KEY,
		query,
	);
	return formatBizOpsResponse(bizOpsResponse);
};

module.exports = {
	validateCodesAgainstBizOps,
};
