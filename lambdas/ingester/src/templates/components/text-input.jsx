const { h } = require('hyperons');

exports.TextInput = ({ name, value }) => (
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
