import _ from "lodash";
import { objectToDiv } from "../objectDiv";
import { State, getInformation, getUnit } from "../../State/State";
import { bugGroupToDiv } from "../../Tiles/bugGroupTile";

//将一个对象的【属性】转化为显示在Tile中的tile_data
export function stateToTileData(object) {
    const tile_data = $("<div></div>")
    $(tile_data).appendStateDiv(object,object.属性)
	return tile_data;
}

//为一个容器中添加对象的“属性”所产生的属性对象div
$.fn.appendStateDiv = function(object,states){
    // 遍历对象的“属性”,获得其中各个属性对象的属性名和属性值
	for (let name in states) {
        //不会显示【state属性对象】的“来源”属性
        if(states instanceof State){
            if(name == "来源"){
                continue;
            }
        }
        let value = states[name];
        const state_div = stateToDiv(object,name,value)
        //将属性div填装到引用这个函数的容器中
		$(this).append(state_div);
	}
}

//属性名-属性值div类型的映射表
let stateName_to_stateValue_div = {
    虫群 : function(state_value){
        return bugGroupToDiv(state_value)
    },
    设施 : function(state_value){
        return createStateValueDiv(state_value,["block","object_num"])
    },
    所属 : function(state_value){
        return createStateValueDiv(state_value,["block","object"])
    },
    特性 : function(state_value){
        return createStateValueDiv(state_value,["inline","object"])
    },
    词条 : function(state_value){
        return createStateValueDiv(state_value,["inline","entry"])
    },
    来源 : function(state_value){
        return createStateValueDiv(state_value,["inline","object"])
    },
    信息 : function(state_value,object){
        return $(`<div>${getInformation(object)}</div>`)
    }
}
//将属性对象转换为div并返回
export function stateToDiv(object,name,value){
    //制作属性值div
    let stateValue_div
    //根据属性名映射表获得对应的变换函数，并处理属性值获得属性值div
    if(stateName_to_stateValue_div[name]){
        let stateValue_func = stateName_to_stateValue_div[name]
        stateValue_div = stateValue_func(value,object)
    }
    //在映射表中没有变换函数的情况下，按照数据类型设置type，并通过函数获取对应的属性值div
    else{
        let types
        // 如果这个属性的值当中包含了“影响”则说明这个属性是一个“key-value”类型
        // 将其以block-value形式放置
        if (value && value.影响 != null) {
            types = ["block","value"];
        }
        // 如果这个属性的值当中没有“影响”，并且是一个数组，则说明这个属性是一个“key-array”类型
        // 将其以inline形式放置
        else if (_.isArray(value)) {
            types = ["inline"];
        }
        // 如果没有“影响”的同时，也不是一个数组，并且是一个字典，则说明其是一个“key-dictionary”类型
        // 将其以dic形式放置，将object传入作为参数
        else if (_.isObject(value)) {
            if(_.has(value,"max") || _.has(value,"min")){
                types = ["block","value"]
            }
            else{
                types = ["dic",object];
            }
        }
        // 以上情况都不是的情况下，则默认不显示这个属性的值
        else {
            types = ["none"]
        }
        //获得对应的函数值div
        stateValue_div = createStateValueDiv(value,types)
    }
    //制作一个属性div
    let state_div = $("<div>", { class: "state flex"});
    //属性名div
    const stateName_div = $(`<div>${name}：</div>`);
    //为属性值添加对应的单位
    const unit = getUnit(object,name)
    if (unit) {
        $(stateValue_div).append(`<span>${unit}</span>`);
    }

    $(state_div).append(stateName_div, stateValue_div);
    return state_div
}




// 其中type[0]为结构方式分为
// 一行一行的：block，全部放在行内的：inline，字典：dic，无：none
export function createStateValueDiv(value, types) {
	let stateValue_div = $("<div></div>");
	//如果是空数组or空字典or Null
	if (_.isEmpty(value) && !_.isNumber(value)) {
		return "无";
	}

	//根据type设定其value_div的内容
	switch (types[0]) {
		// block按块分行显示属性值
		case "block":
			stateValue_div.createStateValueBlock(value, types[1]);
			break;
		// inline在同一行显示属性值
		case "inline":
			stateValue_div.createStateValueInline(value, types[1]);
			break;
		// dic递归字典内容，其中types[1]是这个对象本身
		case "dic":
            stateValue_div.appendStateDiv(types[1],value);
			break;
        // none不显示属性值的内容
        case "none":
            stateValue_div.append("<span></span>")
		default:
			break;
	}

	return stateValue_div;
}

//按块分行显示的属性值div
$.fn.createStateValueBlock = function(data, type1 = "value") {
    //用于处理data当中的对象有多个或单个的通用函数
    $.fn.arrayObject = function(data,method){
        //如果是多个对象，则遍历
        if (data.length >= 1) {
            for (let object of data) {
                $(this).append(objectToDiv(object, method));
            }
        }
        // 否则直接使用
        else {
            $(this).append(objectToDiv(data, method));
        }
    }
    //带有数量的对象div
    if (type1 == "object_num") {
        $(this).arrayObject(data,"num")
    }
    //没有数量的对象div
    else if (type1 == "object") {
        $(this).arrayObject(data)
    }
    //默认的“值对象”
    else if(type1 == "value"){
        //如果这个属性值内部有min, now, max则分别按顺序排列
        if(_.has(data,"min") || _.has(data,"now") || _.has(data,"max")){
            let min = data.min!=null? data.min.数值+"/":""
            let now = data.now!=null? data.now.数值+"/":""
            let max = data.max!=null? data.max.数值:"" 
            $(this).html(min + now + max)
        }
        //否则直接显示其中的数值
        else {
            $(this).html(data.数值)
        }
    }
}
//创建同一行中的属性值div，要求传入的data必须是一个数组结构
$.fn.createStateValueInline = function(data, type1) {
    if(!_.isArray(data)){
        return false
    }

    //将容器设定为flex，使得内部元素在同一行中
    $(this).addClass("flex")
    //词条div
    if(type1 == "entry") {
        for (let entry of data) {
            var entry_span = $("<span>", { text: "[" + entry + "]" });
            $(this).append(entry_span);
        }
    }
    //对象div
    else{
        for (let object of data) {
            $(this).append(objectToDiv(object));
        }
    }
}

//清空一个Tile的data
export function clearTileData(tile){
    const tile_data = $(tile).children(".tile_data")
    if(tile_data.length != 0){
        tile_data.empty()
    }
}

