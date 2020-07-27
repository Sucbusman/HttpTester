(()=>{

const urlencode='application/x-www-form-urlencoded';
const multipart='multipart/form-data;'
const port = browser.runtime.connect({name:"content-script"});
const getForm=(url,body)=>{
	let form = document.createElement("form");
	form.enctype=urlencode;
	form.method="POST";
	form.action=url;
	form.style.display = "none";
	body.forEach(field=>{
		let input = document.createElement("input");
		input.name = field.name;
		input.value = field.value;
		form.appendChild(input);
	});
	return form;
}
const splitXhrResponse=(text)=>{
	let htmlMatch = text.match(/^<html>([\s\S]*)<\/html>$/i);
	let html=htmlMatch?htmlMatch[1]:text;
	let headMatch=html.match(/<head>([\s\S]*)<\/head>/i);
	let bodyMatch=html.match(/<body>([\s\S]*)<\/body>/i);
	let head=headMatch?headMatch[1]:"";
	let body=bodyMatch?bodyMatch[1]:html.replace(head,"");
	return 	{head:head,body:body};
}
const setStatus=(text,time)=>{
	port.postMessage({type:"status",text:text,time:time});
}
const setView=(domId,content)=>{
	port.postMessage({type:"view",domId:domId,content:content});
}
const handleMessage=(m)=>{
	port.onMessage.removeListener(handleMessage);//use once
	if(m.enctype==urlencode){
		let response = "Send:)";
			try{
				let form = getForm(
					m.url,
					m.postdata
				);
				document.body.appendChild(form);
				form.submit();
				let code=document.getElementsByTagName('html')[0].innerHTML;//clean view
				setView("responseBody",code);
			}catch(err){
				response = err.toString()+":(";
			}finally{
				setStatus(response,2000);
			}
	}else{
		let xhr=new XMLHttpRequest();
			xhr.onreadystatechange=()=>{
				switch (xhr.readyState){
					case 1:
						setStatus("ing.  |");
						break;
					case 2:
						setStatus("ing.. /");
						break;
					case 3:
						setStatus("ing.  \\");
						break;
					case 4:
						if(xhr.status===200){
							setStatus("Send:P",2000);
						}else{
							setStatus(`${xhr.status}:(`);
						}
						let {head,body} = splitXhrResponse(xhr.responseText);
						document.body.innerHTML = body;
						document.head.innerHTML = head;
						setView("responseBody",xhr.responseText);
						try{
							//when same origin
							history.replaceState(null,"",m.url);//!change url bar
						}catch(e){
							setStatus(e.toString()+":(");
						}
						break;
				}
			};
			xhr.open("post",m.url);
			xhr.send(m.postdata);
	}
}
port.onMessage.addListener(handleMessage);

})();
