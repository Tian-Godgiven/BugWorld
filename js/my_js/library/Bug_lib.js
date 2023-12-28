//虫后
function createQueen(number){
	var Queen = new Bug()
	//形成虫后的参数
	changeState(Queen,{
		"名称" : "虫后",
		"数量" : number,
		"最大寿命" : 100,
		"最大储备" : 10,
		"生命" : 50,
		"攻击" : 5,
		"防御" : 5,
		"工作" : 10,
		"空间" : 5,
		"消耗" : "-5",
		"饥饿" : "-10",
		"回复" : "+5",
		"词条" : "虫母",
		"信息" : "虫巢之后，虫群之母，兆虫之源，一位母亲。"
	})
	//为虫后赋予特性
  	appendCharacteristic(Queen,"嗉囊")
  	appendCharacteristic(Queen,"虫母")

	return Queen
}
appendBugDic("虫后",createQueen)


//工虫
function createWorker(number){
	var Worker = new Bug()
	//形成对象的参数
	changeState(Worker,{
		"名称" : "工虫",
		"数量" : number,
		"最大寿命" : 20,
		"最大储备" : 15,
		"生命" : 20,
		"攻击" : 3,
		"防御" : 2,
		"工作" : 10,
		"空间" : 2,
		"消耗" : "-5",
		"饥饿" : "-10",
		"回复" : "+5",
		"词条" : ["成虫","工虫"],
		"信息" : "她们是虫群的根基，终身勤劳的工人。"
	})
	
	//为其赋予特性
  	appendCharacteristic(Worker,"嗉囊")

	return Worker
}
appendBugDic("工虫",createWorker)