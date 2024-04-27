console.log("123")

$.when(
	$.getScript('./js/my_js/ability/global_ability.js'),
  	$.getScript('./js/my_js/ability/cube.js'),
	$.getScript('./js/my_js/ability/tile.js'),
  	$.getScript('./js/my_js/ability/information.js'),

	$.getScript('./js/my_js/object/Area.js'),
	$.getScript('./js/my_js/object/BugNest.js'),
	$.getScript('./js/my_js/object/Bug.js'),
	$.getScript('./js/my_js/object/Characteristic.js'),
	$.getScript('./js/my_js/object/Work.js'),
	$.getScript('./js/my_js/object/GlobalInformation.js'),
	$.getScript('./js/my_js/object/Facility.js'),

  	$.getScript('./js/my_js/library/Work_lib.js'),
  	$.getScript('./js/my_js/library/Characteristic_lib.js'),
  	$.getScript('./js/my_js/library/Bug_lib.js'),
  	$.getScript('./js/my_js/library/Facility_lib.js'),
  	$.getScript('./js/my_js/library/Facility_Work_lib.js'),

  	$.getScript('./js/my_js/components/log_tile.js'),
  	$.getScript('./js/my_js/components/bugGroup_tile.js'),
  	$.getScript('./js/my_js/components/bugNest_tile.js'),
  	$.getScript('./js/my_js/components/work_tile.js'),
  	$.getScript('./js/my_js/components/build_tile.js'),
  	$.getScript('./js/my_js/components/facility_tile.js'),

  	$.getScript('./js/my_js/components/menu/workTile_menu.js'),
  	$.getScript('./js/my_js/components/menu/facilityTile_menu.js'),
)
.done(function() {
  	main()
})
.fail(function() {
  	console.error('加载文件出错');
});


function main(){
	//创建日志栏
	createLog()

	//创建区域
	var area = createArea()
	//在区域内创建一座虫巢
	var bugNest = createBugNest(area)
	//为虫巢创建一位虫后，并将她安置入巢
	var Queen = createBug("虫后",2)
	var Worker = createBug("工虫",10)
	addBug(bugNest,Queen)
	addBug(bugNest,Worker)

	//令虫巢可以进行这些工作
	appendWork(bugNest,bugNest,"觅食")
	appendWork(bugNest,bugNest,"产卵")
	appendWork(bugNest,bugNest,"建设孵化室")

	//为虫巢添加一些设施
	var facility = createFacility("虫母室",1)
	appendFacility(bugNest,facility)
	var facility2 = createFacility("孵化室",1)
	appendFacility(bugNest,facility2)

	//创建虫巢信息栏，将对应的数据载入
	createTile("虫巢",bugNest)
	updateBugNestTile(bugNest)
	//创建虫群信息栏，将对应的数据载入
	createTile("虫群")
	updateBugGroupTile(bugNest)

	//创建设施信息栏
	createFacilityTile(bugNest)
	updateFacilityTile(bugNest)


	//创建工作信息栏
	createWorkTile(bugNest)

	//创建建设信息栏
	createBuildTile(bugNest)




}

