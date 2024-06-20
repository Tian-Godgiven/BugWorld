import { createTile } from "../Modules/tile/tile"
import { runObjectMovement } from "../State/Movement"
import { countValue, createRandomId, sortByLevel } from "../app/global_ability"
import "../../css/components/chooseTile.css"
import { createBlackScreen, deleteBlackScreen } from "../Modules/screen"

//事件监听
const EventEmitter = require("events")
const submitEmitter = new EventEmitter();
//创建一个选择Tile
export function createChooseTile(title="选择",text,choice,ability){

    //筛查是否存在同chooseTile_id的元素
    const chooseTile_id = ability.chooseTile_id
    if(chooseTile_id){
        const old_chooseTile = $(`.chooseTile[chooseTile_id=${chooseTile_id}]`)
        //如果已存在相同chooseTile_id的元素,则按照“重复”要求进行操作
        if(old_chooseTile.length>0){
            let 重复 = false
            if(ability.重复){
                重复 = ability.重复
            }
            //根据重复的值进行不同的操作
            if(重复 === true){
                //nothing
            }
            //关闭旧的chooseTile
            else if(重复 == "关闭"){
                $(old_chooseTile).remove()
                return false
            }
            //取代旧的chooseTile
            else if(重复 == "取代"){
                $(old_chooseTile).remove()
            }
            //默认为禁止创建新的chooseTile
            else{
                return false
            }
        }
    }


//创建选项文本Div
    let chooseText
    //如果是单纯的文本
    if(typeof text == "string"){
        chooseText = $(`<div class="chooseTile_text">${text}</div>`)
    }
    //如果是dom元素或者jquery元素
    else if(_.isElement(text) || text instanceof jQuery){
        chooseText = $(text).addClass("chooseTile_text")
    }
//创建选项容器Div，分配一个8位的随机chooseId作为submit监听器的监听后缀
    const submit_id = "submit_id_" + createRandomId(8)
    const choiceContainer = $(`<div class="chooseTile_choiceContainer"></div>`)
        .data({
            "已选择":[],
            "submit_id":submit_id
        })
//tile的功能
    const tile_ability = {
		关闭 : "delete",
        标题居中: true,
        尺寸:{
            height:"auto",
            width:"auto"
        }
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
        let 立即选择 = false
        if(ability.立即选择 == true){
            立即选择 = true
            $(choiceContainer).data("立即选择",true)
        }
    //关闭
        if (ability.关闭 === true) {
            // 如果 ability.关闭 为 true，什么也不做
        } 
        else if (ability.关闭 === false) {
            tile_ability.关闭 = false;
        } 
        else {
            $(choiceContainer).data("自动关闭", true);
        }
    //复选选项
        let max = 1 , min = 1
        if(ability.复选){
            const 复选值 = ability.复选
            //min和max都默认为1,max和min必须>=1,并且max>min
            max = 复选值.max >= 1 ? 复选值.max:1
            min = 复选值.min >= 1 ? 复选值.min:1
        }
        if(max < min){
            throw new error("错误：在设置选项容器的复选值时，复选值的max小于了min")
        }
        $(choiceContainer).data("复选值",{max:max,min:min})
    //复选样式
        let 复选样式 = false
        if(max > 1){
            复选样式 = "checkbox"
        }
        if(ability.复选样式 != null){
            复选样式 = ability.复选样式
        }
    //额外按键
        const bonusDiv = $(`<div class="chooseTile_bonusDiv"></div>`)
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
        let 选项排列 = "横向"
        //如果是复选max大于1，在默认为竖向
        if(max > 1){
            选项排列 = "竖向"
        }
        if(ability.选项排列){
            选项排列 = ability.选项排列
        }
        //如果是横向，则添加“flex”类
        if(选项排列 == "横向"){
            $(choiceContainer).addClass("flex")
        }
        //如果是竖向，则为选项div添加（.chooseTile_竖向）类（见下方
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
        let choiceText
        //如果选项内容是一个dom对象，则放进去
        if(i.选项内容 instanceof HTMLElement || i.选项内容 instanceof jQuery){
            choiceText = $(`
                <span class="chooseTile_choiceText"></span>`)
                .append(i.选项内容)
        }
        //否则视作文字内容
        else{
            choiceText = $(`
                <span class="chooseTile_choiceText">
                    ${i.选项内容}
                </span>
            `)
        }
        //制作选项div
        const choiceDiv = $(`<div class="chooseTile_choiceDiv"> </div>`)
            .append(choiceText)
        //绑定选项事件
        .data("选项事件",i.选项事件)
        //添加选项样式类
        if(i.选项样式类){
            for(let choiceClass of i.选项样式类){
                $(choiceDiv).addClass(choiceClass)
            }
        }
        //添加复选框
        if(复选样式 == "checkbox"){
            choiceDiv.prepend(`<input type="checkbox" class="chooseTile_choiceCheckbox">`)
        }
        //添加复选箭头并隐藏
        else if(复选样式 == "arrow"){
            choiceDiv.prepend(`<div style="display:none" class="chooseTile_choiceArrow arrow_right">`)
        }
        //添加竖向类
        if(选项排列 == "竖向"){
            choiceDiv.addClass("chooseTile_竖向")
        }
        //应用通用样式
        if(通用样式){
            $(choiceDiv).css(通用样式);
        }
        //应用选项样式，其会覆盖在通用样式上
        if(i.选项样式){
            $(choiceDiv).css(i.选项样式);
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
//将选项文本Div，选项容器Div放入Inner中
    const tile_inner = $("<div></div>")
        .append(chooseText,choiceContainer,bonusDiv)
//创建对应的Tile
    const tile = createTile(title,tile_inner,tile_ability)
    //添加类和标识id
    $(tile).addClass("chooseTile")
    if(chooseTile_id){
        $(tile).attr("chooseTile_id",chooseTile_id)
    }
    //立即选择
    if(立即选择 == true){
        //创建黑屏，只能通过确认选择来结束选择Tile
        createBlackScreen(tile)
    }

//返回选择Tile，确认监听器，确认监听id
    return {
        chooseTile:tile,
        submitEmitter:submitEmitter,
        submit_id:submit_id
    }
}

//点击一个选项div，将其选中或取消选中
$("#main").on("click",".chooseTile_choiceDiv:not(.unable)",function(){
    //已经被选中时，取消选中
    if($(this).hasClass('chooseTile_chosenDiv')){
        unchooseChoiceDiv(this)
    }
    //未被选中时，将其选中
    else{
        chooseChoiceDiv(this)
    }
    
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
    //如果其中存在checkbox，则令其选中
    const checkbox = $(choiceDiv).find(".chooseTile_choiceCheckbox")
    if(checkbox.length > 0){
        $(checkbox).prop("checked",true)
    }
    //如果其中存在arrow，则令其显示
    const arrow = $(choiceDiv).find(".chooseTile_choiceArrow")
    if(arrow.length > 0){
        $(arrow).show()
    }
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
        //如果其中存在checkbox，则令其失去选中
        const checkbox = $(choiceDiv).find(".chooseTile_choiceCheckbox")
        if(checkbox.length > 0){
            $(checkbox).prop("checked",false)
        }
        //如果其中存在arrow，则令其隐藏
        const arrow = $(choiceDiv).find(".chooseTile_choiceArrow")
        if(arrow.length > 0){
            $(arrow).hide()
        }
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
    //判断已选择的选项的数量是否满足复选值的最小值，最大值需求
    const 已选择 = $(choiceContainer).data("已选择")
    const 最小值 = $(choiceContainer).data("复选值").min
    const 最大值 = $(choiceContainer).data("复选值").max
    if(已选择.length < 最小值){
        console.log("需要选择更多选项")
        return false
    }
    else if(已选择.length > 最大值){
        console.log("选择的选项过多")
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
        //将其设置为unable
        $(choiceDiv).addClass("unable")
        $(choiceDiv).children(".chooseTile_choiceCheckbox").prop("disabled",true)
    }

    //根据设定，只有在特定情况下返回选项的结果
    let ifReturn = false
    const 返回 = $(choiceContainer).data("返回")
    //提前获取确认id
    const submit_id = $(choiceContainer).data("submit_id")
    if(返回 === true){
        ifReturn = true
    }
    else if(返回 === "auto" && returnValue){
        ifReturn = true
    }

    //判断是否包含“立即选择”，若是则关闭黑屏
    if($(choiceContainer).data("立即选择")==true){
        deleteBlackScreen()
    }

    //如果选项Tile的“关闭”为"auto"，即自动关闭
    if($(choiceContainer).data("自动关闭")){
        //关闭并删除这个选项Tile
        $(choiceContainer).parents(".tile").remove()
    }
    

    //返回值
    if(ifReturn){
        submitEmitter.emit(submit_id,returnValue)
    }
    else{
        submitEmitter.emit(submit_id,false)
    }
    
    
}

//取消选择
export function cancelChoose(choiceContainer){
    //取消容器中的所有已选中的选项的选择
    $(choiceContainer).find(".chooseTile_chosenDiv").each(function(){
        unchooseChoiceDiv(this)
    })
}

//触发选项Div的选项事件
export function runChoiceEvent(choiceDiv,eventName){
    const container = $(choiceDiv).parents(".chooseTile_choiceContainer")
    const 选项事件 = $(choiceDiv).data("选项事件")
    if(选项事件){
        const func = 选项事件[eventName]
        if(func){
            const choiceObject = $(choiceDiv).data("object")
            const containerObject = $(container).data("object")
            return func(containerObject,choiceObject,choiceDiv)
        }
    }
    
}

//点击确认按键确认选择
$("#main").on("click",".chooseTile_确认",function(){
    const choiceContainer = $(this).parent().siblings(".chooseTile_choiceContainer")
    submitChoose(choiceContainer) 
})
//点击取消按键取消选择
$("#main").on("click",".chooseTile_取消",function(){
    const choiceContainer =  $(this).parent().siblings(".chooseTile_choiceContainer")
    cancelChoose(choiceContainer)
})