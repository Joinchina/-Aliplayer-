/**
controller
集中管理和分发
*/

//获取常量 appId 和 cetificateId
import config from '../config';

import {liveStream} from  '../sdkextends/stream';


import signalClient from '../sdkextends/signal';






class SxbRtc{

	constructor(methods,options){

		this.methods = methods || "";

		this.defaults = {
			appId:config.appId,
			channelName:config.channelName,
			token:config.token
		}

		this.options = Object.assign(this.defaults,options);

		this.init();


		this.liveStream = this.liveStream?this.liveStream: new liveStream(options);

		this.signalClinet = new signalClient(Object.assign(this.defaults,options));

	}

	init(){

		
		if(SxbRtc.prototype.hasOwnProperty(this.methods)){
			return this[this.methods]();
		}


	}

	/*********************************音视频流入口集合*******************************/

	//上课标识获取
	haveClassFlag(){
		return this.liveStream.haveClassFlag;
	}
	//获取视频输入设备
	getVedioInput(cb){
		this.liveStream.getHostCamear(cb);
	}

	//加入直播间
	joinRoom(param,cb){

		let jionOptions = Object.assign(param,this.options);
		return this.liveStream.joinSuccess(jionOptions,cb)

	}

	setHostId(value){
		this.liveStream.hostId=value;
	}

	//播放视频流
	palyStream(stream){
		return this.liveStream.playStream(stream);
	}

	//订阅远端视频流
	subscribedStream(cb){
		this.liveStream.subscribedStream(cb);
	}

	//推流
	publish(){
		this.liveStream.publish()
	}

	//结束推流
	unpublish(){
		this.liveStream.unpublish();
	}

	//离开频道
	leavelChannel(){
		this.liveStream.leavelChannel();
	}

	// 视频轨道开启与关闭
    closeVedioHandle(flag){
        this.liveStream.closeVedioHandle(flag);
    }

    // 音频轨道开启与关闭
    closeAudioHandle(flag){
        this.liveStream.closeAudioHandle(flag);
	}
	
	//伴奏
	startAudioMixing(flag){
		this.liveStream.startAudioMixing(flag);
	}

	//切换摄像头
	switchCamera(id,success){
		this.liveStream.switchCamear(id,success);
	}

	//摄像头预览
	cameraPreview(camearId){
		return this.liveStream.cameraPreview(camearId)
	}

	//全员禁麦
	banTotalMic(cd){
		this.liveStream.banTotalMic(cd);
	}


	//屏幕共享
	screenShare(){
		this.liveStream.screenShare(this.options);
	}

	//结束屏幕共享
	closeShareScreen(){
		this.liveStream.closeShareScreen();
	}


	attachment(flag,cb){
		this.liveStream.attachment(flag,cb);
	}

	// 开启巡课
	tourclass(flag, cb) {
		this.liveStream.tourclass(flag, cb);
	}
	
	//调节远端流音量
	changeHostVolume(stream,vol){
		this.liveStream.changeHostVolume(stream,vol);
	}

	//获取分辨率
	getImageQuality(){
		return	this.liveStream.resolution;
	}
	//设置分辨率
	setImageQuality(q){
		this.liveStream.imageQuality=q;
	}

	//用户列表
	getAccountList(){
		return this.signalClinet.accountList;
	}

	shareScreenC(){
		this.liveStream.shareScreen();
	}

	leaveNoPub(cb){
		this.liveStream.leaveNoPub(cb)
	}

	//设置连线分辨率
	setConnectQuality(q){
		this.liveStream.ConnectQuality=q;
	}

	//获取是够允许摄像头权限
	getPermissions(){
		return this.liveStream.getPermissions;
	}
	
	//主播本地流数据
	getLocalStreamStates(cb) {
        this.liveStream.getLocalStreamStates(cb, cb);
    }
	// 获取媒体设备
	getDevicesW() {
		return this.liveStream.getDevicesW()
	}









  









































	/*********************************信令方法入口集合*******************************/
	login(options){
		this.signalClinet.login(options);
	}
	checkLoginStatus(callback){
        this.signalClinet.checkLoginStatus(callback);
    }
	//某人加入直播间
	userJoinChannel(callback){
		this.signalClinet.userJoinChannel(callback);
	}

	//某人离开直播间
	userleaveChannel(callback){
		this.signalClinet.userleaveChannel(callback);
	}

	//接收消息
	receiveChannelMsg(callback){
		this.signalClinet.receiveChannelMsg(callback);
	}

	//送花接收消息
	receiveChannelFloMsg(callback){
		this.signalClinet.receiveChannelFloMsg(callback);
	}
	//答题接收消息
	receiveChannelMsganswer(callback){
		this.signalClinet.receiveChannelMsganswer(callback);
	}
	//接收活动消息
	receiveChannelMsgAct(callback){
		this.signalClinet.receiveChannelMsgAct(callback);
	}

	//发送频道消息
	sendChannelMsg(msg){
	 	this.signalClinet.sendChannelMsg(msg);
 	}

 	//发送点对点消息
 	sendPtoPMsg(account, msg){
 		this.signalClinet.sendPtoPMsg(account, msg);
 	}

 	//接收点对点消息
 	receivePtoPMsg(callback){
 		this.signalClinet.receivePtoPMsg(callback);
 	}

 	//申请连线
	invitatePerson(options){	
		this.signalClinet.invitatePerson(options);
	}

	//本地挂断连线
	invitateEndBySelf(){
		this.signalClinet.invitateEndBySelf();
	}
	//本地拒绝连线
	invitateRefusedBySelf(extra){
		this.signalClinet.invitateRefusedBySelf(extra);
	}

	studentApplyOnLine(msg){
		this.signalClinet.studentApplyOnLine(msg);
	}

	//添加频道属性
	addChannelAttr(name,val){
		this.signalClinet.addChannelAttr(name,val);
	}

	//更新频道属性
	channelAttrUpdated(callback){
		this.signalClinet.channelAttrUpdated(callback);
	}

	//离开频道
	leaveChanel(){
		this.signalClinet.leaveChanel();
	}
	delChannelAttr(name,val){
		this.signalClinet.delChannelAttr(name,val);
	}


	


}


export default SxbRtc;



