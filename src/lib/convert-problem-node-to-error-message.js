module.exports = function convertProblemNodeToErrorMessage(node) {
	const {
		message,
		position: {
			start: { line },
		},
	} = node;

	if (line) {
		return `${message} on or around line ${line}`;
	}

	return message;
};
