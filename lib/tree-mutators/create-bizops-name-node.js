const visit = require('unist-util-visit-parents');
const flattenNodeToPlainString = require('../flatten-node-to-plain-string');

module.exports = function createBizopsNameNode() {
	function isNameHeading(node) {
		return node.type === 'heading' && node.depth === 1;
	}

	function mutate(node) {
		node.type = 'name';
		node.value = flattenNodeToPlainString(node);
		return node;
	}

	return function transform(tree) {
		visit(tree, isNameHeading, mutate);
	};
};
