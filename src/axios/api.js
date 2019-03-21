'use strict'
import utils from '../assets/utils/utils';
let api = "";
if(process.env.NODE_ENV === "development" || utils.host().indexOf("10.98.24.67")>-1) {
	api = 'https://10.98.24.67:10003'
}else{
	api = 'https://magr.shixunbao.cn:11113'
}

let WEB_CONFIG = {
	intServiceReqTimeout: 30000,
	accessflag: new Date().getTime(),  //随机标签

	urls: {
		videoplay:api+'/api/liveroom/live/info',//视频流播放接口
		getchat:api+'/api/liveroom/chat/record/latest',//获取直播间50条聊天记录
		signUpInfo:api+'/api/signupuser/view/set',//获取班级报名设置信息 
        sms :api+'/api/sms/',//验证码  
        checkPhone: api+'/api/signupuser/check/phone', //检查手机号是否能报名
        infoSubmit: api+'/api/signupuser/info/submit', //学员提交报名信息
        liveRoomAuth:api + '/api/liveroom/auth', //获取appId
		infoStudentSignUp: api+'/api/signupuser/info/view', //查看学员的报名详细信息
		saveBusiness: api+'/api/businessRelationUser/save', //保存商务联系
		
	}

}

export default WEB_CONFIG;