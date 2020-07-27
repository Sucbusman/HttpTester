const userFuncCall=(e)=>{
	//firefox
	let btn=e.target;
	let funcName = btn.name;
	browser.storage.local.get(funcName)
		.then(i=>{
			let code=i[funcName];
			select.apply(code);
		})
		.catch(e=>{
			setStatus(":(user code err!"+e.toString(),2000);
		});
};
const addFunc=(viewFuncName,funcName)=>{
	if(getLeaves(d("userBtnField")).filter((i)=>i.name==funcName).length<1){
		let btn=addFuncBtn(viewFuncName,funcName);
		btn.addEventListener("click",userFuncCall);
		let cssText=`display:none;position:absolute;z-index:5;opacity:0.2;`;
cssText+=`color:#E7DD3B;background-color:#FFFFFF;width=20px;height=20px;`;
cssText+=`border-radius:10px;border-style:solid;border-color:#2A4C4C;`;
		addHoverBubble(btn,"X",cssText,(e)=>{
			d("userBtnField").removeChild(btn);
			browser.storage.local.remove(funcName);
			browser.storage.local.get(funcNames).then(i=>{
				let newarr=i[funcNames].filter(item=>item!==funcName);
				browser.storage.local.set({funcNames:newarr});
				document.body.removeChild(e.target);
			}).catch(e=>{
			setStatus(e.toString);
			});
		});
	}
};
const handdleError=(e)=>{
	setStatus(":( "+e.toString(),3000);
};
(()=>{

var port = browser.runtime.connect({name:"devpavel"});
var Packets = new Map();
var pCount=0;
var Url = d("url");
var ResponseHeader = d("responseHeader");
var ResponseBody = d("responseBody");
var Select = d('select');
var Head = d('head');
var Postdata = d('postdata');
var Method = d('method');


function har2rawhead(har){
	let ans="";
	har.forEach((item)=>{
		ans +=item.name+":"+item.value+"\n";
	});
	return ans;
}
function rawhead2har(raw){
	let ans=[];
	raw.trim().split("\n").forEach((item)=>{
		let name=item.split(":")[0].trim();
		let value=item.replace(name+":","").trim();
		ans.push({name:name,value:value});
	});
	return ans;
}
function har2json(har){
	let ans={};
	har.map(pair=>{
		ans[pair['name']]=pair['value'];
	});
	return ans;
}
function serialize(obj){
	if(typeof(obj)!=='string'){
		return JSON.stringify(obj,null,'\t');
	}
	return obj;
}

function load(){
	let key=Select.value;
	if(Packets.has(key)){
		let p=Packets.get(key);
		Head.value=har2rawhead(p['request']['headers']);
		Method.innerText=p['request']['method'];
		let req=p['request'];
		if(req['postData']){
			Postdata.value=serialize(req['postData']['text']);
		}
		Url.value=serialize(req['url']);	
	}else{
		setStatus("[!]There are no packet,access website with panel open and click 'packet' button to capture first",4000);
	}
}
function addPacket(key,pname,pdate){
	let repo=d("pRepo");
	let line=c('div');
	let p=c("li");
	let deleteBtn=c("button");
	deleteBtn.className="roundBtn2";
	deleteBtn.name=key;
	deleteBtn.innerText='x';
	deleteBtn.onclick=removePacket;
	p.className="pinfo";
	p.name=key;
	p.innerText=pname+" "+pdate;
	p.onclick=loadFromRepo;
	line.appendChild(deleteBtn);
	line.appendChild(p);
	repo.appendChild(line);
}
function removePacket(e){
	let me=e.target;
	let key=me.name;
	browser.storage.local.get(packKeys).then(i=>{
		let newarr=i[packKeys].filter(k=>k!==key);
		d("pRepo").removeChild(me.parentElement);
		browser.storage.local.set({packKeys:newarr}).then(()=>{
			browser.storage.local.remove(key).then(()=>{
				setStatus(":) Deleted",2000);
			})
		});
	}).catch(handdleError);
}
function loadFromRepo(e){
	let me=e.target;
	let key=me.name;
	console.log(me);
	browser.storage.local.get(key).then(i=>{
		i=i[key];
		Url.value=i['purl'];
		Method.innerText=i['pmethod'];
		Postdata.value=i['pdata'];
		Head.value=i['phead'];
		d("updateContentLen").checked=i['pA'];
		d("malform").checked=i['pS'];
	}).catch(handdleError);
}

function clearPacket(){
	Packets.clear();
	pCount = 0;
	Select.innerHTML="";
}
function getPacket(){
	browser.devtools.network.getHAR()
		.then((packets)=>{
			let hasNewPacket = false;
			packets['entries'].forEach((i)=>{
				let key=i['startedDateTime'];
				if(!Packets.has(key)){
					hasNewPacket = true;
					let req=i['request'];
					Packets.set(key,{
						request:req,
						response:i['response']
					});
					let o = c('option');
					o.value=key;
					o.innerText=`No.${pCount} ${req['method']} ${req['url']}`;
					Select.appendChild(o);
					pCount+=1;
				}
			});
			if(hasNewPacket){
				let key=packets['entries'][0]['startedDateTime'];
				let r=Packets.get(key)['response'];
				let head=r['status']+' '+r['httpVersion']+'\n';
				head+=har2rawhead(r['headers']);
				ResponseHeader.value = head;
				let text='';
				if(r['content']['mimeType']){
					text+="Browser render MimeType="+r['content']['mimetype']+"\n========\n";
				}
				if(r['content']['text']){
					text+=r['content']['text'];
				}
				ResponseBody.value = text;
				Select.value=key;
				load();//load when succuss
				setStatus("loaded:)",1000);	
			}else{
				if(packets['entries'].length<1){
					setStatus("No packets in network cache now or not ready,wait a second or refresh page with this tool open and try again:(",10000);
				}
			}
		}).catch(()=>{
			setStatus("getHAR err",2000);
		});
}

function setFuncOption(){
	d("chooseFunc").innerHTML="";//clear option
	getLeaves(d("userBtnField")).forEach((btn)=>{
		let o=c("option");
		o.value=btn.name;
		o.innerText=btn.innerText;
		o.onclick=(e)=>{
			let funcName=e.target.value;
			let viewFuncName=e.target.innerText;
			console.log(funcName);
			if(funcName){
				browser.storage.local.get(funcName)
					.then(i=>{
						let code=i[funcName];
						d("funcName").value=viewFuncName;
						d("code").value=code;
					})
					.catch(e=>{
						setStatus(":(",2000);
						console.error(e);
					})	
			}
		};
		d("chooseFunc").appendChild(o);
	});
}

function addFuncWhenShown(){
	browser.storage.local.get(funcNames).then(i=>{
		for( funcName of i[funcNames]){
			let viewFuncName=funcName.slice(funcName.indexOf(funcPre)+funcPre.length);
			addFunc(viewFuncName,funcName);
		}
	});
}
function loadRepoWhenShown(){
	browser.storage.local.get(packKeys).then(i=>{
		for( let key of i[packKeys]){
			browser.storage.local.get(key).then(elem=>{
				let pname=elem[key]['pname'];
				let pdate=elem[key]['pdate'];
				addPacket(key,pname,pdate);
			})
		}
	})
}
function getHeadValueByName(head,name){
	for(i of head){
		if(i.name==name){
			return i.value;
		}
	}
	return '';
}
Method.addEventListener("click",()=>{
	if(Method.innerText=="GET"){
		Method.innerText="POST";
	}else{
		Method.innerText="GET";
	}
});

Select.addEventListener("change",(e)=>{
	let r=Packets.get(e.target.value)['response'];
	let head=r['status']+' '+r['httpVersion']+'\n';
	head+=har2rawhead(r['headers']);
	ResponseHeader.value = head;
	let text='';
	if(r['content']['mimeType']){
		text+="browser render mimeType="+r['content']['mimeType']+"\n========\n";
	}
	if(r['content']['text']){
		text+=r['content']['text'];
	}
	ResponseBody.value = text;
	load();
});

d('btnClear').addEventListener("click",()=>{
	clearPacket();
})
d('btnPacket').addEventListener("click",()=>{
	getPacket();	
});

d("btnExec").addEventListener("click",()=>{
	let method=Method.innerText;
	let head=rawhead2har(Head.value);
	if(head.length<1){
		setStatus("empty header!:(",4000);
		return;
	}
	let enctype=d("malform").checked?"":getHeadValueByName(head,"Content-Type");
	let url=Url.value;
	let postdata=postStruct(Postdata.value,enctype);
	if(d('updateContentLen').checked){
		head=head.filter(i=>i.name.toLowerCase()!='content-length');
	}
	let msg={
		type:"exec",
		tabId:browser.devtools.inspectedWindow.tabId,
		postdata:postdata,
		head:head,
		url:url,
		method:method,
		enctype:enctype
	};
	port.postMessage(msg);
});
d("popupOk").addEventListener("click",()=>{
	let viewFuncName=d("funcName").value;
	let funcName=funcPre+viewFuncName;
	let code=d("code").value;
	cleanCode();
	browser.storage.local.set({[funcName]:code})
		.then(()=>{
			browser.storage.local.get(funcNames).then(i=>{
				if(!i[funcNames]){
					i[funcNames]=[funcName];
				}else{
					i[funcNames].push(funcName);
				}
				browser.storage.local.set(i).then(()=>{
					addFunc(viewFuncName,funcName);
					setStatus("func save:D",2000);	
				})
			});
		})
		.catch(e=>{
			setStatus(e.toString()+':(',3000);
		})
});
d("addfunc").addEventListener("click",()=>{
	setFuncOption();
});
d("btnRepo").onclick=()=>{
	let pname=d("pName").value; 
	let purl=Url.value;
	let pdata=Postdata.value;
	let phead=head.value;
	let pA=d("updateContentLen").checked;
	let pS=d("malform").checked;
	let key="packet"+Date.parse(new Date());
	let pdate=(new Date).toLocaleString();
	let repo={
		pname:pname,
		pmethod:d("method").innerText,
		purl:purl,
		pdata:pdata,
		phead:phead,
		pA:pA,
		pS:pS,
		pdate:pdate
	};
	browser.storage.local.get('packKeys').then(i=>{
		if(!i[packKeys]){
			i[packKeys]=[key];
		}else{
			i[packKeys].push(key);
		}
		browser.storage.local.set(i).then(()=>{
			browser.storage.local.set({[key]:repo})
			.then(()=>{
				addPacket(key,pname,pdate);
				setStatus(":) packet saved",2000);
			});
		});
	}).catch(handdleError);
};
d("generator").addEventListener("click",()=>{
	//generate python code for current packet
	let pmethod=d("method").innerText;
	let purl=Url.value;
	let pdata=Postdata.value;
	let malformp=d("malform").checked;
	let har=rawhead2har(head.value);
	console.log(har);
	let pcookie=har2json(har.filter(e=>e['name']=="Cookie"));
	let phead=har2json(har.filter(e=>!e['name']!="Cookie"));
	let code=
`#!/bin/python
import requests
url = "${purl}"
headers = ${JSON.stringify(phead,null,4)}
cookies = ${JSON.stringify(pcookie,null,4)}
s = requests.Session()
`;
	let pshow=
`
ans = r.content.decode('utf-8')
print(ans)`;
	if(pmethod=='GET'){
		code+="r = s.get(url,cookies=cookies,headers=headers)";
	}else{
		//POST
		if(malformp){
			if(pdata!==""){
				code+=
`data = "${pdata}"
`
			}else{
				code+=
`data = ""
`
			}
		}else{
			if(pdata!==""){
				let struct=har2json(urlencodeStruct(pdata));
				code+=
`data = ${JSON.stringify(struct,null,4)}
`;
			}else{
				code+=
`data = {}
`
			}
		}
		code+="r = s.post(url,cookies=cookies,data=data,headers=headers)"
	}
	code+=pshow;
	d("generatorCode").value=code;
	setStatus(":) python code generated",2000);
});
d("downloadGenCode").addEventListener("click",()=>{
	let codetxt = d("generatorCode").value;
	let filename = "exp-"+((new Date).toLocaleString().split(",",1)[0].replace(/\//g,"-"))+".py";
	let msg={
		type:"downloadGenCode",
		filename,
		codetxt
	};
	port.postMessage(msg);
});
port.onMessage.addListener((m)=>{
	switch (m.type){
		case "status":
			setStatus(m.text,m.time);
			break;
		case "view":
			switch (m.domId){
				case "responseHeader":
					ResponseHeader.value=har2rawhead(m.content);
					break;
				case "responseBody":
					ResponseBody.value=m.content;
					break;
				default:
					console.error("unkown domId:",m.domId);
					break;
			}
			break;
		case "reload":
			browser.devtools.inspectedWindow.eval("location.reload()");
			break;
		case "start":
			closePack();
			initPack();
			addFuncWhenShown();
			loadRepoWhenShown();
			break;
		default:
			console.error("unknown type in panel.js",m.type);
			break;
	}	
});

})();
