import { stateValue } from "../State/State";
import { showInformation } from "./information";

let class_to_div = {
    Characteristic : function(object){
		return charaToDiv(object)
	}
}

//将一个对象转化为一个div结构，根据对象的类有不同的div结构
//当type==num时，还会在div中显示对应object的数量
export function objectToDiv(object, method) {
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
	if(object.type != "object"){
		return $(`<div>${object}</div>`)
	}
    let object_div = 
	$( `<div class='object'>
			<span class='object_click object_name'>${stateValue(object, "名称")}</span>
		</div>`);
	//对象的名称绑定对象本身
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

