const runbookmd = require('..');
const here = require('outdent').default;

test('a valid property name gets correctly coerced', async () => {
	const { data } = await runbookmd.parseRunbookString(here`
		# name

		## Contains personal data
		yes
	`);

	expect(data).toHaveProperty('containsPersonalData', true);
});

test('an invalid property name prints an error', async () => {
	const { data, errors } = await runbookmd.parseRunbookString(here`
		# name

		## Contains big monkey
		yes
	`);

	expect(errors).toHaveProperty('length', 1);
	expect(data).toEqual({
		name: 'name',
	});
});
