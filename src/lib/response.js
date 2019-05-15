const logger = require('@financial-times/lambda-logger');
const render = require('./render');

const CONTENT_TYPE = 'Content-Type';

const errorResponse = responseHandler => (error, event) => {
	const statusCode = error.statusCode || 500;
	logger.error(
		Object.assign({}, { error }, { path: event.path }),
		'Unhandled error',
	);
	return responseHandler(statusCode, error.message);
};

const json = (statusCode = 200, body) => ({
	statusCode,
	body: JSON.stringify(body),
	headers: {
		[CONTENT_TYPE]: 'application/json',
	},
});

const errorHtml = errorResponse(json);
const errorJson = errorResponse(json);

const page = (template, data, event, statusCode = 200) => {
	const user = event.isSignedIn && event.s3oUsername;
	return {
		statusCode,
		body: render(template, Object.assign(data, { user })),
		headers: {
			'Content-Type': 'text/html',
			'Cache-Control':
				'private, no-cache, no-store, must-revalidate, max-age=0',
		},
	};
};

module.exports = {
	errorHtml,
	errorJson,
	json,
	page,
};
