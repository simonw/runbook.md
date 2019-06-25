const runbookMd = require('@financial-times/runbook.md-parser');
const schema = require('../lib/get-configured-schema');

module.exports = runbookMd(schema);
