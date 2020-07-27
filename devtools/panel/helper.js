function d(domName){
	return document.getElementById(domName);
}
function c(domName){
	return document.createElement(domName);
}
function show(dom){
	dom.style.display="block";
}
function hide(dom){
	dom.style.display="none";
}
String.prototype.startswith=function(s){
	return this.indexOf(s)==0;
}
String.prototype.mysplit=function(s,times){
	if(typeof(times)!='number'){
		throw "The second parameter is not a number";
	}
	let ans=[];
	let splited=this.split(s);
	if(times>splited.length-1){
		times=splited.length-1;
	}
	for(var i=0;i<times;i++){
		ans.push(splited[i]);
	}
	ans.push(splited.slice(i).join(s));
	return ans;
}
function xurlencode(s){
	//x-www-urlencoded
	let exclude=new Map();
	for(let i=48;i<58;i++){//number
		exclude.set(String.fromCharCode(i),1);
	}
	for(let i=65;i<91;i++){//Uppercase
		exclude.set(String.fromCharCode(i),1);
	}
	for(let i=97;i<123;i++){//Lowercase
		exclude.set(String.fromCharCode(i),1);
	}
	for(ch of ["-","_","."]){
		exclude.set(ch,1);
	}
	return s.split('').map(ch=>{
		if(exclude.has(ch)){
			return ch;
		}else if(ch==' '){
			return '+';
		}
		return ch.charCodeAt(0).toString(16).padStart(3,"%0");
	}).join('');
}
var isFirefox=navigator.userAgent.toUpperCase().indexOf("Firefox")?true:false;
var isChrome = window.navigator.userAgent.indexOf("Chrome") !== -1;

function getLeaves(r)
{
	/*from root element find all leaves node recursively*/
	var doms = [];
	function recurse(ele)
	{
		if(ele.toString() === "[object HTMLCollection]")
		{
			//handle HTMLCollection case
			if(!ele.length)
			{
				doms.push(ele);
				console.log(ele);
				return;
			}
			else
			{
				var l = ele.length;
				for(var i=0;i<l;i++)
				{
					recurse(ele.item(i));
				}
			}
		}
		else 
		{
			//HTML obj case
			if(!ele.childElementCount)
			{
				doms.push(ele);
				//console.log(ele);//test
				return;	
			}
			for(var i=0;i<ele.childElementCount;i++)
			{
				recurse(ele.children[i]);
			}	
		}
	}
	recurse(r);
	return doms;
}
//fade animin
function fade(dom,duation,targetOpacity,interrupt=()=>false,finish=()=>false){
	duation=duation||1000;//1 second default
	if(targetOpacity==undefined){
		targetOpacity=1.0;
	}
	targetOpacity=parseFloat(targetOpacity);
	let tpf=40;//fps:25=>40ms time per fresh
	if(duation<tpf){
		duation=tpf;
	}
	let t=0;
	let tick=duation/tpf;
	let originOpacity=parseFloat(dom.style.opacity)||0;
	let delta=(targetOpacity-originOpacity)/tpf;
	let loop=setInterval(()=>{
		originOpacity+=delta;//float add
		t += tick;
		if(interrupt()){//check interrupt
			clearInterval(loop);
			finish();
		}else{
			dom.style.opacity=originOpacity;//float auto convert to string
			if(t>=duation){
				clearInterval(loop);
				finish();
			}	
		}
	},tpf);
}
//hover bubble
function addHoverBubble(dom,innerText,cssText,callback){
	let bubble = c("button");
	bubble.innerText=innerText;	
	bubble.style.cssText=cssText;
	bubble.onclick=callback;
	bubble.name=dom.name;
	document.body.appendChild(bubble);
	let xOffset=5;
	let yOffset=15;
	let leaveLock=false;//make sure only one animation played at a time
	let showLock=false;
	function bubbleLeave(){
		if(!leaveLock){
			leaveLock=true;
			setTimeout(()=>{
				if(showLock){
					leaveLock=false;
					return;
				}
				fade(bubble,200,0.1,()=>showLock,()=>{
					if(!showLock){
						bubble.style.display="none";
					}
					leaveLock=false;	
				});
			},300);	
		}
	}
	function bubbleShow(e){
		if(!showLock){
			showLock=true;
			let movement=0;
			function movementListener(e){
				movement+=e.movementX+e.movementY;
			}
			dom.addEventListener("mousemove",movementListener);
			setTimeout(()=>{
				if(leaveLock||movement>16){
					dom.removeEventListener("mousemove",movementListener);
					showLock=false;
					return;
				}
				dom.removeEventListener("mousemove",movementListener);
				bubble.style.left=e.pageX+xOffset;
				bubble.style.top=e.pageY+yOffset;
				bubble.style.display="inline";
				fade(bubble,200,1,()=>leaveLock,()=>{
					showLock=false;
				});
			},300);	
		}
	}
	dom.addEventListener("mouseover",bubbleShow);
	dom.addEventListener("mouseout",bubbleLeave);
	bubble.addEventListener("mouseover",()=>{
		bubbleShow({clientX:bubble.style.left-xOffset,clientY:bubble.style.top-yOffset});//hack,for the same position bubble
		bubble.style.setProperty("background-color","#DB661F");
	});
	bubble.addEventListener("mouseout",()=>{
		bubbleLeave();
		bubble.style.setProperty("background-color","#FFFFFF");
	});
}
