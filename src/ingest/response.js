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
};
