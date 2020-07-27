(()=>{

const preFuncTable = [
	{
		'funcName':'urlencode',
		'code':
`//xurlencode is a built-in api,
//which can do x-www-urlencode properly,for more detail see source code at github
return xurlencode(s);`
	},
	{
		'funcName':'b64decode',
		'code':
`return window.atob(s);`
	},
	{
		'funcName':'b64encode',
		'code':
`return window.btoa(s);`
	}
];
function setExampleCode(){
	var exampleCode=
`/*Function defined here accept a string selected by mouse,and return a string to the same place.
*It will be called when you click the corresponding button.
*With this,You can do encoding decoding,insert unprintable characters,or even treat "s" as many parameters and write more complex code
*In fact,You can also call global functions inside the extension as API,and do whatever you want.
*Here,i simply do a hex converting*/
return "0x"+s.split('').map(ch=>{
	return ch.charCodeAt(0).toString(16).padStart(2,"0");
}).join('');`;
	d("funcName").value="ExampleFunc";
	d("code").value=exampleCode;
}

async function loadPreSetFuncBtn(){
	let nameTable={[funcNames]:[]};
	for(i of preFuncTable){
		let funcName=funcPre+i['funcName'];
		nameTable[funcNames].push(funcName);
		await browser.storage.local.set({[funcName]:i['code']}).then(()=>{
			addFunc(i['funcName'],funcName);
		});
	}
	return browser.storage.local.set(nameTable);
}
function initPacketKey(){
	return browser.storage.local.set({"packKeys":[]});
}
browser.storage.local.get("OldUser").then(i=>{
	if(i.OldUser){
		browser.runtime.sendMessage({type:"start"});
		return;
	}else{
		browser.storage.local.set({"OldUser":1});
		setExampleCode();
		initPacketKey().then(loadPreSetFuncBtn).then(()=>{
			browser.runtime.sendMessage({type:"start"});
			setStatus("Hello,new guy!:D",4000);
		});
	}
}).catch(e=>{
	console.error(e);	
});


})();
