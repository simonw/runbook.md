const runbookMd = require('../../../../libraries/parser');
const schema = require('../lib/get-configured-schema');

module.exports = runbookMd(schema);
