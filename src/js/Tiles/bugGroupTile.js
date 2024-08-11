import { createTile, dataTile } from "../Modules/tile/tile";
import { stateValue } from "../State/State";
import { objectToDiv } from "../Modules/objectDiv";
import { bindSlide } from "../Modules/tile/tileButton";
import "../../css/Tiles/bugGroup.css"
import 'gridmanager/index.css';
import GridManager from 'gridmanager';

let bugGroupGridCol = [
	{key : "名称", text : "名称"},
	{key : "数量", text : "数量"},
	{key : "生命", text : "生命"},
	{key : "寿命", text : "寿命"},
	{key : "工作", text : "工作"},
	{key : "攻击", text : "攻击"},
	{key : "防御", text : "防御"},
]

//创建一个虫群Tile,以表格形式显示虫巢中的虫群状态
export function createBugGroupTile(bugNest){
	const ability = {
		关闭 : "cube",
		对象 : bugNest
	}
	const inner = $(`<table id="bugGroupTileGrid"></table>`)
	const tile = createTile("虫群",inner,ability)
	//使用gridManager构造该表格
	document.querySelector('#bugGroupTileGrid').GM({
		gridManagerName: 'bugGroupTileGrid',
		ajaxData:{data:[]},
		supportCheckbox: false,
		supportAutoOrder: false,
		supportAdjust: false,
		supportDrag: false,
		columnData: bugGroupGridCol,
		supportTreeData: true,
		treeConfig: {
			// 子节点关键字，默认为'children'
			treeKey: '子元素'
		}
	},function(){
		updateBugGroupTile(bugNest)
	});
}


//根据虫巢对象修改虫群Tile的数据显示
export function updateBugGroupTile(bugNest){
	//获取虫巢的虫群属性的值，并填装给grid
	const gridData = makeBugGroupGridData(stateValue(bugNest,"虫群"))
	const table = document.querySelector('#bugGroupTileGrid')
	//将数据填装给grid，同时使得bugObjects中的对象放入grid中
	GridManager.setAjaxData(table, gridData,function(){
		//然后将bugObjects依次放入“名称”列
		let bug_num = 0
		const tr = $("#bugGroupTileGrid").children("tbody").children("tr")
		tr.each(function(){
			const td = $(this).children('td[td-name="名称"]')
			if(td.text() == ""){
				const div = objectToDiv(bugObjects[bug_num])
				bug_num += 1
				$(td).append(div)
			}
		})
	});
	
}

//生成虫群表格所需要的数据
let bugObjects//存储参与形成虫群表格的虫群对象,用于在表格的首栏方式objectDiv对象
function makeBugGroupGridData(bugGroup){
	const gridData = []
	bugObjects = []
	//遍历虫群属性，获得表格每一行的数据
	for(let bugName in bugGroup){
		const bugs = bugGroup[bugName]
		if(bugs.length == 1){
			const bug = bugs[0]
			const line_data = createBugGroupGridLine(bug)
			gridData.push(line_data)
			bugObjects.push(bug)
		}
		//如果虫群对象数组中有多个单位，则生成一个可下滑显示细则单位的按键
		else{
			//获取同名虫群对象的总数，用于之后制作标题div
			let bugNum_all = 0 
			//虫群子元素的容器
			let bugGroup_children = []
			for(let bug of bugs){
				bugNum_all += stateValue(bug,"数量")
				const line_data = createBugGroupGridLine(bug)
				bugGroup_children.push(line_data)
				bugObjects.push(bug)
			}
			//创建一个虫群对象的标题div，显示其总数，但不会显示细则的对象
			let line_data = {
				名称 : bugName,
				数量 : bugNum_all,
				子元素 : bugGroup_children
			}
			gridData.push(line_data)
		}
	}
	return {data : gridData}

	//通过虫群对象生成并填装对应的虫群行信息
	function createBugGroupGridLine(bug){
		const line_data = {
			数量 : stateValue(bug,"数量"),
			生命 : stateValue(bug,["生命","now"]) + "/" + stateValue(bug,["生命","max"]),
			寿命 : stateValue(bug,["寿命","now"]) + "/" + stateValue(bug,["寿命","max"]),
			工作 : stateValue(bug,"工作"),
			攻击 : stateValue(bug,"攻击"),
			防御 : stateValue(bug,"防御")
		}
		return line_data
	}
}


//将一个数组对象转换为虫群div
export function objectArrayToDiv(objectArray){
	//一个外壳
	let container = $(`<div class="objectArray"></div>`)
	//遍历数组对象属性
	for(let key in objectArray){
		//获得对象的数组,遍历数组，获得同名虫群单位的总数
		const objects = objectArray[key]
		//如果虫群数组的长度为1，则直接将这个对象的对象div放入容器
		if(objects.length == 1){
			const object = objects[0]
			const objectDiv = objectToDiv(object,"num")
			container.append(objectDiv)
		}
		//否则，遍历虫群数组，制作各个虫群对象的子div,这些子div放置在一个容器中，有一个共同的标题显示其总数，在点击标题时，可以展开或折叠子div
		else{
			//获取同名虫群对象的总数，用于之后制作标题div
			let objectNum_all = 0 
			//虫群子元素的容器
			const objectInner = $(`<div class='objectArray_inner'></div>`)
			for(let object of objects){
				objectNum_all += stateValue(object,"数量")
				const objectDiv = objectToDiv(object,"num")
				objectInner.append(objectDiv)
			}
			//创建一个虫群对象的标题div，显示其总数
			let objectTitle = $(`<div class="objectArray_title">${key} x ${objectNum_all}</div>`)
			//将它们绑定滑动控制关系
			bindSlide(objectTitle,objectInner,"down")
			const objectArray_div = $("<div></div>").append(objectTitle,objectInner)
			container.append(objectArray_div)
		}
	}
	return container
}