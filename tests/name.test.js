const runbookmd = require('..');
const here = require('outdent').default;

test('an h1 is parsed as name', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		# hello monkey
	`);
	expect(errors.length).toBe(0);
	expect(data).toHaveProperty('name', 'hello monkey');
});

test('inline markdown is stripped', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		# Hello *monkey* _don't_ worry about a thing
	`);
	expect(errors.length).toBe(0);
	expect(data).toHaveProperty(
		'name',
		"Hello monkey don't worry about a thing",
	);
});

xtest('more than one h1 is an error', async () => {
	const { errors } = await runbookmd.parseRunbookString(here`
		# hello monkey

		# also this
	`);

	expect(errors.length).toBe(1);
});

test('no h1 means no name', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		wow
	`);

	expect(errors.length).toBe(0);
	expect(data).toHaveProperty('name', undefined);
});
