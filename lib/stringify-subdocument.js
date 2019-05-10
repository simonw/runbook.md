const unified = require('unified');
const remarkStringify = require('remark-stringify');
const remarkBehead = require('remark-behead');
const build = require('unist-builder');

const reduceSubdocumentHeadings = remarkBehead({ depth: -1 });

// TODO: do not mutate the subdoc
module.exports = function stringifySubdocument(node) {
	reduceSubdocumentHeadings(node);

	const subdocument = build('root', {
		children: node.children,
	});

	return unified()
		.use(remarkStringify, {
			bullet: '*',
			fences: true,
		})
		.stringify(subdocument)
		.trim();
};