const logger = require('@financial-times/lambda-logger');
const { createLambda } = require('./lib/lambda');
const { ingest } = require('./commands/ingest');
const { htmlResponse } = require('./lib/response');

const ingestHandler = async (username, userRequest) => {
	try {
		const ingestResponse = await ingest(username, userRequest);
		return htmlResponse(Object.assign({ status: 200 }, ingestResponse));
	} catch (error) {
		return htmlResponse(Object.assign({ status: 400 }, { ...error }));
	}
};

const handler = async event => {
	const userRequest = JSON.parse(event.body);
	logger.info({ event: 'RUNBOOK_INGESTION', userRequest });
	return ingestHandler(event.s3oUsername, userRequest);
};

module.exports = {
	handler: createLambda(handler),
	ingest,
};
