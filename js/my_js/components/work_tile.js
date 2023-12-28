//创建[工作]Tile，包含两个menu子元素
function createWorkTile(bugNest){
	var tile = createTile("工作",bugNest)
	//工作div放置栏和新增工作键
	var data_div = $("<div>",{class:"data"})
		var work_container = $("<div>",{id:"work_container"})
		var add_div = $("<div>",{class:"work_information",id:"addWork",text:"新增工作"})
	$(data_div).append(work_container,add_div)
	$(tile).children('.tile_data').append(data_div)
	//工作信息栏的子菜单
	var work_menu = $("<div class='menu' id='work_menu'>\
							<div class='tile_top'>已参与</div>\
							<div class='tile_data'></div>\
						</div>")
	var add_menu = $("<div class='menu' id='addWork_menu'>\
							<div class='tile_top'>新增工作</div>\
							<div class='tile_data'></div>\
						</div>")
	work_menu.hide()
	add_menu.hide()
	$(tile).append(work_menu,add_menu)
}

//创建一个工作对象的div
function createWorkDiv(work){
	//总容器
	var 名称 = getState(work,"名称")
	var container = $("<div>",{class:"work_information",id:名称})
	$(container).data("work",work)

	//获取内容
	var div_inner = createWorkDivInner(work)
	//放进container中
	$(container).append(div_inner)

	return container
}

//创建一个工作对象div的内容，用于更新这个工作对象div
function createWorkDivInner(work){
	var 名称 = getState(work,"名称")
	if(getState(work,"当前进度") == "无"){
		var 进度 = "进度：无" 
	}
	else{
		var 进度 = "进度：" + getState(work,"当前进度") + "/" + getState(work,"需求进度") + getUnit(work,"进度")
	}
	
	var 参与 = getState(work,"参与")
	var 效率 = "效率：" + getState(work,"效率") + getUnit(work,"效率")

	var div_inner = $("<div>",{class:"work_information_inner flex"})
	//工作对象的名称
	var div_1 = $("<div>",{class:"object"})
	var work_name = $("<span>",{
		class:"object_name bold",
		text:名称
	})
	$(div_1).append(work_name)

	//工作对象的信息
	var div_2 = $("<div>")
	//工作的进度
	var inner_1 = $("<div>",{text:进度})
	//工作的效率
	var inner_2 = $("<div>",{text:效率})
	$(div_2).append(inner_1,inner_2)

	//工作对象的按键
	var div_3 = $("<div>",{class:"tileIcon close work_delete"})

	$(div_inner).append(div_1,div_2,div_3)

	return div_inner
}

//删除某一个工作Div，同时会令其对应的工作取消
$(document).on("click",".work_delete",function(event){
	event.stopPropagation()
	var work_div = $(this).parents(".work_information")
	var work = work_div.data("work")
	//如果当前正在显示这个work对象的menu，则令其清空
	if(work == $("#work_menu").data("work")){
		$("#work_menu").find('*').each(function() {
	  		$(this).removeData();
		});
		$("#work_menu .tile_data").empty();
	}
	//令其对应的工作取消
	deleteWork(work)
	//令这个工作div移除
	$(work_div).remove()
})

//删除某个工作对象
function deleteWork(work){
	//令所有参与这个工作的对象辞职
	var 参与 = getState(work,"参与")
	for(var i = 参与.length - 1; i>=0 ; i--){
		//倒序辞职，因为每一次辞职都会使参与列表缩短
		var bug = 参与[i]
		var work_num = getWorkNum(bug,work)
		resignWork(bug,work_num,work)
	}
	//令这个工作从虫巢中结束并删除
	var bugNest = getBugNest(work)
	stopWork(bugNest,work)
}

//更新某一个工作Div的内容
function updateWorkDiv(work){
	var name = getState(work,"名称")
	var new_div_inner = createWorkDivInner(work)
	//用新的内容替换原本的div_inner
	var old_div = $(".work_information#"+name)
	$(old_div).html(new_div_inner)
}



