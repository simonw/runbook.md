const visit = require('unist-util-visit-parents');
const convertNodeToProblem = require('./convert-node-to-problem');
const excluded = require('../../../../schema/excluded-properties');

module.exports = function coerceBizopsPropertiesToType({ validateProperty }) {
	function mutate(node) {
		if (excluded.includes(node.key)) {
			return convertNodeToProblem({
				node,
				message: `${node.key} is not permitted within runbook.md`,
			});
		}
		try {
			validateProperty(node.key, node.value);
		} catch (error) {
			return convertNodeToProblem({
				node,
				message: error.message,
			});
		}
	}

	return function transform(tree) {
		visit(tree, 'property', mutate);
	};
};
