const logger = require('@financial-times/lambda-logger');
const httpError = require('http-errors');
const nodeFetch = require('node-fetch');

const callExternalApi = async ({ name, url, payload, headers }) => {
	const options = {
		method: 'POST',
		body: JSON.stringify(payload),
		headers,
	};
	const fetchResponse = await nodeFetch(url, options);
	if (!fetchResponse.ok) {
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
	return fetchResponse.json();
};

const attemptParse = async (event, request) => {
	return callExternalApi({
		name: 'RUNBOOK.MD parse',
		url: `${process.env.BASE_URL}/ingest`,
		payload: request,
		headers: { Cookie: event.headers.Cookie },
	});
};

const attemptScore = async (event, request) => {
	return callExternalApi({
		name: 'SOS validate',
		url: `${process.env.SOS_URL}/validate`,
		payload: request,
		headers: { Cookie: event.headers.Cookie },
	});
};

const updateBizOps = async (event, apiKey, systemCode, content) => {
	const headers = {
		'x-api-key': apiKey,
		'client-id': 'biz-ops-runbook-md',
		'content-type': 'application/json',
		'client-user-id': event.s3oUsername,
	};
	const contentFields = Object.keys(content)
		.map(name => name)
		.join(',');
	const queryString = `?lockFields=${contentFields}`;
	const url = `${process.env.BIZ_OPS_API_URL}/v2/node/System/${systemCode}`;
	const options = {
		method: 'PATCH',
		headers,
		body: JSON.stringify(content),
	};
	const response = await nodeFetch(`${url}${queryString}`, options);
	if (!response.ok) {
		throw httpError(
			response.status,
			`Attempt to access BIZ_OPS ${url}${queryString} failed with ${
				response.statusText
			}`,
		);
	}
	return { response: response.json(), status: response.status };
};

module.exports = {
	attemptParse,
	attemptScore,
	updateBizOps,
};
