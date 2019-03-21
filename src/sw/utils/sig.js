import storage from '@/utils/storage'
import { Base64 } from 'js-base64';
//接收消息指令
export function receiveMsgPtoP(data){
	let type = "";
	switch(data.command){
		//全体禁言
		case "TURN_OFF_ALL_MIC":
		type = "turn_off_all_mic";
		break;
		//全体取消禁言
		case "TURN_ON_ALL_MIC":
		type = "turn_on_all_mic";
		break;
		//聊天
		case "CHAT":
		type = "chat";
		break;
		//某人踢出直播间
		case "kick_out":
		type = "KICK_OUT";
		break;
		//禁视频
		case "CLOSE_VEDIO" || "CLOSE_AUDIO":
		type = "close";
		break;
		case "OPEN_VEDIO" || "OPEN_AUDIO":
		type = "open";
		break;
		//禁止CLOSE_AUDIO
		//禁视频
		case "close_vedio":
		type = false;
		default:
	}
	return type;
}

//发送聊天命令
export function sendChat(type,msg,time,getImg,name){
	var data = {};
	switch(type){
		case 'singleChat':
		data = {
			"command":"CHAT",
			"fromRole":"Attendee",
            "chatMessage":{
                "chatType":"USER",
                "chatMessageType":"CHAT",
                "contentType":"TXT",
                "content":msg,
                "time":time,
                "avatar":getImg
            }
		}
		break;
		case 'chat':
		data = {
            "command":"CHAT",
            "fromRole":"Attendee",
            "chatMessage":{
                "chatType":"ROOM",
                "chatMessageType":"CHAT",
                "contentType":"TXT",
                "content":msg,
                "time":time,
				"avatar":getImg,
				"sendname":name,
            }

        }
		break;
		case 'notice':
		data = {
            "command":"CHAT",
            "fromRole":"Attendee",
             "chatMessage":{
                "chatType":"ROOM",
                "chatMessageType":"NOTICE",
                "contentType":"TXT",
                "content":msg,
                 "time":time,
                 "avatar":getImg
            }

        }
		break;
	}
	// console.log("戴登禄明的信息============",data)
	return JSON.stringify(data);
}

// 发送答题器 答案
export function sendAnswer(type, result,usename) {
	var data = {};
	switch(type) {
		case 'ANSWER':
			data = {
				"command":"FINISHED_TASK",
				"fromRole":"Attendee",
				"ext": {
					"type": type,
					"result": result,
					"name":usename
				}
				
			}
		break;
	}
	console.log("戴登禄明的信息============",data)
	return JSON.stringify(data);
}

export function splitUid(account){
	let str = "";
	if(account){
		str = account.split("_")[1];
		return str;
	}
}

export function sliceArray(array,account){
	let ins = 0;
	array.forEach((item,index)=>{
		if(item == account){
			ins = index;
		}
	})
	array.splice(ins,1);
	return array;
}
//设置频道属性集合
export function setChannle(key,newObj,strs){
	var obj = {
		"black":"non_access_user_list",//直播间黑名单
		"noSpeak":"non_speak_user_list",//被禁言的用户id集合
		"apply":"apply_user_list",//申请连线的用户集合
		"connected":"connected_user_list",//已连线的用户集合
		"online":"online_user_list", //在线的用户集合
		"canspeak":"can_speak",//频道内能否说话 _0_ 不可以说话 _1_表示可说话
		"canapply":"can_apply" //学员能否申请连线 _0_ 不可以 _1_ 可以 主播上线1 下线0
	}
	newObj.addChannelAttr(obj[key],strs);
	// for(var i in obj){
	// 	newObj.addChannelAttr(obj[key],strs);
	// }
}
// 学员签到签到状态
export function startsign(command, type,name,userid,taskId) {
	var data = {};
	switch(command) {
		case 'FINISHED_TASK':
		data = {
			"command": command,
		    "fromRole": "Attendee",
			"ext":{
				"type":type,
				"user":{
					"name":name,
					"id":userid
				},
				"taskId":taskId
			}	
		}
		break;
			
	}
	// console.log("发送签到活动信道信息", JSON.stringify(data));
	return JSON.stringify(data);
}


//当前时间
export function curDate(fmt){
	let date = new Date();
	var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "H+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
// 巡课状态
/**
 * @Author    wangxf
 * @DateTime  2019-01-17
 * @copyright [copyright]
 * @license   [license]
 * @version   [version]
 * @param     {[type]}    command     [LOOK_STU_STATUS]
 * @param     {[type]}    visible     [true, false]
 * @param     {[type]}    videoInput  [true, false]
 * @param     {[type]}    camerastate [true, false]
 * @param     {[type]}    name        [巡课开启人name]
 * @param     {[type]}    uid      [巡课开启人id]
 * @return    {[type]}                [description]
 */
export function tourClass(command, visible,videoInput,camerastate, stuname, stuId,timeout=false) {
	var data = {};
	switch(command) {
		case 'LOOK_STU_STATUS':
			// 点对点，给管理端
			data = {
				"command": command,
			    "fromRole": "Attendee",
				"ext":{
					"visible":visible,
					"videoInput": videoInput,
					"camerastate": camerastate,
					"timeout":timeout,
					"stu": {
						"stuname":stuname,
						"stuId": stuId
					}
					
				}	
			}
			break;
		case 'TOURCLASS_OVER':
			// 频道消息给管理端
            data = {
                "command": command,
                "fromRole": "Attendee",
                "ext": {
                    
                }
            }
            break;
			
	}
	// console.log("发送签到活动信道信息", JSON.stringify(data));
	return JSON.stringify(data);
}