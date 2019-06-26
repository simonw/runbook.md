const { h } = require('hyperons');

exports.RadioButton = ({ id, value, label, checked }) => (
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
