const visit = require('unist-util-visit-parents');
const propertyCoercers = require('../property-coercers');
const convertNodeToProblem = require('./convert-node-to-problem');
const normalizePropertyKey = require('../normalize-property-key');
const flattenNodeToPlainString = require('../flatten-node-to-plain-string');
const setPropertyNodeValue = require('../set-property-node-value');

module.exports = function coerceBizopsPropertiesToType({
	typeNames,
	primitiveTypesMap,
	enums,
}) {
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

			const [subdocument] = node.children;

			const coercion = coercer(subdocument);

			if (coercion.valid) {
				setPropertyNodeValue(node, coercion.value);
			} else {
				convertNodeToProblem({
					node,
					message: coercion.value,
				});
			}

			return;
		}

		// If it's an enum, make sure it's a valid value for that enum
		if (node.propertyType in enums) {
			const flattenedContent = normalizePropertyKey(
				flattenNodeToPlainString(node.children[0]),
			);

			const enumName = node.propertyType;

			const validValues = Object.values(enums[enumName]);

			const validValue = validValues.find(value => {
				return flattenedContent === normalizePropertyKey(value);
			});

			if (validValue) {
				setPropertyNodeValue(node, validValue.value);
			} else {
				convertNodeToProblem({
					node,
					message: `${flattenedContent} is not a valid value for the enum ${enumName}`,
				});
			}

			return;
		}

		convertNodeToProblem({
			node,
			message: `i couldn't resolve ${
				node.propertyType
			} to a valid biz-ops property type or enum`,
		});
	}

	return function transform(tree) {
		visit(tree, 'property', mutate);
	};
};
