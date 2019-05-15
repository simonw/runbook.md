const os = require('os');
const visit = require('unist-util-visit-parents');
const { selectAll } = require('unist-util-select');
const stringifySubdocument = require('../stringify-subdocument');
const convertProblemToErrorMessage = require('../convert-problem-node-to-error-message');

const stringifyJson = jsonable => JSON.stringify(jsonable, null, '\t') + os.EOL;

module.exports = function stringifyBoast() {
	this.Compiler = function compiler(root) {
		const data = {};

		visit(root, 'name', node => {
			data.name = node.value;
		});

		visit(root, 'description', node => {
			data.description = stringifySubdocument(node.children[0]);
		});

		visit(root, 'property', node => {
			data[node.value] = node.children;
		});

		const errors = selectAll('problem', root).map(
			convertProblemToErrorMessage,
		);

		return stringifyJson({ data, errors });
	};
};
