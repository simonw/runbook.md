const visit = require('unist-util-visit-parents');

module.exports = function createBizopsNameNode() {
	function isNameHeading(node) {
		return node.type === 'heading' && node.depth === 1;
	}

	function mutate(node) {
		node.type = 'name';
		node.value = node.children && node.children[0].value;
		return node;
	}

	return function transform(tree) {
		visit(tree, isNameHeading, mutate);
	};
};
