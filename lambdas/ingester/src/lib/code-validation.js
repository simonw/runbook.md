const schema = require('./get-configured-schema');
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

const buildGraphQLQuery = bizOpsCodes => {
	const propertyMappings = {};
	const query = `query getStuff {
		${bizOpsCodes
			.map(({ type, code }) => {
				const sanitizedCode = code.replace('-', '').replace(/\W/g, '');
				propertyMappings[`${type}_${sanitizedCode}`] = { type, code };
				return `${type}_${sanitizedCode}:${type} (code:"${code}") {code}`;
			})
			.join('\n')}
		}`;
	return { query, propertyMappings };
};

const formatBizOpsResponse = (bizOpsResponse, propertyMappings) => {
	const bizOpsData = {};
	const errors = [];
	Object.entries(bizOpsResponse.data).forEach(([key, value]) => {
		const { type, code } = propertyMappings[key];
		if (value === null) {
			errors.push({
				message: `There is no ${type} with a code of ${code} stored within Biz Ops`,
			});
		} else {
			bizOpsData[key] = {
				code,
				value,
			};
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
	const { query, propertyMappings } = buildGraphQLQuery(uniqueBizOpsCodes);
	const { json: bizOpsResponse } = await queryBizOps(
		username,
		process.env.BIZ_OPS_API_KEY,
		query,
	);
	return formatBizOpsResponse(bizOpsResponse, propertyMappings);
};

module.exports = {
	validateCodesAgainstBizOps,
};
