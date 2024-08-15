import _ from "lodash";

import { State, getStateUnit } from "./../State/State";
import { objectArrayToDiv } from "./../Tiles/bugGroupTile";
import { objectToDiv } from "./objectDiv";

//将一个【对象object】的【属性state】转化为显示在Tile中的tile_data
export function objectStateToTileData(object) {
    const tile_data = $("<div></div>");
    $(tile_data).appendStateDiv(object, object.属性);
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
let stateName_to_stateValueDiv = {
    虫群 : function(state_object){
        return objectArrayToDiv(state_object["字典"])
    },
    设施 : function(state_object){
        return objectArrayToDiv(state_object["字典"])
    },
    所处 : function(state_object){
        return createStateValueDiv(state_object,null,["object","block"])
    },
    所属 : function(state_object){
        return createStateValueDiv(state_object,null,["object","block"])
    },
    特性 : function(state_object){
        return createStateValueDiv(state_object,null,["object","inline"])
    },
    词条 : function(state_object){
        return createStateValueDiv(state_object,null,["entry","inline"])
    }
}

//将属性对象转换为div并返回
export function stateToDiv(object,state_name,state_object){
    //要求属性对象必须存在
    if(!state_object){
        console.error("属性对象不存在：",object,state_name,state_object)
        return false
    }
    //制作属性值div
    let stateValue_div
    //根据属性名映射表获得对应的变换函数，并处理属性值获得属性值div
    if(stateName_to_stateValueDiv[state_name]){
        let stateValue_func = stateName_to_stateValueDiv[state_name]
        stateValue_div = stateValue_func(state_object,object)
    }
    //在映射表中没有变换函数的情况下，则按照属性类型通过函数获取对应的属性值div
    else{
        //获得对应的函数值div
        stateValue_div = createStateValueDiv(state_object,object)
    }
    //制作一个属性div
    let state_div = $("<div>", { class: "state flex"});
    //属性名div
    const stateName_div = $(`<div>${state_name}：</div>`);
    //为属性值添加对应的单位
    const unit = getStateUnit(object,state_name)
    if (unit) {
        $(stateValue_div).append(`<span>${unit}</span>`);
    }

    $(state_div).append(stateName_div, stateValue_div);
    return state_div
}


export function createStateValueDiv(state_object, object, pre_type) {
    
    // 表示该属性的值将会以什么方式显示
    // 一行一行的：block，全部放在行内的：inline，字典：dic，无：none
    let stateValueDiv_type 
    // 属性值的类型，可以预定义，否则与属性本身相同
    let stateValue_type
    
    //根据属性对象的类型，获取属性值和默认的属性值Div类型
    let state_value
    const state_type = state_object["类型"]
    switch(state_type){
        case "数值":
            // 如果这个属性的类型为“数值”，将以block形式放置，数值将会换行
            state_value = state_object["数值"]
            stateValueDiv_type = "block";
            break
        case "数组":
            // 如果这个属性的类型为“数组”，将以inline形式放置，内部的元素会堆叠在同一行
            state_value = state_object["数组"]
            stateValueDiv_type = "inline";
            break;
        case "字典":
            // 如果这个属性的类型为“字典”，将其以dic形式递归放置，将object传入作为参数
            state_value = state_object["字典"]
            //特殊地，如果其中的字典子值包含max或min，则会将子属性中的值放置在同一行中
            if(_.has(state_object["字典"],"max") || _.has(state_object["字典"],"min")){
                stateValueDiv_type = "block";
            }
            else{
                stateValueDiv_type = "dic"
            }
            break;
        default:
            // 以上情况都不是的情况下，则默认不显示这个属性的值
            stateValueDiv_type = ["none"]
            break;
    }

    // 如果提供预定义的type类型，则读取并覆盖之前的值
    if(pre_type){
        stateValue_type = pre_type[0]
        stateValueDiv_type = pre_type[1]
    }
    // 否则属性值类型与属性类型相同
    else{
        stateValue_type = state_type
    }
    

	//如果是空数组or空字典 or Null
	if (_.isEmpty(state_value) && !_.isNumber(state_value)) {
		return "无";
	}

    //生成 属性值div
    let stateValue_div = $("<div></div>");
	//根据type设定其value_div的内容
	switch (stateValueDiv_type) {
		// block按块分行显示属性值
		case "block":
			stateValue_div.createStateValueBlock(state_value, stateValue_type);
			break;
		// inline在同一行显示属性值
		case "inline":
			stateValue_div.createStateValueInline(state_value, stateValue_type);
			break;
		// dic递归字典内容，其中第一个参数会使用这个对象本身用于递归，第二个参数则是其中的字典
		case "dic":
            stateValue_div.appendStateDiv(object,state_value);
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
$.fn.createStateValueBlock = function(value, type = "数值") {
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
    if (type == "object_num") {
        $(this).arrayObject(value,"num")
    }
    //没有数量的对象div
    else if (type == "object") {
        $(this).arrayObject(value)
    }
    //字典类，将其中的元素排在一行
    else if(type == "字典"){
        //如果这个属性值内部有min, now, max则分别按顺序排列
        if(_.has(value,"min") || _.has(value,"now") || _.has(value,"max")){
            let min = value.min!=null? value.min.数值+"/":""
            let now = value.now!=null? value.now.数值+"/":""
            let max = value.max!=null? value.max.数值:"" 
            $(this).html(min + now + max)
        }
    }
    //默认的“数值”
    else if(type == "数值"){
        //直接在其中显示数值
        $(this).html(value)
    }
}
//创建同一行中的属性值div，要求传入的data必须是一个数组结构
$.fn.createStateValueInline = function(data, type) {
    if(!_.isArray(data)){
        return false
    }

    //将容器设定为flex，使得内部元素在同一行中
    $(this).addClass("flex")
    //词条div
    if(type == "entry") {
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