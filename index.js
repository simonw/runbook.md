const os = require('os');
const createStream = require('unified-stream');
const lint = require('remark-lint');
const noDuplicateHeadings = require('remark-lint-no-duplicate-headings-in-section');
const noMultipleTitles = require('remark-lint-no-multiple-toplevel-headings');
const visit = require('unist-util-visit-parents');
const build = require('unist-builder');
const mdastUtilHeadingRange = require('mdast-util-heading-range');
const select = require('unist-util-select');
const remarkBehead = require('remark-behead');
const unified = require('unified');
const remarkStringify = require('remark-stringify');
const remarkParse = require('remark-parse');

const reduceSubdocumentHeadings = remarkBehead({ depth: -2 });

process.env.SCHEMA_BASE_URL = '';

const bizOpsSchema = require('@financial-times/biz-ops-schema');

bizOpsSchema.configure({
	baseUrl: process.env.SCHEMA_BASE_URL,
	updateMode: 'stale',
});

function createBizopsNameNode() {
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
}

function createBizopsDescriptionNode() {
	function isTopLevelDescription(node) {
		return node.type === 'paragraph' && node.depth === 1;
	}

	function mutate(node) {
		node.type = 'description';
		return node;
	}

	return function transform(tree) {
		while (select.select(':not(heading)'))
			visit(tree, isTopLevelDescription, mutate);
	};
}

function nestContent() {
	function mutate(start, nodes, end) {
		return [
			{
				type: 'property',
				// TODO: replace this with a function that creates a text value
				//       from the children
				value: start.children[0].value,
				children: nodes,
			},
			end,
		];
	}

	function isFieldHeading(heading, node) {
		return node.depth === 2;
	}

	return function transform(tree) {
		while (select.select('heading[depth=2]', tree)) {
			mdastUtilHeadingRange(tree, isFieldHeading, mutate);
		}
	};
}

// TODO: do not mutate the subdoc
function stringifySubdocument(node) {
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
}

function jsonifyBizops() {
	this.Compiler = function compiler(root) {
		const result = {};

		visit(root, 'name', node => {
			result.name = node.value;
		});

		visit(root, 'description', node => {
			result.description = stringifySubdocument(node.children[0]);
		});

		visit(root, 'property', node => {
			result[node.value] = stringifySubdocument(node.children[0]);
		});

		return JSON.stringify(result, null, '\t') + os.EOL;
	};
}

(async function() {
	await bizOpsSchema.refresh();

	const processor = unified()
		.use(remarkParse)
		.use(lint)
		.use(noDuplicateHeadings)
		.use(noMultipleTitles)
		.use(createBizopsNameNode)
		.use(createBizopsDescriptionNode)
		.use(jsonifyBizops)
		.use(nestContent);

	process.stdin.pipe(createStream(processor)).pipe(process.stdout);
})();
