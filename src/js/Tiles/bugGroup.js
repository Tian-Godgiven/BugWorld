import { createTile,dataTile } from "../Modules/tile";
import { getState } from "../State/State";
import { objectToDiv } from "../app/global_ability";

//创建一个虫群Tile,显示虫巢中的虫群状态
export function createBugGroupTile(bugNest){
	createTile("虫群",bugNest)
	updateBugGroupTile(bugNest)
}

//根据虫巢对象修改虫群Tile的数据显示
export function updateBugGroupTile(bugNest){
	var bugGroup_data = $("<div>",{
		class:"data"
	})
	//根据虫巢单位的信息创建数据表格
	var table = $('<table>');
	table.append(`
		<tr>
	    	<th class="state" name="名称">名称</th>
	    	<th class="state" name="数量">数量</th>
	    	<th class="state" name="生命">生命</th>
	    	<th class="state" name="寿命">寿命</th>
	    	<th class="state" name="工作">工作</th>
	    	<th class="state" name="攻击">攻击</th>
	    	<th class="state" name="防御">防御</th>
	  	</tr>
	`);
	var bugGroup = getState(bugNest,"虫群")
	for(let i in bugGroup){
		var bug = bugGroup[i]
		var 名称 = getState(bug,"名称")
		var 数量 = getState(bug,"数量")
		var 生命 = getState(bug,"生命")
		var 寿命 = getState(bug,"寿命")
		var 工作 = getState(bug,"工作")
		var 攻击 = getState(bug,"攻击")
		var 防御 = getState(bug,"防御")
		var tr = $("<tr>",{
			class:"object",
			name:名称
		})
		const td = objectToDiv(bug)
		tr.append(td,`
	    	<td>` + 数量 + `</td>
	    	<td>` + 生命.now.数值+"/"+生命.max.数值 + `</td>
	    	<td>` + 寿命.now.数值+"/"+寿命.max.数值 + `</td>
	    	<td>` + 工作 + `</td>
	    	<td>` + 攻击 + `</td>
	    	<td>` + 防御 + `</td>
	    `)
	    table.append(tr)
	}
	//将表格填入数据中
	bugGroup_data.append(table)
	//用数据更新虫群Tile
	dataTile("虫群",bugGroup_data)
}