const visit = require('unist-util-visit-parents');
const { select } = require('unist-util-select');

module.exports = function createBizopsDescriptionNode() {
	function isTopLevelDescription(node) {
		return node.type === 'paragraph' && node.depth === 1;
	}

	function mutate(node) {
		node.type = 'description';
		return node;
	}

	return function transform(tree) {
		while (select(':not(heading)'))
			visit(tree, isTopLevelDescription, mutate);
	};
};
