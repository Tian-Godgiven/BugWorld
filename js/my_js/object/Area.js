//用于存储当前总共的地区数量
var area_list = []
var focusing_area
var area_id = 0

//创建一个地区用以虫群建立虫巢
function createArea(){
	var area = {id:area_id}
	$(area).data("虫巢",[])
	
	area_id += 1
	focusing_area = area
	return area
}

//返回当前聚焦的地区
function returnFocusingArea(){
	return focusing_area
}