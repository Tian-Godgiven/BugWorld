//创建[设施]tile，包含一个menu子元素
function createFacilityTile(bugNest){
	var tile = createTile("设施",bugNest)
	//子菜单
	var facility_menu = $("<div class='menu' id='facility_menu'>\
							<div class='tile_top'></div>\
							<div class='tile_data'></div>\
						</div>")
	facility_menu.hide()
	$(tile).append(facility_menu)
}

//创建一个设施div
function createFacilityDiv(facility){
	var facility_div = $("<div>",{class:"facility_information object"})
	$(facility_div).data("object",facility)
	//设施名称，如果有等级则还会显示等级
	var name_text = getState(facility,"名称")
	if(facility.功能.升级){
		var name_text = name_text + " Lv." + getState(facility,"等级")
	} 
	var name_div = $("<div>",{
		class:"object_name",
		text:"-" + name_text + "-"
	})
	$(name_div).data("object",facility)
	//设施数量
	var num_div = createStateDiv("数量",getState(facility,"数量"))
	//设施词条
	var entry_div = createEntryDiv(getState(facility,"词条"))
	//设施效果
	var ability_div = createStateDiv("效果",getState(facility,"效果"))
	$(facility_div).append(name_div,num_div,entry_div,ability_div)
	
	//按钮栏
	var botton_container = $("<div>",{class:"botton_container"})

	//升级按钮
	if(facility.功能.升级){
		var 升级_botton = $("<div>",{
			class:"botton facility_levelUp",
			text:"升级"
		})
		botton_container.append(升级_botton)
	}

	//增建按钮和拆除放在一起
	var num_botton_container = $("<div>",{class:"flex"})
	var tmp_num_botton = false
	if(!haveEntry(facility,"独一")){
		tmp_num_botton = true
		var 增建_botton = $("<div>",{
			class:"botton facility_build",
			text:"增建"
		})
		num_botton_container.append(增建_botton)
	}
	//拆除按钮和增建放一行
	if(facility.功能.拆除){
		tmp_num_botton = true
		var 拆除_botton = $("<div>",{
			class:"botton facility_demolition",
			text:"拆除"
		})
		num_botton_container.append(拆除_botton)
	}
	//如果存在拆除或者增建，则将num_botton_container放入botton_container中
	if(tmp_num_botton){
		$(botton_container).append(num_botton_container)
	}
	//放入facility中
	$(facility_div).append(botton_container)

	return facility_div
}

//更新[设施]tile，将对应bugNest中的内容装入其中
function updateFacilityTile(bugNest){
	//清空原本的Tile
	$("#设施 > .tile_data").empty()

	//当前设施栏，显示虫巢中目前拥有的设施与这些设施的效果
	var all_container_div = $("<div>",{class:"data"})
	//遍历虫巢中的设施
	var facilities = getState(bugNest,"设施")
	for(i in facilities){
		var facility = facilities[i]
		var facility_div = createFacilityDiv(facility)

		//放入总容器
		$(all_container_div).append(facility_div)
	}
	
	dataTile("设施",all_container_div)
}

//设施对应的按键功能