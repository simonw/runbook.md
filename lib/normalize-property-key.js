/*
	normalizePropertyKey - takes a string and returns a normalized, lowercased
	string with no spaces
*/
module.exports = function normalizePropertyKey(key = '') {
	return key
		.normalize()
		.toLowerCase()
		.replace(/\s+/g, '');
};
