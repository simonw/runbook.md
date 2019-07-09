const drawDiagram = require('../lib/draw-diagram');
require('./main.scss');

const initDiagram = () => {
	const graphvizParams = [
		'node [shape=box style=filled fillcolor=white]',
		'rankdir=TB',
		'compound=true',
		'form [',
		'	label="RUNBOOK.md\\n form"',
		'	fillcolor=pink href="#form"',
		']',
		'github_app [',
		'	label="GitHub PR\\nwebhook"',
		'	fillcolor=moccasin',
		'	href="#github-app"',
		']',
		'changeapi [',
		'	label="Ingest Change API\\nkinesis event"',
		'	fillcolor=olivedrab1',
		'	href="#changeapi"',
		']',
		'file [',
		'	label="RUNBOOK.md file\\nread from repo"',
		'	fillcolor="moccasin:olivedrab1"',
		'	href="#structure"',
		']',
		'parser [',
		'	label="RUNBOOK.md\\nparser"',
		'	href="#parser"',
		']',
		'validator [',
		'	label="RUNBOOK.md\\nRelated code validator"',
		'	href="#validator"',
		']',
		'scoring [',
		'	label="SOS scoring"',
		'	href="#scoring"',
		']',
		'content [',
		'	label="RUNBOOK.md content"',
		'	fillcolor=pink',
		'	href="#structure"',
		']',
		'ui_feedback [',
		'	label="UI Feedback"',
		'	fillcolor=pink',
		'	href="#errors"',
		']',
		'auto_feedback [',
		'	label="Automated\\nfeedback on\\nPR/code change"',
		'	fillcolor="moccasin:olivedrab1"',
		'	href="#errors"',
		']',
		'ui_save [',
		'	label="Optional save to Biz Ops"',
		'	fillcolor=pink',
		'	href="#save"',
		']',
		'pr_save [',
		'	label="Save to Biz Ops if\\nproduction release"',
		'	fillcolor="moccasin:olivedrab1"',
		'	href="#save"',
		']',
		'content -> parser [lhead=cluster_pvs]',
		'github_app -> file',
		'changeapi -> file',
		'file -> scoring [lhead=cluster_pvs]',
		'form -> content',
		'subgraph cluster_pvs {',
		'	label="RUNBOOK.md processing"',
		'	style=filled',
		'	fillcolor=mediumpurple1 {',
		'		rank=same',
		'		parser -> validator -> scoring',
		'	}',
		'}',
		'parser -> ui_feedback [ltail=cluster_pvs]',
		'ui_feedback -> ui_save',
		'scoring -> auto_feedback [ltail=cluster_pvs]',
		'auto_feedback -> pr_save',
	];
	// eslint-disable-next-line no-undef
	drawDiagram(document, 'flow', graphvizParams);
};

initDiagram();
const formHandler = require('./components/manualEntryForm');

// eslint-disable-next-line no-undef
const manualEntryForm = document.querySelector('#manualRunbookEntry');
if (manualEntryForm) {
	formHandler(manualEntryForm);
}
