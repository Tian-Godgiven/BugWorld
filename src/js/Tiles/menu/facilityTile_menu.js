//点击三种button显示不同的菜单内容

//升级
$(document).on("click",".facility_levelUp",function(){
	var facility = $(this).parents(".facility_information").data("object")

	//显示菜单
	if(facility == $("#facility_menu").data("object")){
		$("#facility_menu").toggle()
	}
	else{
		$("#facility_menu").show()
	}
	$("#facility_menu").data("object",facility)

	//更新facilityMenu中的内容
	$("#facility_menu .tile_top").html("升级")
	//清空原本的内容
	$("#facility_menu .tile_data").empty()
	//加入新的内容
	var data_div = $("<div>",{class:"data"})
	//将该设施的升级工作的信息显示在这里
	var levelUp_work = facility.升级
	for(i in levelUp_work){
		var work_name = levelUp_work[i]
		var work_func = getWorkFuncByName(work_name)
		var work = work_func(facility)
		var div = createAddWorkMenuDiv(work)
		$(div).attr("work",work_name)
		$(data_div).append(div)
	}
	$("#facility_menu .tile_data").append(data_div)
	work = null
})

//增建
$(document).on("click",".facility_build",function(){
	var facility = $(this).parents(".facility_information").data("object")

	//显示菜单
	if(facility == $("#facility_menu").data("object")){
		$("#facility_menu").toggle()
	}
	else{
		$("#facility_menu").show()
	}
	$("#facility_menu").data("object",facility)

	//更新facilityMenu中的内容
	$("#facility_menu .tile_top").html("增建")
	//清空原本的内容
	$("#facility_menu .tile_data").empty()
	//加入新的内容
	var data_div = $("<div>",{class:"data"})
	//将该设施的建设工作的信息显示在这里
	var work_func = facility.函数.建设
	var work = work_func(facility)
	var work_name = getState(work,"名称")
	var div = createAddWorkMenuDiv(work)
	$(div).attr("work",work_name)
	$(data_div).append(div)
	$("#facility_menu .tile_data").append(data_div)
	work = null
})

//拆除
$(document).on("click",".facility_demolition",function(){
	var facility = $(this).parents(".facility_information").data("object")

	//显示菜单
	if(facility == $("#facility_menu").data("object")){
		$("#facility_menu").toggle()
	}
	else{
		$("#facility_menu").show()
	}
	$("#facility_menu").data("object",facility)

	//更新facilityMenu中的内容
	$("#facility_menu .tile_top").html("拆除")
	//清空原本的内容
	$("#facility_menu .tile_data").empty()
	//加入新的内容
	var data_div = $("<div>",{class:"data"})
	//将该设施的拆除工作的信息显示在这里
	var work_func = facility.函数.拆除
	var work = work_func(facility)
	var work_name = getState(work,"名称")
	var div = createAddWorkMenuDiv(work)
	$(div).attr("work",work_name)
	$(data_div).append(div)
	$("#facility_menu .tile_data").append(data_div)
	work = null
})
