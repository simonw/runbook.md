const logger = require('@financial-times/lambda-logger');
const httpError = require('http-errors');
const nodeFetch = require('node-fetch');

const callExternalApi = async ({
	name,
	method,
	url,
	payload,
	headers,
	expectedStatuses = [200],
}) => {
	const options = {
		method,
		body: JSON.stringify(payload),
		headers,
	};
	const fetchResponse = await nodeFetch(url, options);
	if (!expectedStatuses.includes(fetchResponse.status)) {
		throw httpError(
			fetchResponse.status,
			`Attempt to access ${name} ${url} ${options} failed with ${
				fetchResponse.statusText
			}`,
		);
	}
	logger.info(
		{ event: `POSTED to ${url}`, options },
		`Waiting for ${name} response`,
	);
	return { status: fetchResponse.status, json: await fetchResponse.json() };
};

const ingest = async (event, request) =>
	callExternalApi({
		name: 'RUNBOOK.MD ingest',
		method: 'POST',
		url: `${process.env.BASE_URL}/ingest`,
		payload: request,
		headers: { Cookie: event.headers.Cookie },
		expectedStatuses: [200, 400, 403],
	});

const validate = async (event, request) =>
	callExternalApi({
		name: 'SOS validate',
		method: 'POST',
		url: `${process.env.SOS_URL}/api/v1/validate`,
		payload: request,
	});

const updateBizOps = async (event, apiKey, systemCode, content) => {
	const queryString = `?lockFields=${Object.keys(content)
		.map(name => name)
		.join(',')}`;
	return callExternalApi({
		name: 'Biz Ops Update',
		method: 'PATCH',
		url: `${
			process.env.BIZ_OPS_API_URL
		}/v2/node/System/${systemCode}${queryString}`,
		payload: content,
		headers: {
			'x-api-key': apiKey,
			'client-id': 'biz-ops-runbook-md',
			'content-type': 'application/json',
			'client-user-id': event.s3oUsername,
		},
		expectedStatuses: [200, 400, 403],
	});
};

module.exports = {
	ingest,
	validate,
	updateBizOps,
};
