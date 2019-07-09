const drawDiagram = (document, location, components) => {
	const newScript = document.createElement('script');
	const inlineScript = document.createTextNode(
		`d3.select('#${location}').graphviz().renderDot('digraph diagram {${components.join(
			' ',
		)}}')`,
	);
	newScript.append(inlineScript);
	document.querySelector(`#${location}`).append(newScript);
};

module.exports = drawDiagram;
