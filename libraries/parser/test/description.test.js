const runbookmd = require('..');
const here = require('outdent').default;

test('any top level content outside an h2-range is parsed as description', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		# well

		hello monkey

		## primary url

		https://ft.com?
	`);
	expect(errors.length).toBe(0);
	expect(data).toHaveProperty('description', 'hello monkey');
});

test('top level content in an h2-range is not parsed as description', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		# i have a heading
		## primary url
		how's tricks
	`);
	expect(errors.length).toBe(0);
	expect(data).not.toHaveProperty('description');
});
