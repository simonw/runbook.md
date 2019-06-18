const runbookMd = require('./lib/runbook.md');

module.exports = runbookMd;

/*
	if we don't have a parent, we are the main module. if we are the main module
	then we are being executed in a command-line context
*/
const inShellMode = !module.parent;

if (inShellMode) {
	runbookMd.createStream().then(stream => {
		process.stdin.pipe(stream).pipe(process.stdout);
	});
}
