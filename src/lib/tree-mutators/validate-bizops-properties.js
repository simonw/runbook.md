const visit = require('unist-util-visit-parents');
const convertNodeToProblem = require('./convert-node-to-problem');

module.exports = function coerceBizopsPropertiesToType({ validateProperty }) {
	function mutate(node) {
		try {
			validateProperty(node.key, node.value);
		} catch (message) {
			return convertNodeToProblem({
				node,
				message,
			});
		}
	}

	return function transform(tree) {
		visit(tree, 'property', mutate);
	};
};
