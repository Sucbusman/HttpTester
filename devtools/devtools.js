function handleShown(){
	console.log("shown");
}

function handleHidden(){
	console.log("hidden");//debug
}

browser.devtools.panels.create(
	"HttpTester",//title
	'/icons/evil.svg',//icon
	'panel/panel.html'
).then((newPanel)=>{
	newPanel.onShown.addListener(handleShown);
	newPanel.onHidden.addListener(handleHidden);
});
