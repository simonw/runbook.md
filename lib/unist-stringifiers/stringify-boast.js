const os = require('os');
const visit = require('unist-util-visit-parents');
const stringifySubdocument = require('../stringify-subdocument');
const convertProblemToErrorMessage = require('../convert-problem-node-to-error-message');

const stringifyJson = jsonable => JSON.stringify(jsonable, null, '\t') + os.EOL;

module.exports = function stringifyBoast() {
	this.Compiler = function compiler(root) {
		const data = {};
		const errors = [];

		visit(root, 'name', node => {
			data.name = node.value;
		});

		visit(root, 'description', node => {
			data.description = stringifySubdocument(node.children[0]);
		});

		visit(root, 'property', node => {
			data[node.value] = node.children;
		});

		visit(root, 'problem', node => {
			errors.push(convertProblemToErrorMessage(node));
		});

		return stringifyJson({ data, errors });
	};
};
