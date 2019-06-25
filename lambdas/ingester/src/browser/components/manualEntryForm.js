function toggleBizOpsWriteMode(target, toggleFields) {
	const display = target.value === 'yes' ? 'flex' : 'none';
	toggleFields.forEach(field => {
		if (field) {
			field.style.display = display;
		}
	});
}

// TODO: the Origami way!
function toggleErrorState(
	target,
	isValid,
	errorSelector = '.o-forms-input__error',
) {
	const container = target.parentElement;
	const action = isValid ? 'remove' : 'add';
	container.classList[action]('o-forms-input--invalid');
	const errorMessage = container.querySelector(errorSelector);
	errorMessage.style.display = isValid ? 'none' : 'flex';
}

async function submitForm(form) {
	const content = form.querySelector('#content');
	if (!content.value.length) {
		content.value = content.placeholder;
	}
	// TODO: client-side only
	form.submit();
}

function validateSubmission(event, container) {
	event.preventDefault();
	const writeToBizOps = container.querySelector('#writeToBizOps-yes').checked;
	if (!writeToBizOps) {
		return submitForm(container);
	}
	const systemCode = container.querySelector('#systemCode');
	let valid = true;

	if (systemCode.value.length < 3) {
		toggleErrorState(systemCode, false);
		valid = false;
	} else {
		toggleErrorState(systemCode, true);
	}
	const apiKey = container.querySelector('#bizOpsApiKey');
	if (apiKey.value.length < 3) {
		toggleErrorState(apiKey, false);
		valid = false;
	} else {
		toggleErrorState(apiKey, true);
	}
	if (!valid) {
		toggleErrorState(event.target, false, '.runbook-form__submit--error');
		return;
	}
	toggleErrorState(event.target, true, '.runbook-form__submit--error');
	submitForm(container);
}

module.exports = function(form) {
	// toggle visibility of optional Biz-Ops write fields
	const bizOpsToggle = [...form.querySelectorAll('[name="writeToBizOps"]')];
	const toggleFields = [
		form.querySelector('.validation-bizOpsApiKey'),
		form.querySelector('.validation-systemCode'),
	];
	const submitButton = form.querySelector('#submitRunbookForm');

	bizOpsToggle.forEach(toggle => {
		toggle.addEventListener('change', ({ target }) => {
			toggleBizOpsWriteMode(target, toggleFields);
		});
		if (toggle.checked) {
			toggleBizOpsWriteMode(toggle, toggleFields);
		}
	});
	submitButton.addEventListener('click', event => {
		validateSubmission(event, form);
	});
};
