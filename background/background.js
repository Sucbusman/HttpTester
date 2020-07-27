var ModHead = null;
var panelPort=null;
var contentPort=null;

function setStatus(text,time){
	panelPort.postMessage({type:"status",text:text,time:time});
}
function setView(domId,content){
	panelPort.postMessage({type:"view",domId:domId,content:content});
}
function addWhenNotHas(base,addition,name){
	let has=false;
	for(i of base){
		if(i.name==name){
			has=true;
			break;
		}
	}
	if(!has){
		for(i of addition){
			if(i.name==name){
				base.push({name:name,value:i.value});
			}
		}
	}
	return base;
}
function rewritePacket(e){
	browser.webRequest.onBeforeSendHeaders.removeListener(rewritePacket);
	var headerArray=e.requestHeaders;
	if(ModHead){
		headerArray=addWhenNotHas(ModHead,headerArray,"Content-Length");
	}
	return {requestHeaders:headerArray};
}
function onErrorOccurred(e){
	setStatus(e.toString());
}
function onCompleted(e){
	browser.webRequest.onCompleted.removeListener(onCompleted);
	browser.webRequest.onErrorOccurred.removeListener(onErrorOccurred);
	setView("responseHeader",e.responseHeaders);
}
function startListener(){
	browser.webRequest.onErrorOccurred.addListener(
		onErrorOccurred,
		{urls:["<all_urls>"]}
	);
	browser.webRequest.onBeforeSendHeaders.addListener(
		rewritePacket,
		{urls:["<all_urls>"]},
		["blocking","requestHeaders"]
	);
	browser.webRequest.onCompleted.addListener(
		onCompleted,
		{urls:["<all_urls>"]},
		["responseHeaders"]
	)
}
function download(m){
	let filename=m.filename;
	let codetxt=m.codetxt;
	const blob = new Blob([codetxt], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		browser.downloads.download({ url, saveAs: true, filename })
			.then(i=>{
				console.log(i);
				setStatus(":) file downloaded",2000);
			})
			.catch(e=>{
				console.log(e);
				setStatus(":( download fail",2000);
			});
}
function onPanelMessage(request){
	switch (request.type){
		case "exec":
			startListener(request.tabId);
			let method = request.method;
			ModHead = request.head;
			if(method=="GET"){
				let code = `location.href="${request.url}"`;
				browser.tabs.executeScript(request.tabId,{
					code:code
				}).then(()=>{
					setStatus("Send:)",2000);
				}).catch(e=>{
					console.log("at background.js case exec",e);
					if(e.toString()=="Missing host permission for the tab"){
						setStatus("no permission to exec script in browser private page,access a website manually first");
					}
				});
			}else if(method=="POST"){
				browser.tabs.executeScript(request.tabId,{
					file:"/contentScripts/post.js"
				}).then(()=>{
					contentPort.postMessage({
						"enctype":request.enctype,
						"url":request.url,
						"postdata":request.postdata
					});
					console.log(request.postdata);
				}).catch(e=>{
						console.error("content script send error",e);
						if(e.toString()=="Missing host permission for the tab"){
							setStatus("no permission to exec script in browser private page,access a website manually first");
						}
				});
			}else{
				console.error("in background.js case exec,unknown method",method);
			}
			break;
		case "downloadGenCode":
			download(request);
			break;
		default:
			console.error("background.js case wrong!",request.type);
			break;
	}
}

function onContentMessage(m){
	switch(m.type){
		case "status":
			setStatus(m.text,m.time);
			break;
		case "view":
			setView(m.domId,m.content);
			break;
		case "reload":
			panelPort.postMessage(m);
			break;
		default:
			console.error("unkown type in background.js onContentMessage");
			console.error(m);
			break;
	}
}

function onOtherMessage(m){
	switch(m.type){
		case "shown":
			//panelPort.postMessage(m);
			console.log("shown:",Date());
			break;
		case "start":
			panelPort.postMessage(m);
			break;
		case "hidden":
			break;
	}
}

function initPort(p){
	if(p.name=='devpavel'){
		panelPort=p;
		panelPort.onMessage.addListener(onPanelMessage);
	}else if(p.name=='content-script'){
		contentPort=p;
		contentPort.onMessage.addListener(onContentMessage);
	}else{
		console.error(p);
	}
}

browser.runtime.onMessage.addListener(onOtherMessage);
browser.runtime.onConnect.addListener(initPort);
