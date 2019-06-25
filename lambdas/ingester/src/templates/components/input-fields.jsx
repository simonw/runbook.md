const { h } = require('hyperons');

const FieldMeta = ({ title, info, id }) => (
	<span className="o-forms-title" aria-hidden="true">
		<span className="o-forms-title__main" id={`${id}-title`}>
			{title}
		</span>
		{info && (
			<span className="o-forms-title__prompt" id={`${id}-info`}>
				{info}
			</span>
		)}
	</span>
);

const FormField = ({ title, info, id, content, optional }) => (
	<div
		className={`validation-${id} o-forms-field ${
			optional ? 'o-forms-field--optional' : ''
		}`}
		aria-labelledby={`${id}-title`}
		aria-describedby={`${id}-info`}
	>
		{title && info && <FieldMeta id={id} title={title} info={info} />}
		{content}
	</div>
);

const TextInput = ({ name, value }) => (
	<span className="o-forms-input o-forms-input--text">
		<input
			type="text"
			className="o-forms__text"
			name={name}
			id={name}
			value={value}
			required
		/>
		<span className="o-forms-input__error">Please fill out this field</span>
	</span>
);

const RadioButton = ({ id, value, label, checked }) => (
	<label>
		<input
			type="radio"
			id={`${id}-${value}`}
			name={id}
			value={value}
			aria-label={label}
			checked={checked ? 'checked' : null}
			required
		/>
		<span
			className={`o-forms-input__label ${
				checked ? 'o-forms-input__label--negative' : ''
			}`}
			aria-hidden="true"
		>
			{label}
		</span>
	</label>
);

const SystemCode = ({ systemCode }) => {
	const props = {
		title: 'System Code',
		info: `The system code associated with the runbook, as per Biz-Ops.`,
		id: 'systemCode',
	};

	props.content = (
		<TextInput id={props.id} name={props.id} value={systemCode} />
	);

	return <FormField {...props} />;
};

const ApiKey = ({ bizOpsApiKey }) => {
	const props = {
		title: 'Your Biz-Ops API Key',
		info: `A valid API key is required to update runbook information in Biz-Ops.`,
		id: 'bizOpsApiKey',
	};

	props.content = (
		<TextInput id={props.id} name={props.id} value={bizOpsApiKey} />
	);

	return <FormField {...props} />;
};

const WriteFlag = ({ writeToBizOps }) => {
	const props = {
		title: 'Write to Biz-Ops?',
		info: `Choosing 'Yes' updates Biz-Ops with the results of the validation. This requires a valid System Code and Biz-Ops API key.`,
		id: 'writeToBizOps',
		optional: true,
	};

	props.content = (
		<span className="o-forms-input o-forms-input--radio-box o-forms-input--inline">
			<div className="o-forms-input--radio-box__container">
				<RadioButton
					id={props.id}
					label="Yes"
					value="yes"
					checked={writeToBizOps}
				/>
				<RadioButton
					id={props.id}
					label="No"
					value="no"
					checked={!writeToBizOps}
				/>
			</div>
		</span>
	);

	return <FormField {...props} />;
};

const RunbookEntry = ({ exampleContent, content }) => {
	const props = {
		title: 'Your RUNBOOK.MD',
		info: `Paste or type the content of your runbook here, in Markdown.`,
		id: 'runbookContent',
	};

	props.content = (
		<span className="o-forms-input o-forms-input--textarea">
			{' '}
			<textarea
				className="o-forms__textarea"
				name="content"
				id="content"
				rows="20"
				placeholder={exampleContent}
			>
				{content}
			</textarea>
		</span>
	);

	return <FormField {...props} />;
};

module.exports = {
	SystemCode,
	WriteFlag,
	ApiKey,
	RunbookEntry,
};
