const marked = require('marked');

// see https://marked.js.org/#/USING_ADVANCED.md#options
// for configuration options
marked.setOptions({
	gfm: true,
	breaks: false,
	tables: true,
});

// marked wraps strings in <p></p> by defailt
// this strips the wrapping paragraph
// or does nothing if the string is not wrapped in <p></p>
const stripWrappingParagraph = string => {
	const matched = string.match(/^<p>(.*)<\/p>$/s);
	return matched ? matched[1] : string;
};

const sanitizeHTML = string => {
	let sanitizedHTML = string;
	sanitizedHTML = sanitizedHTML.replace(/\n+$/s, '');
	sanitizedHTML = stripWrappingParagraph(sanitizedHTML);
	return sanitizedHTML;
};

exports.parseMarkdown = string => marked(string);

exports.markdownToHTML = string => {
	const html = this.parseMarkdown(string);
	const sanitizedHTML = sanitizeHTML(html);
	return {
		__html: sanitizedHTML,
	};
};
