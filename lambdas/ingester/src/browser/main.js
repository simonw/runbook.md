require('./main.scss');
const formHandler = require('./components/manualEntryForm');

// eslint-disable-next-line no-undef
const manualEntryForm = document.querySelector('#manualRunbookEntry');
if (manualEntryForm) {
	formHandler(manualEntryForm);
}
