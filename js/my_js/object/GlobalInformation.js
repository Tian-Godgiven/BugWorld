//通用信息对象，这是一个独立的对象，保存着通用信息
var global_information = {
	Bug : {
		名称: "该对象的命名，通常情况下指代其种族或身份。",
		空间: "该对象活动所需要的空间，或该对象所占据的空间。",
		储备: "该对象内部所拥有的营养储备，表示为：当前已储备营养/最大可储备营养。",
		生产: "该对象每经过1回合将产生的营养量。",
		消耗: "该对象每经过1回合将消耗的营养量。对于虫群单位，若对象所摄入的营养量小于该数值，则该对象获得『饥饿』状态。",
		状态: "该对象当前所处的状态，不同的状态会产生不同的影响。状态通常有其持续时间，表示为：『状态 该状态的持续时间』",
		特殊: "该对象拥有的一部分特性或状态所产生的特殊属性，会对单位产生影响。",
		特性: "该对象所拥有的特殊性质，不同的特性会产生不同的影响。特性通常是永久性的，一部分特性可以累计层数，表示为：「特性 该特效的层数」",
		词条: "该对象所拥有的标识符，通常标识着对象的身份或特征。",
		信息: "对该对象的解释或介绍。",
		其他: "其他。",
		数量: "拥有相同属性的该对象在当前虫巢中的数量。",
		寿命: "该对象的寿命，表示为：当前寿命/最大寿命。若对象的当前寿命≥其最大寿命，则该对象获得『死亡』状态。",
		生命: "该对象的生命，表示为：当前生命/最大生命。若对象的当前生命≤0，则该对象获得『死亡』状态。通常情况下，对象的当前生命不会超过其最大生命。",
		攻击: "该对象的攻击能力，即其在一次攻防中对目标所能造成的伤害。",
		防御: "该对象的防御能力，即其在一次攻防中所能减免自身所受到的伤害。",
		工作: "该对象的工作能力，即其在一回合中所能提供的工作量，代表该对象的生产力。",
		饥饿: "该对象在『饥饿』状态下，每经过1回合所损失的当前生命。",
		回复: "该对象在未处于『饥饿』状态下，每经过1回合所回复的当前生命。",
		参数: "该对象所拥有的能力。",
		系数: "该对象每经过1回合所产生的影响。"
	},
	BugNest : {
		名称: "该巢穴的命名。",
		耐久: "该巢穴在被摧毁前所能承受的损伤，表示为：当前耐久/最大耐久。当巢穴的当前耐久≤0时，该巢穴损毁。通常情况下，巢穴的当前耐久不会超过其最大耐久。",
		强度: "该巢穴在承受攻击时，所能减免的损伤。若该巢穴将受到的损伤<其强度，则其不会受到伤害。",
		空间: "该巢穴内部的空间，表示为：该巢穴内已被占据的空间/该巢穴的最大空间。当巢穴的空间不足时，无法向该巢穴增添新的虫群单位。",
		储备: "该巢穴内部所拥有的营养储备，表示为：当前已储备营养/最大可储备营养。",
		储物: "该巢穴内部所拥有的储物空间，表示为：当前已使用空间/最大可储物空间。当对象的储物空间不足时，无法向该对象内存储物品。",
		生产: "该巢穴内部的虫群每经过1回合将产生的营养量。",
		消耗: "该巢穴内部的虫群每经过1回合将消耗的营养量。",
		单位: "该巢穴内部所拥有的虫群单位，表示为：单位名称x单位数量",
		设施: "该巢穴内部所拥有的设施。未建设完成的设施将表示为：设施名称[当前建设进度/总需求建设进度]",
		状态: "该巢穴内部或巢穴本身当前所处的状态，不同的状态会产生不同的影响。状态通常有持续时间，表示为：『状态 该状态的持续时间』",
		特殊: "该巢穴拥有的一部分特性或状态所产生的特殊属性，会对其产生影响。",
		特性: "该巢穴所拥有的特殊性质，不同的特性会产生不同的影响。特性通常是永久性的，一部分特性可以累计层数，表示为：「特性 该特效的层数」",
		词条: "该巢穴所拥有的标识符，通常标识着其身份或特征。",
		信息: "对该对象的解释或介绍。",
		其他: "其他。",
		参数: "该对象所拥有的能力。",
		系数: "该对象每经过1回合所产生的影响。",
	}
}

function getGlobalInformation(type,name){
	return global_information[type][name]
}
