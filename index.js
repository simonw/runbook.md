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

const reduceSubdocumentHeadings = remarkBehead({ depth: -1 });

const bizOpsSchema = require('./lib/get-configured-schema.js');

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

function checkNodeHasStringValue(node) {
	return typeof node.value === 'string';
}

function checkNodeHasChildren(node) {
	return Array.isArray(node.children);
}

function flattenNodeToPlainString({ children = [] } = {}) {
	return children.reduce((flattenedContent, node) => {
		const hasTextValue = checkNodeHasStringValue(node);
		const hasChildren = checkNodeHasChildren(node);

		if (hasTextValue) {
			return flattenedContent + node.value;
		}

		if (hasChildren) {
			return flattenedContent + flattenNodeToPlainString(node);
		}

		return flattenedContent;
	}, '');
}

function normalizePropertyKey(key = '') {
	return key
		.normalize()
		.toLowerCase()
		.replace(/\s+/g, '');
}

function createBizopsPropertyNodes() {
	function mutate(start, nodes, end) {
		return [
			{
				type: 'property',
				value: flattenNodeToPlainString(start),
				children: [build('root', { children: nodes })],
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
			result[node.value] = node.children;
		});

		return JSON.stringify(result, null, '\t') + os.EOL;
	};
}

function resolvePropertyName({ heading, systemProperties }) {
	const normalizedHeading = normalizePropertyKey(heading);
	const propertyEntries = Object.entries(systemProperties);
	return propertyEntries.find(([key, property]) => {
		return (
			key === heading ||
			property.label === heading ||
			normalizePropertyKey(key) === normalizedHeading ||
			normalizePropertyKey(property.label) === normalizedHeading
		);
	});
}

function resolveBizopsPropertyNames({ systemProperties }) {
	function mutate(node) {
		const property = resolvePropertyName({
			heading: node.value,
			systemProperties,
		});

		if (!property) {
			// TODO: convert to problem node here
			throw new Error(
				'this is where we should be collecting this up as an invalid property name and pointing the user at the line number',
			);
		}

		const [name, type] = property;

		node.value = name;

		node.propertyType = type.type;
	}

	return function transform(tree) {
		visit(tree, 'property', mutate);
	};
}

const propertyCoercers = {
	String(subdocument) {
		return stringifySubdocument(subdocument);
	},
	Date(subdocument) {
		const flattenedContent = flattenNodeToPlainString(subdocument);
		const date = new Date(flattenedContent);

		if (date) {
			return date.toDateString();
		}

		// TODO: convert to problem node here
		throw new Error(
			'we should be noting this was a bad date and pointing user at line number',
		);
	},
	Time(subdocument) {
		const flattenedContent = flattenNodeToPlainString(subdocument);
		const date = new Date(flattenedContent);

		if (date) {
			return date.toTimeString();
		}

		// TODO: convert to problem node here
		throw new Error(
			'we should be noting this was a bad time and pointing user at line number',
		);
	},
	DateTime(subdocument) {
		const flattenedContent = flattenNodeToPlainString(subdocument);
		const date = new Date(flattenedContent);

		if (date) {
			return date.toISOString();
		}

		// TODO: convert to problem node here
		throw new Error(
			'we should be noting this was a bad DateTime and pointing user at line number',
		);
	},
	Int(subdocument) {
		const flattenedContent = flattenNodeToPlainString(subdocument);
		const number = Number(flattenedContent);

		if (Number.isInteger(number)) {
			return number;
		}

		// TODO: convert to problem node here
		throw new Error(
			'we should be noting this was a bad integer and pointing user at line number',
		);
	},
	Float(subdocument) {
		const flattenedContent = flattenNodeToPlainString(subdocument);
		const number = Number(flattenedContent);

		if (Number.isFinite(number)) {
			return number;
		}

		// TODO: convert to problem node here
		throw new Error(
			'we should be noting this was a bad float and pointing user at line number',
		);
	},
	Boolean(subdocument) {
		const flattenedContent = flattenNodeToPlainString(
			subdocument,
		).toLowerCase();

		switch (flattenedContent) {
			case 'true':
			case 'yes':
			case '👍':
				return true;
			case 'false':
			case 'no':
			case '👎':
				return false;
			default:
				// TODO: convert to problem node here
				throw new Error(
					'we should be noting this was a bad boolean and pointing user at line number',
				);
		}
	},
};

function coerceBizopsPropertiesToType({ typeNames, primitiveTypesMap, enums }) {
	function mutate(node) {
		// If we come across a main type (such as System), then in the markdown
		// we will specify only a code
		if (typeNames.has(node.propertyType)) {
			node.propertyType = 'Code';
		}

		// If the propertyType is one of the primitive types, coerce it
		if (node.propertyType in primitiveTypesMap) {
			const primitiveType = primitiveTypesMap[node.propertyType];

			const coercer = propertyCoercers[primitiveType];

			node.children = coercer(node.children[0]);
			return;
		}

		// If it's an enum, make sure it's a valid value for that enum
		if (node.propertyType in enums) {
			const flattenedContent = normalizePropertyKey(
				flattenNodeToPlainString(node.children[0]),
			);

			const validValue = Object.entries(enums[node.propertyType]).reduce(
				(current, [name, label]) => {
					if (current) return current;
					return flattenedContent === normalizePropertyKey(label)
						? name
						: current;
				},
				false,
			);

			if (validValue) {
				node.children = validValue;
				return;
			}

			// TODO: convert to problem node here
			throw new Error(
				'we should be noting an invalid value for this enum and pointing user at line number',
			);
		}

		// TODO: convert to problem node here
		throw new Error(
			'we should be noting an invalid property type and pointing user at line number',
		);
	}

	return function transform(tree) {
		visit(tree, 'property', mutate);
	};
}

(async function() {
	await bizOpsSchema.refresh();

	const bizOpsSystem = bizOpsSchema
		.getTypes()
		.find(type => type.name === 'System');

	const processor = unified()
		.use(remarkParse)
		.use(lint)
		.use(noDuplicateHeadings)
		.use(noMultipleTitles)
		.use(createBizopsNameNode)
		.use(createBizopsDescriptionNode)
		.use(createBizopsPropertyNodes)
		.use(resolveBizopsPropertyNames, {
			systemProperties: bizOpsSystem.properties,
			primitiveTypesMap: bizOpsSchema.primitiveTypesMap,
		})
		.use(coerceBizopsPropertiesToType, {
			typeNames: new Set(bizOpsSchema.getTypes().map(type => type.name)),
			primitiveTypesMap: bizOpsSchema.primitiveTypesMap,
			enums: bizOpsSchema.getEnums(),
		})
		.use(jsonifyBizops);

	process.stdin.pipe(createStream(processor)).pipe(process.stdout);
})();
