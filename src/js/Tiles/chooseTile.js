import { createTile } from "../Modules/tile/tile"
import { runObjectMovement } from "../State/Movement"
import { countValue, sortByLevel } from "../app/global_ability"

//事件监听
const EventEmitter = require("events")
const submitEmitter = new EventEmitter();
//创建一个选择Tile
export function createChooseTile(title="选择",inner,choice,ability){
//创建选项容器Div
    const choiceContainer = $(`<div class="chooseTile_choiceContainer"></div>`)
        .data("已选择",[])
    //tile的功能
    const tile_ability = {
		关闭 : false,
        标题居中: true
	}

//根据设置的ability控制这个【选择tile】的显示和功能
    //标题居中
        if(ability.标题居中 === false){
            tile_ability.标题居中 = false
        }
    //tile绑定的对象
        const object = ability.对象
        if(object){
            tile_ability[对象] = object
        }
    //立即选择
        if(ability.立即选择){
            //产生一个无法回退的背景，只能通过确认选择来结束选择Tile
        }
    //复选选项
        let 复选值 = {
            max : 1,
            min : 1
        }
        if(ability.复选){
            复选值 = ability.复选
        }
        
        //min和max都默认为1,max和min必须>=1,并且max>min
        const max = 复选值.max >= 1 ? 1:复选值.max
        const min = 复选值.min >= 1 ? 1:复选值.min
        if(max < min){
            throw new error("错误：在设置选项容器的复选值时，复选值的max小于了min")
        }
        $(choiceContainer).data("复选值",{max:max,min:min})
    //额外按键
        const bonusDiv = $(`<div></div>`)
    //确认按键
        if(ability.确认 !== false){
            bonusDiv.append($(`<div class="chooseTile_确认">确认</div>`))
            //为容器添加“确认”标识
            $(choiceContainer).prop("确认",true)
        }
        else{
            $(choiceContainer).prop("确认",false)
        }
    //取消按键
        if(ability.取消 !== false){
            bonusDiv.append($(`<div class="chooseTile_取消">取消</div>`))
        }
    //这个函数在确认时返回值
        //必定返回或必定不返回
        if(ability.返回 === true || ability.返回 === false){
            $(choiceContainer).data("返回",ability.返回)
        }
        //自动返回,如果有返回值，则返回，否则不返回
        else{
            $(choiceContainer).data("返回","auto")
        }
    //选项排列
        //横向
        if(ability.选项排列 == "横向"){
            $(choiceContainer).addClass("flex")
        }
    //通用样式
        const 通用样式 = ability.通用样式
    //位置与尺寸
        if(ability.位置){
            tile_ability.位置 = ability.位置
        }
        if(ability.尺寸){
            tile_ability.尺寸 = ability.尺寸
        }
//遍历choice，生成选项Div并放入容器
    for(let i of choice){
        //选项内容
        const choiceDiv = $(`<div class="chooseTile_choiceDiv">${i.选项内容}</div>`)
        //绑定选项事件
        .data("选项事件",i.选项事件)
        //添加选项样式类
        if(i.选项样式类){
            for(let choiceClass of i.选项样式类){
                $(choiceDiv).addClass(choiceClass)
            }
        }
        //应用通用样式
        if(通用样式){
            if (通用样式.已选中) {
                $(choiceDiv + ".chooseTile_chosenDiv").css(通用样式.已选中);
            }
            // 设置未选中的样式
            if (通用样式.未选中) {
                $(choiceDiv).css(通用样式.未选中);
            }
        }
        //应用选项样式，其会覆盖在通用样式上
        if(i.选项样式){
            if (i.选项样式.已选中) {
                $(choiceDiv + ".chooseTile_chosenDiv").css(i.选项样式.已选中);
            }
            // 设置未选中的样式
            if (i.选项样式.未选中) {
                $(choiceDiv).css(i.选项样式.未选中);
            }
        }
        //绑定对象
        if(i.对象){
            $(choiceDiv).data("object",i.对象)
        }
        //绑定优先级
        if(i.优先级){
            choiceDiv.data("优先级",i.优先级)
        }
        else{
            choiceDiv.data("优先级",0)
        }
        //放入container中
        $(choiceContainer).append(choiceDiv)
        //默认选中
        if(i.默认选中){
            chooseChoiceDiv(choiceDiv)
        }
    }

//将选项容器Div，额外内容Div放入Inner中
    $(inner).append(choiceContainer,bonusDiv)
//创建对应的Tile
    const tile = createTile(title,inner,tile_ability)
    $(tile).addClass(".chooseTile")

//监听确认选择,进行选择后返回对应的值
    return new Promise((resolve,reject)=>{
        submitEmitter.on("submit",(returnValue)=>{
            console.log(returnValue)
            resolve(returnValue)
        })
    })
}

//点击一个尚未被选择的选项div，将其选中
$("#main").on("click",".chooseTile_choiceDiv:not('.chooseTile_chosenDiv')",function(){
    chooseChoiceDiv(this)
})

//将选项div选中
export function chooseChoiceDiv(choiceDiv){
    if($(choiceDiv).hasClass("chooseTile_chosenDiv")){
        return false
    }

    //判断其所在的container的复选设置
    const container = $(choiceDiv).parents(".chooseTile_choiceContainer")
    //检测已经选择的选项数量是否超过了最大复选值
    let 最大值 = container.data("复选值").max
    //如果已选择数量==最大值的数量，则从已选择队列出队并取消选择
    const 已选择 = container.data("已选择")
    if(已选择.length == 最大值){
        const shiftDiv = 已选择.shift()
        unchooseChoiceDiv(shiftDiv)
    }

    //然后再令这个选项被选中
    $(choiceDiv).addClass("chooseTile_chosenDiv")
    //加入到其容器的“已选择”队列中
    $(choiceDiv).parents(".chooseTile_choiceContainer").data("已选择").push(choiceDiv)
    //触发选项的“被选中时”事件
    runChoiceEvent(choiceDiv,"选中时")

    //再判断已选择值和复选值是否相同，若相同，则判断容器的“确认”
    if(已选择.length == 最大值){
        //若容器不需要“确认”，则直接使用容器执行确认选择
        if(!container.prop("确认")){
            submitChoose(container)
        }
    }
}
//取消选项div的选中
export function unchooseChoiceDiv(choiceDiv){
    if($(choiceDiv).hasClass("chooseTile_chosenDiv")){
        //取消选中类
        $(choiceDiv).removeClass("chooseTile_chosenDiv")
        //触发选项的“失去选中时”事件
        runChoiceEvent(choiceDiv,"失去选中时")
        // 从“已选择”队列中删除对应 div
        const chosenQueue = $(choiceDiv).parents(".chooseTile_choiceContainer").data("已选择");
        const index = chosenQueue.indexOf(choiceDiv);
        if (index !== -1) {
            chosenQueue.splice(index, 1);
        }
    }
}

//确认选择
export function submitChoose(choiceContainer){
    //判断已选择的选项的数量是否满足复选值的最小值
    const 已选择 = $(choiceContainer).data("已选择")
    const 最小值 = $(choiceContainer).data("复选值").min
    if(已选择.length != 最小值){
        console.log("需要选择更多选项")
        return false
    }
    
    // 遍历选项元素,按照优先级排列
    let array = [];
    $(choiceContainer).find(".chooseTile_choiceDiv").each(function() {
        array.push({ 对象: this, 优先级:  $(this).data("优先级") });
    });
    // 根据优先级排序选项
    const sorted_choice = sortByLevel(array)
    //依次处理选项事件并计算返回值
    let returnValue
    for(let choiceDiv of sorted_choice){
        //执行所有选中的选项的“选择时”事件
        if($(choiceDiv).hasClass("chooseTile_chosenDiv")){
            const value = runChoiceEvent(choiceDiv,"选择时")
            returnValue = countValue(returnValue,value)
        }
        //执行所有未选中的选项的“未选择时”事件
        else{
            const value = runChoiceEvent(choiceDiv,"未选择时")
            returnValue = countValue(returnValue,value)
        }
    }

    //根据设定，只有在特定情况下返回选项的结果
    let ifReturn = false
    const 返回 = $(choiceContainer).data("返回")
    if(返回 === true){
        ifReturn = true
    }
    else if(返回 === "auto" && returnValue){
        ifReturn = true
    }

    //关闭并删除这个选项Tile
    $(choiceContainer).parents(".tile").remove()

    //返回值
    if(ifReturn){
        submitEmitter.emit("submit",returnValue)
    }
    else{
        submitEmitter.emit(false)
    }
    
    
}

//取消选择
export function cancelChoose(choiceContainer){
    //取消容器中的所有已选中的选项的选择
    const 已选择 = choiceContainer.data("已选择")
    for(let choiceDiv in 已选择){
        unchooseChoiceDiv(choiceDiv)
    }
}

//触发选项Div的选项事件
export function runChoiceEvent(choiceDiv,eventName){
    const container = $(choiceDiv).parents(".chooseTile_choiceContainer")
    const func = $(choiceDiv).data("选项事件")[eventName]
    if(func){
        const choiceObject = $(choiceDiv).data("object")
        const containerObject = $(container).data("object")
        return func(containerObject,choiceObject)
    }
}