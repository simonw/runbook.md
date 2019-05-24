const { h } = require('hyperons');

const SystemCode = ({ systemCode }) => (
	<div className="validation-code">
		<label className="o-forms__label" htmlFor="systemCode">
			The System Code
		</label>
		<description className="description-text o-forms__additional-info">
			The code of the system to which the RUNBOOK.MD is associated.
		</description>
		<input
			type="text"
			className="o-forms__text"
			name="systemCode"
			id="systemCode"
			value={systemCode}
		/>
	</div>
);

const WriteFlag = ({ writeToBizOps }) => (
	<div className="validation-write">
		<label className="o-forms__label" htmlFor="writeToBizOps">
			Write to BizOps?
		</label>
		<description className="description-text o-forms__additional-info">
			Choose Yes to have the results written into biz-ops; default in No.
		</description>
		<select
			name="writeToBizOps"
			id="writeToBizOps"
			className="o-forms__select"
		>
			<option
				value={false}
				selected={writeToBizOps === false ? 'selected' : null}
			>
				No
			</option>
			<option value selected={writeToBizOps === true ? 'selected' : null}>
				Yes
			</option>
		</select>
	</div>
);

const ApiKey = ({ bizOpsApiKey }) => (
	<div className="validation-key">
		<label className="o-forms__label" htmlFor="bizOpsApiKey">
			Your Biz Ops API Key
		</label>
		<description className="description-text o-forms__additional-info">
			The Api Key to be used to read/write to Biz Ops.
			<br />
			<br />
		</description>
		<input
			type="text"
			className="o-forms__text"
			name="bizOpsApiKey"
			id="bizOpsApiKey"
			value={bizOpsApiKey}
		/>
	</div>
);

const RunbookMd = ({ exampleContent, content }) => (
	<div className="validation-content">
		<label className="o-forms__label" htmlFor="content">
			The RUNBOOK.MD Content.
		</label>
		<description className="description-text o-forms__additional-info">
			The text from RUNBOOK.MD.
		</description>
		<textarea
			className="o-forms__textarea"
			name="content"
			id="content"
			rows="20"
			placeholder={exampleContent}
		>
			{content}
		</textarea>
	</div>
);

module.exports = {
	SystemCode,
	WriteFlag,
	ApiKey,
	RunbookMd,
};
