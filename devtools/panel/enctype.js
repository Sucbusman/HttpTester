const urlencode='application/x-www-form-urlencoded';
const multipart='multipart/form-data;'
const urlencodeStruct=(postdata)=>{
	//In this case,a formal packet will not contain non-ascii chracter
	//exept = &
	var ans=[];
	postdata.replace(/[\n\r]/g,'')
		.replace(/\+/g,' ')
			.split("&")
				.forEach(field=>{
					let [name,value]=field.split("=",2);
					ans.push({name:decodeURIComponent(name),value:decodeURIComponent(value)});
				});
	return ans;
}
const plainStruct=(postdata)=>{//use xhr
	return postdata;
}
const multipartStruct=(postdata,boundary)=>{//use xhr
	//boundary in HTTP data = "--"+boundary in HTTP header
	//The last boundary in data is ended with "--\r\n" commonly
	//but not a must
	let b=boundary.split('').filter(c=>c!='-').join('');
	let regBoundary = new RegExp("\\-+"+b+"[\\-\\n]+");
	let clrf="\r\n";
	return boundary+clrf+
	postdata.split(regBoundary).filter(i=>i!='').map(part=>
		part.mysplit("\n",3).join(clrf)
	).join("--"+boundary+"\r\n")+boundary+"--"+clrf;
}
const postStruct=(postdata,enctype)=>{
	if(enctype.startswith(multipart)){
		let boundary=enctype.mysplit(";",1)[1].mysplit("=",1)[1];
		return multipartStruct(postdata,boundary);
	}else if(enctype.startswith(urlencode)){
		return urlencodeStruct(postdata);
	}else{
		return plainStruct(postdata);
	}
}
