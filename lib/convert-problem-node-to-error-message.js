module.exports = function convertProblemNodeToErrorMessage(node) {
	return `${node.message} at line ${node.position.start.line}`;
};
