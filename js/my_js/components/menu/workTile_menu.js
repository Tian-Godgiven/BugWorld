//点击一个工作栏弹出选择虫群对象的子页面
$(document).on("click",".work_information:not(#addWork)",function(){
	var work = $(this).data("work")
	
	//显示菜单
	//令菜单与work对象绑定
	if(work == $("#work_menu").data("work")){
		$("#work_menu").toggle()
	}
	else{
		$("#work_menu").show()
	}
	$("#work_menu").data("work",work)
	$("#addWork_menu").hide()
	//更新workMenu中的内容
	updateWorkMenu(work)
})

//更新workMenu中的内容
function updateWorkMenu(work){
	//清空里面原本的内容
	$("#work_menu").find('*').each(function() {
	  	$(this).removeData();
	});
	$("#work_menu .tile_data").empty();

	var bugNest = getBugNest(work)

	var 参与 = getState(work,"参与")
	var 虫群 = getState(bugNest,"虫群")
	//参与中
	for(i in 参与){
		var bug = 参与[i]
		var container = createWorkMenuDiv(bug,work)
		//加入menu中
		$("#work_menu .tile_data").append(container)
	}

	//可参与
	for(i in 虫群){
		var bug = 虫群[i]
		//如果这个对象可以参加这个工作，并且目前没有参加这个工作，并且也没有完全参加同类型的工作时
		if(ableToWork(bug,work) && !haveWork(bug,work) && !haveAllTypeWork(bug,work)){
			var container = createWorkMenuDiv(bug,work)
			//加入menu中
			$("#work_menu .tile_data").append(container)
		}
	}
}

//创建workMenu中的各个div
function createWorkMenuDiv(bug,work){
	//获取信息
	var name = getState(bug,"名称")
	var work_num = getWorkNum(bug,work)
	//可以参加该工作的单位数量
	var free_num = ableWorkNum(bug,work)

	//容器，令其与bug对象绑定
	var container = $("<div>",{class:"work_menu_information"})
	$(container).data("bug",bug)

	//虫群对象
	var name_div = $("<span>",{
		class:"object_name",
		text:name
	})
	$(name_div).data("object",bug)

	var num_div = $("<input>",{
		class:"object_num work_menu_input",
		value:getWorkNum(bug,work)
	})

	var able_div = $("<span>",{
		id:"work_menu_able",
		class:"object_num",
		text:"(可用：" + free_num + ")"
 	})

	$(container).append(name_div);
	name_div.after(" x ");
	$(container).append(num_div);
	$(container).append(able_div);
	
	//按键
	var button_container = $("<div>",{class:"work_menu_count"})
	var button_退出 = $("<div>",{class:"work_menu_button",id:"work_menu_退出",text:"-"})
	var button_参加 = $("<div>",{class:"work_menu_button",id:"work_menu_参加",text:"+"})
	//修改按键样式
	//如果没有能够加入这个工作的单位，则给参加赋disable
	if(free_num <= 0){
		$(button_参加).addClass("disable")
	}
	//如果没有参加了这个工作的单位，则给退出赋disable
	if(work_num <=0){
		$(button_退出).addClass("disable")
	}

	$(button_container).append(button_退出,button_参加)
	$(container).append(button_container)

	return container
}

//input功能
$(document).on("input",".work_menu_input",function(){
	var work = $(this).parents('#work_menu').data("work")
	var bug = $(this).parents('.work_menu_information').data("bug")
	var value = $(this).val()

	var bug_num = getState(bug,"数量")
	var work_num = getWorkNum(bug,work)
	//如果输入值小于0
	if(value < 0){
		$(this).val(0)
	}
	//如果输入值大于虫群数量
	if(value > bug_num){
		$(this).val(bug_num)
	}	
	//如果输入值大于已经加入这个工作的值，则令大于的部分参与工作
	var join_num = $(this).val() - work_num
	if(join_num > 0){
		joinWork(bug,join_num,work)
	}
	//如果小于0，则令小于的部分退出工作
	else if(join_num < 0){
		resignWork(bug,-join_num,work)
	}

	updateWorkMenuDiv($(this).siblings('.work_menu_count'),bug,work)
})

//按键功能
//[参加]键令1个该虫群对象加入工作，长按持续加入
var interval_1
var timeOut_1
$(document).on("mousedown","#work_menu_参加:not(.disable)",function(){
	var div = $(this)
	var work = div.parents('#work_menu').data("work")
	var bug = div.parents('.work_menu_information').data("bug")
	//令bug对象加入工作
	joinWork(bug,1,work)
	//更新该对象所在的div
	updateWorkMenuDiv(div.parent(),bug,work)

	timeOut_1 = setTimeout(function() {
		clearInterval(interval_1)
      	interval_1 = setInterval(function() {
        	joinWork(bug,1,work)
        	updateWorkMenuDiv(div.parent(),bug,work)
      	}, 100);
    }, 1000);
})
$(document).on("mouseup","#work_menu_参加",function(){
	clearTimeout(timeOut_1)
	clearInterval(interval_1)
});

//[退出]键令1个该虫群对象退出工作，长按持续推出
var interval_2
var timeOut_2
$(document).on("mousedown","#work_menu_退出:not(.disable)",function(){
	var div = $(this)
	var work = div.parents('#work_menu').data("work")
	var bug = div.parents('.work_menu_information').data("bug")
	//令bug对象退出工作
	resignWork(bug,1,work)
	//更新该对象所在的div
	updateWorkMenuDiv(div.parent(),bug,work)

	timeOut_2 = setTimeout(function() {
		clearInterval(interval_2)
      	interval_2 = setInterval(function() {
        	resignWork(bug,1,work)
    		updateWorkMenuDiv(div.parent(),bug,work)
      	}, 100);
    }, 1000);
})
$(document).on("mouseup","#work_menu_退出",function(){
  	clearTimeout(timeOut_2)
	clearInterval(interval_2)
});

//更新workMenuDiv
function updateWorkMenuDiv(div,bug,work){
	//更新Input的值
	var work_num = getWorkNum(bug,work)
	var able_num = ableWorkNum(bug,work)

	$(div).siblings('.work_menu_input').val(getWorkNum(bug,work))
	$(div).siblings('#work_menu_able').text("(可用：" + able_num + ")")
	//更新按键的类
	if(able_num <= 0){
		$(div).children('#work_menu_参加').addClass("disable")
	}
	else{
		$(div).children('#work_menu_参加').removeClass("disable")
	}

	if(work_num <= 0){
		$(div).children('#work_menu_退出').addClass("disable")
	}
	else{
		$(div).children('#work_menu_退出').removeClass("disable")
	}
}




//新增工作
$(document).on("click","#addWork",function(){
	//打开一个子菜单，显示当前可以添加的工作
	$("#addWork_menu").toggle()
	$("#work_menu").hide()

	var bugNest = $(this).parents(".tile").data("object")
	updateAddWorkMenu(bugNest)
})

function updateAddWorkMenu(bugNest){
	//清空里面原本的内容
	$("#addWork_menu").find('*').each(function() {
	  	$(this).removeData();
	});
	$("#addWork_menu .tile_data").empty();
	var data_div = $("<div>",{class:"data"})
	//遍历其中显示 != false的内容
	for(work_id in bugNest.可进行工作){
		//获取工作对象的来源
		var work_source = bugNest.可进行工作[work_id].来源
		var work_func = getWorkFuncById(work_id)
		var work = work_func(work_source)
		if(work.功能.显示 != false){
			//如果这个work有着“独一”词条，则检查已有工作中是否存在同id工作
			if(haveEntry(work,"独一")){
				for(key in bugNest.当前工作){
					var now_work = bugNest.当前工作[key]
					//如果存在同id工作，则不显示该工作
					if(now_work.id == work_id){
						var show = false
					}
				}
			}

			if(show != false){
				//做成div加进子菜单中
				var addWork_div = createAddWorkMenuDiv(work)
				var work_name = getState(work,"名称")
				$(addWork_div).attr("work",work_name)
				$(data_div).append(addWork_div)
			}
		}
		//删除这个对象,他并不需要被使用
		work = null
	}
	$("#addWork_menu .tile_data").append(data_div)
}

//将work对象做成addWorkMenu的div
function createAddWorkMenuDiv(work){
	var container = $("<div>",{class:"addWork_menu_information"})
	//内容包含工作名称，工作需求，工作进度
	var name = getState(work,"名称")
	var workPower = "工作量：" + getState(work,"工作量")

	var need = "需求：" + getState(work,"需求")
	if(getState(work,"当前进度") == "无"){
		var progress = "进度：无" 
	}
	else{
		var progress = "进度：" + getState(work,"当前进度") + "/" + getState(work,"需求进度") + getUnit(work,"进度")
	}
	
	//对象div
	var object_div = $("<div>",{class:"object"})
	var name_div = $("<span>",{class:"object_name",text:name})
	$(name_div).data("object",work)
	$(object_div).append(name_div)

	var need_div = $("<div class='state flex'>\
	                  	<div>"+ workPower +"<div>\
	                  	<div>" + need + "</div>\
	                  	<span>"+ progress +"</span>\
	                  	</div>")

	$(container).append(object_div,need_div)

	return container
}

//点击addWorkMenu中的单位,为虫巢新增一个工作
$(document).on("click",".addWork_menu_information",function(){
	var work_name = $(this).attr("work")
	var bugNest = $(this).parents(".tile").data("object")
	startWork(bugNest,work_name)
})
