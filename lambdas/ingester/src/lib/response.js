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
	const user = event && event.isSignedIn && event.s3oUsername;
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

const responseHeaders = {
	'Content-Type': 'application/json',
	'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
};

const htmlResponse = ({ status, message, details }) => ({
	statusCode: status,
	body: JSON.stringify({ message, ...details }),
	headers: responseHeaders,
});
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

module.exports = {
	htmlResponse,
	success,
	badRequestError,
	ingestedDetails,
	errorHtml,
	errorJson,
	json,
	page,
};
