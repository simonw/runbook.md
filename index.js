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

function grabBizopsName() {
	function isNameHeading(node) {
		return node.type === 'heading' && node.depth === 1;
	}

	function mutate(node) {
		node.type = 'bizops';
		node.field = 'name';
		node.value = node.children && node.children[0].value;
		return node;
	}

	return function transform(tree) {
		visit(tree, isNameHeading, mutate);
	};
}

function grabBizopsDescription() {
	function isTopLevelDescription(node) {
		return node.type === 'paragraph' && node.depth === 1;
	}

	function mutate(node) {
		node.type = 'bizops';
		node.field = 'name';
		node.value = node.children;
		node.value = node.children[0].value;
		return node;
	}

	return function transform(tree) {
		while (select.select(':not(heading)'))
			visit(tree, isTopLevelDescription, mutate);
	};
}

function normalizeBizopsFields() {
	function isFieldHeading(node) {
		return node.type === 'heading' && node.depth === 2;
	}

	function mutate(heading) {
		visit(heading, 'text', textChild => {
			textChild.value = textChild.value.toLowerCase().replace(/\s+/g, '');
			return textChild;
		});
	}

	return function transform(tree) {
		visit(tree, isFieldHeading, mutate);
	};
}

function nestContent() {
	function mutate(start, nodes, end) {
		return [
			{
				type: 'bizops',
				field: start.children[0].value,
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

function bizops() {
	const types = new Map([
		[
			'subdocument',
			{
				set: new Set([
					'architecturediagram',
					'description',
					'failoverdetails',
					'releasedetails',
					'troubleshooting',
					'moreinformation',
					'keymanagementdetails',
					'datarecoverydetails',
					'monitoring',
				]),
				coercer(node) {
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
				},
			},
		],
		[
			'string',
			{
				set: new Set([
					'name',
					'code',
					'servicetier',
					'lifecyclestage',
					'deliveredby',
					'supportedby',
				]),
				coercer(node) {
					return unified()
						.use(remarkStringify, {
							bullet: '*',
							fences: true,
						})
						.stringify(node.children[0])
						.trim();
				},
			},
		],
		[
			'boolean',
			{
				set: new Set(['containspersonaldata', 'containssensitivedata']),
				coercer(node) {
					return Boolean(node.children[0].value);
				},
			},
		],
		[
			'list',
			{
				set: new Set(['knownaboutby', 'replaces']),
				coercer(node) {
					const result = [];
					visit(node, 'listItem', listItem =>
						result.push(types.get('string').coercer(listItem)),
					);
					return result;
				},
			},
		],
		[
			'architecturetype',
			{
				set: new Set(['failoverarchitecturetype']),
				coercer(node) {
					return types.get('subdocument').coercer(node);
				},
			},
		],
		[
			'processtype',
			{
				set: new Set([
					'failoverprocesstype',
					'releaseprocesstype',
					'failbackprocesstype',
					'datarecoveryprocesstype',
					'keymanagementprocesstype',
					'rollbackprocesstype',
				]),
				coercer(node) {
					return types.get('subdocument').coercer(node);
				},
			},
		],
	]);

	function coerce(node) {
		for (const { set, coercer } of types.values()) {
			if (set.has(node.field)) {
				return coercer(node);
			}
		}
	}

	this.Compiler = function compiler(root) {
		let result = '{';

		visit(root, 'bizops', node => {
			const coercion = JSON.stringify(coerce(node));
			result += `"${node.field}": ${coercion == null ? null : coercion},`;
		});

		return `${result.slice(0, result.length - 1)}}\n`;
	};
}

const processor = unified()
	.use(remarkParse)
	.use(lint)
	.use(noDuplicateHeadings)
	.use(noMultipleTitles)
	.use(grabBizopsName)
	.use(grabBizopsDescription)
	.use(normalizeBizopsFields)
	.use(nestContent)
	.use(bizops);

process.stdin.pipe(createStream(processor)).pipe(process.stdout);
