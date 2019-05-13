const runbookmd = require('..');
const here = require('outdent').default;

test('an h1 is parsed as name', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		# hello monkey
	`);
	expect(errors.length).toBe(0);
	expect(data).toHaveProperty('name', 'hello monkey');
});

test('inline markdown in an H1 is an error', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		# Hello *monkey* _don't_ worry about a thing
	`);
	expect(errors.length).toBe(1);
	expect(data).not.toHaveProperty('name');
});

test('more than one h1 is an error', async () => {
	const twoNames = await runbookmd.parseRunbookString(here`
		# hello monkey

		# also this
	`);

	const nineNames = await runbookmd.parseRunbookString(here`
		# hello monkey
		# bears
		# also this
		# hello monkey
		# bears
		# also this
		# hello monkey
		# bears
		# also this
	`);

	expect(twoNames.errors.length).toBe(2);
	expect(nineNames.errors.length).toBe(9);
	expect(twoNames.data).not.toHaveProperty('name');
	expect(nineNames.data).not.toHaveProperty('name');
});

test('no h1 is an error', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		wow
	`);

	expect(errors.length).toBe(1);
	expect(data).not.toHaveProperty('name');
});

test('content before an h1 is an error', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		wow
	`);

	expect(errors.length).toBe(1);
	expect(data).not.toHaveProperty('name');
});
