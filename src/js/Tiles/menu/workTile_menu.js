import { data } from "jquery"
import { getFreeBug, getOccupyBug } from "../../Object/Bug.js"
import { getFocusingBugNest } from "../../Object/BugNest.js"
import { getWorkObject, joinWork, resignWork, startWork} from "../../Object/Work.js"
import { objectToDiv, runObjectFunction } from "../../app/global_ability.js" 
import { haveEntry } from "../../State/Entry.js"
import { getState } from "../../State/State.js"

//点击一个工作栏弹出选择虫群对象的子页面
export function showWorkTileMenu(workTile_div){
	const work = $(workTile_div).data("work")
	//显示菜单,将菜单与work对象绑定
	$("#工作_menu").show().data({
		"work":work,
	})

	//更新workMenu中的内容
	updateWorkMenu(work)
}

//更新workMenu中的内容，向其中添加对应的work_div的信息
function updateWorkMenu(work){
	//清空
  	$("#工作_menu .tile_data").empty();

	//如果是“新增工作”，则work对象为空
	if(work == null){
		$("#工作_menu > .tile_name").text("新增工作")
		// 获取当前虫巢，遍历其中的“可进行工作”
		const bugNest = getFocusingBugNest()
		const 可进行工作 = bugNest.工作.可进行工作
		for( let work_key in 可进行工作){
			//获取对应的工作对象
			const work = getWorkObject(work_key)
			let data_div = $("<div class='data'></div>")
			//如果这个工作可以显示,则在其中显示它
			if(work.功能.显示 != false){
				//做成div加进子菜单中
				const addWorkMenu_div = createAddWorkMenuDiv(work)
				//将工作对象的索引存储进去，以便获取到对应的work对象
				$(addWorkMenu_div).attr("work_key",work_key)
				data_div.append(addWorkMenu_div)
			}
			$("#工作_menu .tile_data").append(data_div)
		}
	}
	//如果type为work
	else{
		$("#工作_menu > .tile_name").text("可参与")
		const work_name = getState(work,"名称")
		const bugNest = getState(work,"所属")
		const 虫群 = getState(bugNest,"虫群")
		//遍历虫群对象
		for(let i in 虫群){
			let bug = 虫群[i]
			//如果这个虫群对象可以参加这个工作，
			if(runObjectFunction(work,"需求",bug)){
				// 并且还有空余的,亦或者已经参加了这个工作时
				if(getFreeBug(bug) > 0 || getOccupyBug(bug,work_name) > 0){
					//生成这个虫群对象的参与信息,加入menu中
					$("#工作_menu .tile_data").append(createJoinWorkMenuDiv(bug,work))
				}
			}
		}
	}
}

//创建workTileMenu中的【参与工作对象】div
function createJoinWorkMenuDiv(bug,work){
	//获取信息
	var bug_name = getState(bug,"名称")
	//已参加这个工作的虫群单位的数量
	var work_num = getOccupyBug(bug,getState(work,"名称"))
	//可以参加该工作的单位数量
	var free_num = getFreeBug(bug)

	//容器，令其与bug对象绑定
	//如果没有能够加入这个工作的单位，则给参加赋disable
	//如果没有参加了这个工作的单位，则给退出赋disable
	var container = $(
		`<div class="workTile_menuDiv">
			<span class="object_name">${bug_name}</span> x 
			<input class="object_num workTile_menu_input" value="${work_num}">
			<span class="object_num workTile_menu_able">(可用：${free_num})</span>
			<div class="workTile_menu_count">
				<div class="workTile_menu_button workTile_menu_退出 ${work_num <= 0? "disable":null}">-</div>
				<div class="workTile_menu_button workTile_menu_参加 ${free_num <= 0? "disable":null}">+</div>
			</div>
		</div>`
	)

	//绑定对象块
	$(container).data("bug",bug)
	$(container).children(".object_name").data("object",bug)

	return container
}

//input功能
$("#main").on("input",".workTile_menu_input",function(){
	var work = $(this).parents('#工作_menu').data("work")
	var bug = $(this).parents('.workTile_menuDiv').data("bug")
	var value = $(this).val()

	var bug_num = getState(bug,"数量")
	var work_num = getOccupyBug(bug,work)
	//如果输入值小于0
	if(value < 0){
		$(this).val(0)
	}
	//如果输入值大于虫群数量
	if(value > bug_num){
		$(this).val(bug_num)
	}	
	//如果输入值大于已经加入这个工作的值，则令大于的部分参与工作
	const input_num = $(this).val()
	const join_num = input_num - work_num
	if(join_num > 0){
		joinWork(bug,join_num,work)
	}
	//如果小于，则令小于的部分退出工作
	else if(join_num < 0){
		resignWork(bug,-join_num,work)
	}
	// 更新这个menuDiv的内容
	const free_num = bug_num - input_num
	updateWorkMenuDiv($(this).siblings('.workTile_menu_count'),work_num,free_num)
})

//按键功能
	//[参加]键令1个该虫群对象加入工作，长按持续加入
	let interval_1
	let timeOut_1
	let hover_join_num//长按时间内，将要加入工作的虫群对象的数量
	$("#main").on("mousedown",".workTile_menu_参加:not(.disable)",function(){
		hover_join_num = 1

		//用于之后的计时器，里面不能用this
		const div = $(this)
		//获取数据
		const work = div.parents('#工作_menu').data("work")
		const bug = div.parents('.workTile_menuDiv').data("bug")

		//获取用于计算虫群数量的值，包括正在进行这个工作的虫群数量和空闲的虫群数量
		const work_name = getState(work,"名称")
		const work_num = getOccupyBug(bug,work_name)
		const free_num = getFreeBug(bug)

		//长按1秒后，开始计时
		timeOut_1 = setTimeout(function() {
			clearInterval(interval_1)
			interval_1 = setInterval(function() {
				// 每长按0.1秒，将要加入该工作的对象数量+1
				hover_join_num += 1
				//到达上限时停止
				if(free_num - hover_join_num <= 0){
					clearInterval(interval_1)
				}
				updateWorkMenuDiv(div.parent(),work_num+hover_join_num,free_num-hover_join_num)
			}, 100);
		}, 1000);

		//松开按键时，令这些bug加入对应的工作
		div.on("mouseup",function(){
			//令对应数量的bug对象加入对应的工作
			joinWork(bug,hover_join_num,work)
			//更新该对象所在的div
			updateWorkMenuDiv(div.parent(),work_num+hover_join_num,free_num-hover_join_num)
			//清除计时器
			clearTimeout(timeOut_1)
			clearInterval(interval_1)
			//清除本事件
			div.off("mouseup")
		});
	})
	
	//[退出]键令1个该虫群对象退出工作，长按持续退出
	let interval_2
	let timeOut_2
	let hover_resign_num
	$("#main").on("mousedown",".workTile_menu_退出:not(.disable)",function(){
		hover_resign_num = 1

		//用于之后的计时器，里面不能用this
		const div = $(this)
		//获取对象
		const work = div.parents('#工作_menu').data("work")
		const bug = div.parents('.workTile_menuDiv').data("bug")
		//获取获取
		const work_name = getState(work,"名称")
		const work_num = getOccupyBug(bug,work_name)
		const free_num = getFreeBug(bug)

		//长按1秒后，开始计时
		timeOut_2 = setTimeout(function() {
			clearInterval(interval_2)
			interval_2 = setInterval(function() {
				// 每长按0.1秒，将要退出该工作的对象数量+1
				hover_resign_num += 1
				//到达上限时停止
				if(work_num - hover_resign_num <= 0){
					clearInterval(interval_2)
				}
				updateWorkMenuDiv(div.parent(),work_num-hover_resign_num,free_num+hover_resign_num)
			}, 100);
		}, 1000);

		//松开按键时，令这些bug加入对应的工作
		div.on("mouseup",function(){
			//令对应数量的bug对象加入对应的工作
			resignWork(bug,hover_resign_num,work)
			//更新该对象所在的div
			updateWorkMenuDiv(div.parent(),work_num-hover_resign_num,free_num+hover_resign_num)
			//清除计时器
			clearTimeout(timeOut_2)
			clearInterval(interval_2)
			//清除本事件
			div.off("mouseup")
		});
	})

//更新workMenuDiv
function updateWorkMenuDiv(div,work_num,free_num){
	$(div).siblings('.workTile_menu_input').val(work_num)
	$(div).siblings('.workTile_menu_able').text("(可用：" + free_num + ")")
	//更新按键的类
	if(free_num <= 0){
		console.log("123")
		$(div).children('.workTile_menu_参加').addClass("disable")
	}else{
		$(div).children('.workTile_menu_参加').removeClass("disable")
	}

	if(work_num <= 0){
		$(div).children('.workTile_menu_退出').addClass("disable")
	}else{
		$(div).children('.workTile_menu_退出').removeClass("disable")
	}
}


//将work对象做成addWorkMenu的div
function createAddWorkMenuDiv(work){
	//内容包含工作量，工作需求，工作进度
	const workPower = "工作量：" + getState(work,"工作量")
	const need = "需求：" + getState(work,"需求")
	const 进度 = getState(work,"进度")
	let progress
	if(进度 == "无"){
		progress = "进度：无" 
	}
	else{
		progress = "进度：" + 进度.now + "/" + 进度.max + getUnit(work,"进度")
	}
	const object_div = objectToDiv(work)
	const addWorkMenu_div = $(`<div class="workTile_addMenuDiv">`)
		.append(object_div)
		.append(`<div class='state'>
					<div>${workPower}</div>
					<div>${need}</div>
					<span>${progress}</span>
				</div>`)		

	return addWorkMenu_div
}

//点击addWorkMenu中的div,为虫巢新增一个对应的工作
$("#main").on("click",".workTile_addMenuDiv",function(){
	const work_key = $(this).attr("work_key")
	const bugNest = getFocusingBugNest()
	//要求这个work_key在【虫巢】的“可进行工作”中
	if(_.has(bugNest.工作.可进行工作,work_key)){
		//通过work_key获取【工作对象】
		const work = getWorkObject(work_key)
		//在当前聚焦的【虫巢】中开始这个【工作】
		startWork(bugNest,work)
	}
	else{
		console.log("虫巢无法进行这个工作")
	}
})
