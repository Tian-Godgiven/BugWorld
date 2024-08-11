import { stateValue } from "../State/State";
import { showInformation } from "./information";

import "../../css/modules/objectDiv.css"

let class_to_div = {
    Characteristic : function(object){
		return charaToDiv(object)
	}
}

//将一个对象转化为一个div结构，根据对象的类有不同的div结构
//当type==num时，还会在div中显示对应object的数量
export function objectToDiv(object, method) {
	if(!object){
		console.log("对象异常，不存在，其具体值为："+object)
		return false
	}
    //根据传入的object的类，进行不同的处理
    const object_class = object.constructor.name
	let object_div
	if(class_to_div[object_class]){
		const func = class_to_div[object_class]
   		object_div = func(object)
	}
	else{
		object_div = commenToDiv(object)
	}

	$(object_div).addClass("object")

	// 显示对象的数量
	if (method == "num") {
		var num_div = $("<span>" + " x " + stateValue(object, "数量") + "</span>");
		$(object_div).append(num_div);
	}
	// 显示对象的等级
	if (method == "level") {
		const level = stateValue(object, "等级");
		if (level != "无") {
			const level_div = $("<span> lv." + level + "</span>");
			$(object_div).append(level_div);
		}
	}

	return object_div;
}

//点击object_click可以显示这个对象的信息
$("#main").on("click", ".object_click", function (event) {
	event.stopPropagation();
	const object = $(this).data("object");
	showInformation(object);
});

//处理通用object对象
function commenToDiv(object){
	//如果不是Object对象，也没有关系，直接使用object当做内容
	if(object.type != "object"){
		return $(`<div>${object}</div>`)
	}
	//否则制成常规object对象
    let object_div = 
		$( `<div>
			<span class='object_click object_name'>${stateValue(object, "名称")}</span>
		</div>`);
	//将对象绑定到object_div上
	$(object_div).children(".object_click").data("object", object);
    return object_div
}

//处理特性对象,用「」符号包裹
function charaToDiv(chara){
    let chara_div = $("<div>", {
        class: "object_click object_charateristic",
        text: "「" + stateValue(chara, "名称") + "」"
    });
    //绑定上去
    $(chara_div).data("object", chara);
    return chara_div
}

