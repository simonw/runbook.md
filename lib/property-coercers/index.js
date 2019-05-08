const stringifySubdocument = require('../stringify-subdocument');
const flattenNodeToPlainString = require('../flatten-node-to-plain-string');

/*
  These coercers take a subdocument that should be coerced to their eponymous
  type, and they return an object with a key of `valid`and a key of `value`. if
  `valid` is `true` then `value` will be the coerced property. if `valid` is
  `false` then `value` will be the problem message
*/
module.exports = {
	String(subdocument) {
		return {
			valid: true,
			value: stringifySubdocument(subdocument),
		};
	},
	Date(subdocument) {
		const flattenedContent = flattenNodeToPlainString(subdocument);
		const date = new Date(flattenedContent);

		if (date) {
			return {
				valid: true,
				value: date.toDateString(),
			};
		}

		return {
			valid: false,
			value: `i couldn't resolve ${flattenedContent} to a Date`,
		};
	},
	Time(subdocument) {
		const flattenedContent = flattenNodeToPlainString(subdocument);
		const date = new Date(flattenedContent);

		if (date) {
			return {
				valid: true,
				value: date.toTimeString(),
			};
		}

		return {
			valid: false,
			value: `i couldn't resolve ${flattenedContent} to a Time`,
		};
	},
	DateTime(subdocument) {
		const flattenedContent = flattenNodeToPlainString(subdocument);
		const date = new Date(flattenedContent);

		if (date) {
			return {
				valid: true,
				value: date.toISOString(),
			};
		}

		return {
			valid: false,
			value: `i couldn't resolve ${flattenedContent} to a DateTime`,
		};
	},
	Int(subdocument) {
		const flattenedContent = flattenNodeToPlainString(subdocument);
		const number = Number(flattenedContent);

		if (Number.isInteger(number)) {
			return {
				valid: true,
				value: number,
			};
		}

		return {
			valid: false,
			value: `i couldn't resolve ${flattenedContent} to an Int`,
		};
	},
	Float(subdocument) {
		const flattenedContent = flattenNodeToPlainString(subdocument);
		const number = Number(flattenedContent);

		if (Number.isFinite(number)) {
			return {
				valid: true,
				value: number,
			};
		}

		return {
			valid: false,
			value: `i couldn't resolve ${flattenedContent} to a Float`,
		};
	},
	Boolean(subdocument) {
		const flattenedContent = flattenNodeToPlainString(
			subdocument,
		).toLowerCase();

		switch (flattenedContent) {
			case 'true':
			case 'yes':
			case '👍': {
				return {
					valid: true,
					value: true,
				};
			}
			case 'false':
			case 'no':
			case '👎': {
				return {
					valid: true,
					value: false,
				};
			}
			default: {
				return {
					valid: false,
					value: `i couldn't resolve ${flattenedContent} to a boolean`,
				};
			}
		}
	},
};
