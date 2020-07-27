const funcNames='funcNames';
const funcPre = '_user_';
const packKeys = 'packKeys';
function setStatus(message,time){
	d("status").innerText=message;
	if(time){
		setTimeout(()=>{
			d("status").innerText=":|";
		},time);	
	}
}
function maskAdapt(){
	mask.style.height=document.body.scrollHeight;
	mask.style.width=document.body.scrollWidth;
}
function showPopup(){
	let mask=d("mask");
	maskAdapt();
	mask.style.display="block";
	d("popup").style.display="block";
}
function closePopup(){
	d("mask").style.display="none";
	d("popup").style.display="none";
}
function closePack(){
	let panel=d("pack");
	panel.style.width="1%";
	panel.style.backgroundColor="#E2711F";
	panel.style.opacity="0.5";
	for(let child of panel.children){
		child.style.display="none";
	}
}
function showPack(){
	let panel=d("pack");
	panel.style.width="30%";
	panel.style.backgroundColor="#03bdc6";
	panel.style.opacity="0.8";
	setTimeout(()=>{
		for(let child of panel.children){
			child.style.display="block";
		}
	},200);
}
function addFuncBtn(viewFuncName,funcName){
	let btn=c("button");
	btn.className="btn3";
	btn.innerText=viewFuncName;
	btn.name=funcName;
	d("userBtnField").appendChild(btn);
	return btn;
}
function cleanCode(){
	d("code").value="";
	d("code").innerText="";
	d("funcName").value="";
}
const progress=(()=>{
	var count = 0;
	function character(){
		let c=null;
		switch (count){
			case 0:
				c="|";
				break;
			case 1:
				c="/";
				break;
			case 2:
				c="一";
				break;
			case 3:
				c="\\";
				break;
		}
		count+=1;
		count%=4;
		return c;
	}
	return {character:character};
})();

function fixInsertChar(e){
	if(e.keyCode==222&&!e.shiftKey&&!e.ctrlKey){
		e.preventDefault();
		let me=e.target;
		let start=me.selectionStart;
		let end=me.selectionEnd;
		me.value=me.value.substring(0,start)+"'"+me.value.substring(end);
		me.selectionStart=end+1;
		me.selectionEnd=end+1;
	}else if(e.keyCode==191&&!e.shiftKey&&!e.ctrlKey){
		e.preventDefault();
		let me=e.target;
		let start=me.selectionStart;
		let end=me.selectionEnd;
		me.value=me.value.substring(0,start)+"/"+me.value.substring(end);
		me.selectionStart=end+1;
		me.selectionEnd=end+1;
	}
}

d("expand").addEventListener("click",()=>{
	d("view").style.display="block";
	d("expand").style.display="none";
});
d("view").addEventListener("click",(e)=>{
	let me=d("view");
	let rollup=d("rollup");
	if(isChrome){
		if(e.path[0]==me||e.path[0]==rollup){
			d("expand").style.display="block";
			me.style.display="none";
		}	
	}else if(isFirefox){
		if(e.target==me||e.target==rollup){
			d("expand").style.display="block";
			me.style.display="none";
		}
	}
});
const select=(()=>{
	var selectedObj=null;
	var funcHead="function userFunc(s){";
	var funcTail="};userFunc;";
	function listener(e){
		let me=e.target;
		let start=me.selectionStart;
		let end=me.selectionEnd;
		let text=me.value.substring(start,end);
		selectedObj={dom:me,text:text,start:start,end:end};
	}
	function apply(code){
		if(selectedObj){
			let obj=selectedObj;
			//remember now value for recover
			let evt=document.createEvent("HTMLEvents");
			evt.initEvent("remember",false,false);
			obj.dom.dispatchEvent(evt);
			//apply
			code=funcHead+code+funcTail;
			let s=eval(code)(obj.text);
			obj.dom.value=obj.dom.value.substring(0,obj.start)
				+s+obj.dom.value.substring(obj.end);
		}else{
			setStatus("select words first:(",2000);
		}
	}
	return {listener:listener,apply:apply};
})();
function zoomUrl(e){
	if(e.target.innerText=='↓'){
		e.target.innerText='↑';
		d("url").style.height="114px";
		d("postdata").style.height="10px";
		d("head").style.height="10px";
	}else{
		e.target.innerText='↓';
		d("url").style.height="24px";
		d("postdata").style.height="100px";
		d("head").style.height="100px";
	}
}

//add history support
const inputHistory=(()=>{
	let lastActive=null;
	function add(dom){
		let memory=[];
		let max=20;
		function forget(){
			if(memory.length>max){
				memory.shift();
			}
		}
		function remember(){
			memory.push(dom.value);
			forget();
			lastActive=dom;
		}
		function recall(){
			if(memory.length>0){
				middle=memory.pop();
				dom.value=middle;
			}
		}
		dom.addEventListener("focus",()=>{
			lastActive=dom;
		})
		dom.addEventListener("change",remember);
		dom.addEventListener("remember",remember);
		dom.addEventListener("recall",recall);
	}
	function recall(){
		if(lastActive){
			let evt=document.createEvent("HTMLEvents");
			evt.initEvent("recall",false,false);
			lastActive.dispatchEvent(evt);
		}
	}
	return {recall:recall,add:add};
})();
function withdraw(e){
	if(e.keyCode==90&&e.ctrlKey){//c-z
			e.preventDefault();
			inputHistory.recall();
	}
}
d("main").addEventListener("keydown",withdraw);
d("postdata").onmouseup=select.listener;
d("head").onmouseup=select.listener;
d("url").onmouseup=select.listener;
d("pack").addEventListener("click",showPack);
d("main").addEventListener("click",closePack);
d("responseHeader").onmouseup=select.listener;
d("responseBody").onmouseup=select.listener;
d("zoomUrl").addEventListener("click",zoomUrl);
d("mask").addEventListener("click",()=>{
	closePopup();
});
window.onresize=maskAdapt;
d("addfunc").addEventListener("click",()=>{
	showPopup();
});
d("popupOk").addEventListener("click",()=>{
	closePopup();
});
d("funcName").onkeydown=(e)=>{
	if(e.keyCode==13){//enter
		e.preventDefault();
		d("code").focus();
	}
}
d("code").addEventListener("keydown",(e)=>{
	if(e.keyCode==9){//tab
		e.preventDefault();
		var indent="\t";
		let code=d("code");
		let start=code.selectionStart;
		let end=code.selectionEnd;
		let selected=code.value.substring(start,end+1);
		selected=indent+selected.replace(/\n/g,"\n"+indent);
		code.value=code.value.substring(0,start)+selected
			+code.value.substring(end);
		code.setSelectionRange(start+indent.length,start+selected.length);
	}else if(e.keyCode==83&&e.ctrlKey){//ctrl-s short cut to save
		e.preventDefault();
		let clickEvt=document.createEvent("mouseEvent");
		clickEvt.initEvent("click",true,true);
		d("popupOk").dispatchEvent(clickEvt);
	}
});
var packFuncBtnSelectedColor="#f0d5c1";
function initPack(){
	closePack();
	d("repo").style.backgroundColor=packFuncBtnSelectedColor;
}
var functionsBar = ["repo","generator"];
for(let funcId of functionsBar){
	let funcBtn = d(funcId);
	let origBgColor = funcBtn.style.backgroundColor;
	let newBgColor = packFuncBtnSelectedColor;
	funcBtn.addEventListener("click",()=>{
		for(let f of functionsBar){
			d(f).style.backgroundColor=origBgColor;
			hide(d(f+"Panel"));
		}
		d(funcId).style.backgroundColor=newBgColor;
		show(d(funcId+"Panel"));
	});
}
//fix firefox 72 cant insert some character 
for(let i of ["url","code","postdata","head"]){
	d(i).addEventListener("keydown",fixInsertChar);
}
for(let i of ["url","postdata","head"]){
	inputHistory.add(d(i));
}
