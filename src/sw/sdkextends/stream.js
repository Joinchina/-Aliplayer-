/***
声网sdk公用方法抽象
音视频流公用抽象
**/

export function joinRoom(options){
	console.log("options");
	console.log(options);
}


import AgoraRTC from "agora-rtc-sdk";
import config from '../config';
import storage from '@/utils/loginServer'
class liveStream {

    constructor(option){
        this.getDevices();
        option?this.options = option:"";
    }

    static client=null;  //客户端

    static channel_key;

    static hostStream;   //主播音视频流

    static audioAevicesArr = []   //音频输入设备

    static vedioAevicesArr = []     //视频输入设备

    static liveFlag = true          //设置直播(true)/屏幕共享(false)

    totalStreamArr = []   //音视频流集合

    static playAreaId = 'liveItem'  //播放流的元素基础id

    static tourclass = false  //是否开启巡课

    static usedCamera = ''          //正在使用的摄像头

    static attachmentFlag = false   //连线标志

    haveClass = false               //上课标识

    resolution = '720p'           //分辨率

    connectResolution = '240p'  //连线分辨率

    permissions="requesting"               //摄像头，麦克风权限

    //设置分辨率
    // set imageQuality(value){
    //     if(value!==this.resolution){
    //         liveStream.hostStream.stop();
    //         this.resolution = value;
    //         this.liveHostHandle(this.uid);
    //         this.playStream(liveStream.hostStream);
    //     }
        
    // }

    //设置连线分辨率
    set ConnectQuality(value){
        if(value!==this.connectResolution){
            this.connectResolution = value;
            console.log('%c'+this.connectResolution,'background:red;color:#fff;font-size:20px;');
        }
        
    }
    getDevicesW() {
        return new Promise((resolve, reject) => {
            AgoraRTC.getDevices ((devices)=> {
                resolve(devices);
            });
        })
    }
    //获取用户是否允许权限
    get getPermissions(){
        return this.permissions
    }

    //获取上课标识
    get haveClassFlag(){
        return this.haveClass
    }

    //获取媒体源
    getDevices(){
        AgoraRTC.getDevices(devices=>{
            liveStream.devicesArr=devices;
            devices.forEach(element => {
                element.kind=='audioinput'?liveStream.audioAevicesArr.push(element):element.kind=='videoinput'?liveStream.vedioAevicesArr.push(element):'';
            });
        });
    }
    
    /**
     * @description 加入房间  包含创建client->加入频道->根据options.liveFlag判断是否为主播
     * @param {Object} options  包含频道名，是否为主播等等的对象
     * @param {Function} success    加入频道成功后执行的回调
     */
    joinSuccess(options,success){
        // options,success
        let _this = this;
        
        return new Promise((resolve,reject)=>{
            _this.createClient(()=>{
                liveStream.joinChannel(config.channelName,(uid)=>{
                    // if(liveStream.audioAevicesArr.length<1){
                    //     console.warn('未检测到输入设备');
                    //     return
                    // }
                    resolve()
                    // liveStream.liveFlag = options.liveFlag;
                    options.liveFlag?typeof(success)=="function"?success(_this.liveHostHandle(uid)):'':"";
                });
            })
        })


    }

    //创建并初始化client
    createClient(success){
        let _this = this;
        liveStream.client = AgoraRTC.createClient({
            mode: 'live',
            codec: "vp8"
        });
        let callback = success||function(){};
        let initHandler = liveStream.client.init;
        if(initHandler){
            initHandler(config.appId,()=>{
                console.log("AgoraRTC client initialized");
                callback();
            },(err)=>{
                this.$message.error('client初始化失败');
            })
        }

        let channelKey = "";
        liveStream.client.on('error', function(err) {
            console.log("Got error msg:", err.reason);
            if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
                liveStream.client.renewChannelKey(channelKey, function(){
                    console.log("Renew channel key successfully");
                }, function(err){
                    console.log("Renew channel key failed: ", err);
                });
            }
        });


        liveStream.client.on('stream-added', function (evt) {
            let stream = evt.stream;
            console.log("New stream added: " + stream.getId());
            console.log("Subscribe ", stream);
            liveStream.client.subscribe(stream, function (err) {
                console.log("Subscribe stream failed", err);
            });
        });
        liveStream.client.on('liveStreamingStopped', function (evt) {
            let stream = evt.stream;
            console.warn(stream+"推流已停止");
        });
        liveStream.client.on("networkTypeChanged", function(evt) {
            console.warn("Network Type Changed to", evt.networkType);
        });

        //成功接收远端流
        

        //对方结束推流
        liveStream.client.on('stream-removed', function (evt) {
            let stream = evt.stream;
            stream.isPlaying()?stream.stop():"";
            $('#'+liveStream.playAreaId + stream.getId()).remove();
            console.log("Remote stream is removed " + stream.getId());
            console.log(_this.options.hostUid)
            if(stream.getId()==_this.options.hostUid){
                console.log('主播下课了');
                if(liveStream.hostStream){
                    _this.unpublish();
                    liveStream.hostStream.close();
                    $('#'+liveStream.hostStream.playAreaId + liveStream.hostStream.getId()).remove();
                    _this.leaveNoPubCb();
                }
                _this.leaveNoPubCb();
                _this.haveClass = false;
            }
        });

        //有人离开直播间
        liveStream.client.on('peer-leave', function (evt) {
            let stream = evt.stream;
            if (stream) {
                stream.stop();
                $('#'+liveStream.playAreaId + stream.getId()).remove();
                console.log(evt.uid + " leaved from this channel");
                console.log(_this.options.hostUid)
                if(stream.getId()==_this.options.hostUid){
                    console.log('主播下课了');
                    if(liveStream.hostStream){
                        _this.unpublish();
                        liveStream.hostStream.close();
                        $('#'+liveStream.hostStream.playAreaId + liveStream.hostStream.getId()).remove();
                        _this.leaveNoPubCb();
                    }
                    
                    _this.haveClass = false;
                }
            }
        });
    }
    set hostId(value){
        this.options.hostUid =  value;
    }

    leaveNoPub(cb){
        this.leaveNoPubCb = cb;
    }

    //订阅远端流之后的回调
    subscribedStream(success){
        let _this = this;
        liveStream.client.on('stream-subscribed', function (evt) {
            let originStream = evt.stream;
            if(evt.uid == _this.options.hostUid);
                _this.haveClass = true;
            originStream.liveHost=false;
            originStream.playAreaId = liveStream.playAreaId;

            let returnStream ={
                playAreaId: originStream.playAreaId,
                liveHost: originStream.liveHost,
                play: originStream.play,
                getId: originStream.getId,
                setAudioVolume: originStream.setAudioVolume
            }
            _this.totalStreamArr.push(originStream);
            typeof(success)=="function"?success(returnStream):""
            setTimeout(()=>{
                if(document.querySelector("#liveItem" + originStream.getId()) != null){
                    originStream.play(returnStream.playAreaId+originStream.getId(),{fit: 'contain'});
                    let videoTag = document.querySelector('#video'+originStream.getId());
                    videoTag.controls=true; 
                    videoTag.onloadstart=()=>{
                        console.warn(111);
                    }
                    videoTag.oncanplay=()=>{
                        console.warn(videoTag.readyState );
                        // returnStream.autoplayFailed=true;
                    }
                    videoTag.onplay=()=>{
                        console.warn(videoTag.paused)
                        videoTag.controls=false;
                    }
                }
                
            },500)
            // setInterval(()=>{
            //     _this.getRemoteStreamStates();
            // },5000)
        });
    }

    streamRemoved(cb){
        
    }

    //加入频道
    static joinChannel(channel,success){
        // console.warn(storage.curUserId());  storage.curUserId()：用户id
        console.log(Number(storage.curUserId()));
        liveStream.client.join(liveStream.channel_key, channel, Number(storage.curUserId()), (uid)=>{
            console.log("User " + uid + " join channel successfully");
            liveStream.uid = uid;
            typeof(success)=="function"?success(uid):'';
        },(err)=>{
            console.log("AgoraRTC join channel failed", err);
        })
    }

    //播放视频流
    playStream(stream){
        let _this = this;
        return new Promise((resolve,reject)=>{
            //本地流的播放
            stream.bigScreen = true;
            stream.play(stream.playAreaId + stream.getId(), {fit: 'contain'});
            resolve()
        })
        
    }

    //推流
    publish(){
        let _this = this;
        let reconnectCount = 0;
        if(liveStream.client){
            try {
                liveStream.client.publish(liveStream.hostStream, function (err) {
                    // _this.unpublish();
                    // _this.publish();
                    console.log("Publish local stream error: " + err);
                });
            } catch (error) {
                reconnectCount++
                if(reconnectCount<5){
                    setTimeout(()=>{
                        _this.unpublish();
                        _this.publish();
                        
                    },1000)
                }else{
                    reconnectCount=0;
                }
                
                console.warn("The push stream failed and an attempt is being made to repush the stream");
            }
        }
        
    }

    //结束推流
    unpublish() {
        liveStream.client.unpublish(liveStream.hostStream, function (err) {
            console.log("Unpublish local stream failed" + err);
        });
        setTimeout(()=>{
            if(liveStream.hostStream)
                typeof(liveStream.hostStream.close) == 'function'?liveStream.hostStream.close():'';
            $('#'+liveStream.playAreaId + liveStream.hostStream.getId()).remove();
        },500);
        // liveStream.hostStream.stop();
        // $('#'+liveStream.playAreaId + liveStream.hostStream.getId()).remove();
    }

    //离开频道
    leavelChannel(){
        // typeof(liveStream.hostStream.close)=='function'?liveStream.hostStream.close():'';
        liveStream.client.leave(function () {
            console.log("Leavel channel successfully");
        }, function (err) {
            console.log("Leave channel failed");
        });
    }
    //直播模式
    liveHostHandle(uid){
        let _this = this;
        this.uid = uid;
        _this.permissions="requesting"
        /***********创建视频流配置  API:https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/web/interfaces/agorartc.streamspec.html*/
        liveStream.usedCamera = String(liveStream.usedCamera).trim()!=""?liveStream.usedCamera:liveStream.vedioAevicesArr[0]?liveStream.vedioAevicesArr[0]:'';

        let hostStreamConfig ={
            streamID: uid,
            audio: true,
            cameraId: liveStream.usedCamera.deviceId,
            microphoneId: liveStream.audioAevicesArr[0]?liveStream.audioAevicesArr[0].deviceId:'',
            video: true,
            screen: false
        }
        let ownStream = AgoraRTC.createStream(hostStreamConfig);
        liveStream.hostStream = ownStream;
        // console.warn('当前分辨率：'+this.resolution+'-----------'+liveStream.usedCamera);
        /*******************设置直播分辨率    API：https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/web/interfaces/agorartc.stream.html#setvideoprofile*/
        liveStream.hostStream.setVideoProfile(this.connectResolution);

        //主播标识
        liveStream.hostStream.liveHost=true;
        
        /************监听用户允许获取摄像头和麦克风权限 */
        liveStream.hostStream.on("accessAllowed", ()=>{
            _this.permissions = "allowed";
            console.log("accessAllowed");
        });

         /************监听用户拒绝获取摄像头和麦克风权限 */
        liveStream.hostStream.on("accessDenied", ()=>{
            _this.permissions = "denied";
            console.log("accessDenied");
        });
        liveStream.hostStream.playAreaId = liveStream.playAreaId;

        liveStream.client.on('stream-published', (evt)=>{
            console.log("Publish local stream successfully");
        });
        let returnStream = {
            playAreaId: liveStream.hostStream.playAreaId,
            getId: liveStream.hostStream.getId,
            play: liveStream.hostStream.play,
            liveHost: liveStream.hostStream.liveHost,
            init: liveStream.hostStream.init,
            usedCamera: liveStream.usedCamera,
            setAudioVolume:liveStream.hostStream.setAudioVolume
        }

        if(liveStream.attachmentFlag){
            liveStream.hostStream.init(()=>{
                liveStream.client.publish(liveStream.hostStream, function (err) {
                    console.log("Publish local stream error: " + err);
                    if(err=="STREAM_ALREADY_PUBLISHED"){
                        liveStream.client.unpublish(liveStream.hostStream, function (err) {
                            // _this.unpublish();
                            // _this.publish();
                            console.log("unPublish local stream error: " + err);
                        });
                    }
                });
            },(err)=>{
                if (err == "NO_CAMERA_PERMISSION"||err.msg=="NotAllowedError") {
                    // console.error('有其他设备正在占用摄像头和麦克风，请关闭后刷新并重新加入频道！');
                    this.permissions = "denied";
                }else if(err.msg&&err.msg=="NotReadableError"){
                    this.permissions = "NotReadable";
                }
                console.log("getUserMedia failed", err);

            })
            
        //     // console.log(liveStream.hostStream);
        //     // return returnStream
        //     setTimeout(()=>{
        //         liveStream.client.publish(liveStream.hostStream, function (err) {
        //             console.log("Publish local stream error: " + err);
        //         });
        //     },1000)
            
        }
        return returnStream
    }

    //巡课模式
    liveTourClassHandle(uid,flag){
        let _this = this;
        this.uid = uid;
        _this.permissions="requesting"   //摄像头，麦克风权限
        /***********创建视频流配置  API:https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/web/interfaces/agorartc.streamspec.html*/
        liveStream.usedCamera = String(liveStream.usedCamera).trim()!=""?liveStream.usedCamera:liveStream.vedioAevicesArr[0]?liveStream.vedioAevicesArr[0]:'';
        let hostStreamConfig ={
            streamID: uid,
            audio: false,
            cameraId: liveStream.usedCamera.deviceId,   // 摄像头ID
            microphoneId: liveStream.audioAevicesArr[0]?liveStream.audioAevicesArr[0].deviceId:'',  // 麦克风设备ID
            video: true,
            screen: false,
        }
        let ownStream = AgoraRTC.createStream(hostStreamConfig);
        liveStream.hostStream = ownStream;
        // console.warn('当前分辨率：'+this.resolution+'-----------'+liveStream.usedCamera);
        /*******************设置直播分辨率    API：https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/web/interfaces/agorartc.stream.html#setvideoprofile*/
        liveStream.hostStream.setVideoProfile(this.connectResolution);
        //主播标识
        liveStream.hostStream.liveHost=true;
        
        /************监听用户允许获取摄像头和麦克风权限 */
        liveStream.hostStream.on("accessAllowed", ()=>{
            _this.permissions = "allowed";
            console.log("accessAllowed");
        });
         /************监听用户拒绝获取摄像头和麦克风权限 */
        liveStream.hostStream.on("accessDenied", ()=>{
            _this.permissions = "denied";
            console.log("accessDenied");
        });
        liveStream.hostStream.playAreaId = liveStream.playAreaId;
        liveStream.client.on('stream-published', (evt)=>{
            console.log("Publish local stream successfully");
        });
        liveStream.tourclass = flag; // 是否开启巡课
        let returnStream = {
            playAreaId: liveStream.hostStream.playAreaId,
            getId: liveStream.hostStream.getId,
            play: liveStream.hostStream.play,
            liveHost: liveStream.hostStream.liveHost,
            init: liveStream.hostStream.init,
            usedCamera: liveStream.usedCamera,
            tourclass: liveStream.tourclass
        }
        liveStream.hostStream.init(()=>{
            liveStream.client.publish(liveStream.hostStream, function (err) {
                console.log("Publish local stream error: " + err);
            });
        },(err)=>{
            if (err == "NO_CAMERA_PERMISSION") {
                // console.error('有其他设备正在占用摄像头和麦克风，请关闭后刷新并重新加入频道！');
                this.permissions = "denied";
            }
            console.log("getUserMedia failed", err);
        })
        return returnStream
    }


    // 视频轨道开启与关闭
    closeVedioHandle(flag){
        flag?liveStream.hostStream.disableVideo():liveStream.hostStream.enableVideo();
    }

    // 音频轨道开启与关闭
    closeAudioHandle(flag){
        flag?liveStream.hostStream.disableAudio():liveStream.hostStream.enableAudio();
    }
    //获取远端视频&音频流信息
    getLocalStreamStates(success){
        let streamStates = new Object();
        // liveStream.client.getRemoteVideoStats((states)=>{
        //     streamStates.RemoteVideo =states;
        // })
        // liveStream.client.getRemoteAudioStats((states)=>{
        //     streamStates.RemoteAudio =states;
        // })
        // liveStream.client.getTransportStats((states)=>{
        //     streamStates.TransportStats =states;
        // })
        liveStream.client.getLocalAudioStats((states)=>{
            streamStates.LocalAudio =states;
        })
        liveStream.client.getLocalVideoStats((states)=>{
            streamStates.LocalVideo =states;
        })
        typeof(success)=="function"?success(streamStates):"";
    }
    // 设置混响
    startAudioMixing(flag){
        if(flag&&liveStream.hostStream){
            liveStream.hostStream.startAudioMixing({
                //cycle:1,        //伴奏循环次数
                filePath:"../../assets/music/故乡的原风景.mp3",    //文件路径
                loop:true,       //是否无限循环
                playTime: 0,     //设置音频文件开始播放的时间位置，单位为 ms。
                replace: false   //是否要用音频文件替换本地音频流
            },function(info){
                console.log(info?info:'playing AudioMixing successfully');
            })
        }else if(!flag&&liveStream.hostStream){
            liveStream.hostStream.stopAudioMixing();
        }
       
    }

    //获取摄像头

    /**
     * 
     * @param {Function} success 获取摄像头成功后的回调
     */
    getHostCamear(success){
        liveStream.client.getCameras(function(res){
            typeof(success)=='function'?success(res):'';
        })
    }
    

    //连线
    /**
     * 
     * @param {Boolean} flag 连线标识
     * @param {Function} success 成功回调
     */
    attachment(flag,success){
        if(flag){
            liveStream.liveFlag = true
            liveStream.attachmentFlag = true;
            let res = this.liveHostHandle(liveStream.uid)
            typeof(success)=='function'?success(res):'';
        }else{
            this.unpublish();
            if(liveStream.hostStream)
                    typeof(liveStream.hostStream.close) == 'function'?liveStream.hostStream.close():'';
            $('#'+liveStream.playAreaId + liveStream.hostStream.getId()).remove();
            // setTimeout(()=>{
            //     if(liveStream.hostStream)
            //         typeof(liveStream.hostStream.close) == 'function'?liveStream.hostStream.close():'';
            //     $('#'+liveStream.playAreaId + liveStream.hostStream.getId()).remove();
            //     liveStream.hostStream = null;
            // },500);
            
            success();
        }
        
    }
    //摄像头预览
    cameraPreview(cameraId){
        let _this = this;
        return new Promise((resolve,reject)=>{
            
            let uid = _this.uid;
            /***********创建视频流配置  API:https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/web/interfaces/agorartc.streamspec.html*/
            let hostStreamConfig ={
                streamID: uid,
                audio: true,
                cameraId: cameraId,
                microphoneId: liveStream.audioAevicesArr[0]?liveStream.audioAevicesArr[0].deviceId:'',
                video: liveStream.liveFlag,
                screen: !liveStream.liveFlag
            }
            let previewStream = AgoraRTC.createStream(hostStreamConfig);
            console.warn('当前分辨率：'+this.resolution+'-----------'+liveStream.usedCamera);
            /*******************设置直播分辨率    API：https://docs.agora.io/cn/Interactive%20Broadcast/API%20Reference/web/interfaces/agorartc.stream.html#setvideoprofile*/
            previewStream.setVideoProfile(this.resolution);
            previewStream.liveHost = true;
            previewStream.playAreaId = "previewItem";
            previewStream.init(()=>{
                $("#camerapreShow").empty();
                setTimeout(()=>{
                    previewStream.play("camerapreShow",{fit: 'contain'});
                },200)
            })
            
            // liveStream.hostStream.play('barrageBox',{fit: 'contain'})
        })
    }
    /**
     * 开启巡课
     * @Author    wangxf
     * @DateTime  2019-01-16
     * @copyright [copyright]
     * @license   [license]
     * @version   [version]
     * @param     {[type]}    flag    [description]
     * @param     {[type]}    success [description]
     * @return    {[type]}            [description]
     */
    tourclass(flag,success){
        if(flag){
            liveStream.liveFlag = true      //设置直播
            liveStream.attachmentFlag = true;  // 连线标志
            let res = this.liveTourClassHandle(liveStream.uid, flag)
            typeof(success)=='function'?success(res):'';
        }else{
            this.unpublish();
            success();
        }
        
    }

    //调节远端流音量
    /**
     * 
     * @param {Object} stream 需要调节音量的远端流
     * @param {Number} vlo 音量大小  0-100
     */
    changeHostVolume(stream,vlo){
        if(Array.isArray(stream)){
            stream.forEach(item=>{
                item.setAudioVolume(Number(vlo));
            })
        }
        // if(stream){
        //     this.totalStreamArr.forEach(item=>{
        //         if(stream.getId() ==item.getId() ){
        //             item.setAudioVolume(Number(vlo));
        //             return false
        //         }
        //     })
            
        // }
    }

    //获取网络信息--网络类型
    getNetworkStats(){
        liveStream.client.getNetworkStats((states)=>{
            let networkType = '';
            switch(states.NetworkType){
                case "UNSUPPORTED":
                    networkType = "浏览器不支持获取网络类型";
                break

                case "bluetooth":
                    networkType = "蓝牙网络";
                break

                case "cellular":
                    networkType = "蜂窝移动数据网络";
                break

                case "ethernet":
                    networkType = "以太网";
                break

                case "none":
                    networkType = "没有网络";
                break

                case "wifi":
                    networkType = "Wi-Fi";
                break

                case "wimax":
                    networkType = "WiMax";
                break

                case "other":
                    networkType = "其他网络类型";
                break

                case "unknown":
                    networkType = "未知网络类型";
                break
            }
            console.log('%c当前网络类型：'+networkType,"background:black;color:#fff;font-size:20px;")
        })
    }

    //获取远端视频&音频流信息
    getRemoteStreamStates(){
        console.warn('测试远端流数据')
        // liveStream.client.getRemoteVideoStats((states)=>{
        //     console.warn(states);
        // })
        // liveStream.client.getRemoteAudioStats((states)=>{
        //     console.warn(states);
        // })
        liveStream.client.getTransportStats((states)=>{
            console.warn(states);  //获取延时
        })
        
    }

    //分辨率+帧率=>视频属性
    setVideoProfile(resolution,fps){
        let result = null;
        let myResolution = resolution.replace(/\s+/g,'')
        switch (myResolution) {
            case "160*120":
                switch(Number(fps)){
                    case 15:
                        result ='120p';
                        break;
                }
                break;
            case "120*120":
                switch(Number(fps)){
                    case 15:
                        result ='120p_3';
                    break;
                }
            break;
            case "320*180":
                switch(Number(fps)){
                    case 15:
                        result ='180p';
                    break;
                }
            break;
            case "180*180":
                switch(Number(fps)){
                    case 15:
                        result ='180p_3';
                    break;
                }
            break;
            case "240*180":
                switch(Number(fps)){
                    case 15:
                        result ='180p_4';
                    break;
                }
            break;
            case "320*240":
                switch(Number(fps)){
                    case 15:
                        result ='240p';
                    break;
                }
            break;
            case "240*240":
                switch(Number(fps)){
                    case 15:
                        result ='240p_3';
                    break;
                }
            break;
            case "424*240":
                switch(Number(fps)){
                    case 15:
                        result ='240p_4';
                    break;
                }
            break;
            case "640*360":
                switch(Number(fps)){
                    case 15:
                        result ='360p';
                    break;
                    case 30:
                        result ='360p_4';
                    break;
                }
            break;
            case "360*360":
                switch(Number(fps)){
                    case 15:
                        result ='360p_3';
                    break;
                    case 30:
                        result ='360p_6';
                    break;
                }
            break;
            case "480*360":
                switch(Number(fps)){
                    case 15:
                        result ='360p_7';
                    break;
                    case 30:
                        result ='360p_8';
                    break;
                }
            break;
            case "640*360":
                switch(Number(fps)){
                    case 15:
                        result ='360p_9';
                    break;
                    case 24:
                        result ='360p_10';
                    break;
                }
            break;
            case "640*480":
                switch(Number(fps)){
                    case 10:
                        result ='480p_10';
                    break;
                    case 15:
                        result ='480p';
                    break;
                    case 30:
                        result ='480p_2';
                    break;
                }
            break;
            case "480*480":
                switch(Number(fps)){
                    case 15:
                        result ='480p_3';
                    break;
                    case 30:
                        result ='480p_6';
                    break;
                }
            break;
            case "848*480":
                switch(Number(fps)){
                    case 15:
                        result ='480p_8';
                    break;
                    case 30:
                        result ='480p_9';
                    break;
                }
            break;
            case "1280*720":
                switch(Number(fps)){
                    case 15:
                        result ='720p';
                    break;
                    case 30:
                        result ='720p_3';
                    break;
                }
            break;
            case "960*720":
                switch(Number(fps)){
                    case 15:
                        result ='720p_5';
                    break;
                    case 30:
                        result ='720p_6';
                    break;
                }
            break;
            case "1920*1080":
                switch(Number(fps)){
                    case 15:
                        result ='1080p';
                    break;
                    case 30:
                        result ='1080p_2';
                    break;
                    case 60:
                        result ='1080p_5';
                    break;
                }
            break;
            case "2560*1440":
                switch(Number(fps)){
                    case 30:
                        result ='1440p';
                    break;
                    case 60:
                        result ='1440p_2';
                    break;
                }
            break;
            case "3840*2160":
                switch(Number(fps)){
                    case 30:
                        result ='4K';
                    break;
                    case 60:
                        result ='4K_3';
                    break;
                }
            break;
        
            default:
                result ='720p';
                break;
        }

        return result
    }

    //屏幕共享
    shareScreen(){
        let screenStream = AgoraRTC.createStream({
            streamID: liveStream.uid,
            audio: true, // 设置屏幕共享不带音频，避免订阅端收到的两路流中都有音频，导致回声
            video: false,
            screen: true,
            // Chrome
            extensionId: 'minllpmhdgpndnkomcoccfekfegnlikg',
            // // Firefox
            // mediaSource: 'window' // 'screen', 'application', 'window'
        });
        screenStream.init(function(){
            let newVideoTrack = screenStream.getVideoTrack();
            // screenStream.play(liveStream.playAreaId + screenStream.getId(), {fit: 'contain'})
            liveStream.hostStream.replaceTrack(newVideoTrack);
        });
    }















































    //屏幕共享
    screenShare(options){

        //结束本地视频推流
        this.unpublish();

        var key = config.appId;
        var channel = config.channelName;
        var channelKey = null;

        AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.INFO);

        var localStreams = [];

        liveStream.screenClient = AgoraRTC.createClient({mode: "live", codec: "vp8"});

        liveStream.screenClient.init(key, function() {

            liveStream.screenClient.join(channelKey, channel, null, function(uid) {

                // 创建屏幕共享流
                liveStream.screenStream = AgoraRTC.createStream({
                    streamID: uid,
                    audio: false, // 设置屏幕共享不带音频，避免订阅端收到的两路流中都有音频，导致回声
                    video: false,
                    screen: true,
                    // Chrome
                    extensionId: 'minllpmhdgpndnkomcoccfekfegnlikg',
                    // // Firefox
                    // mediaSource: 'window' // 'screen', 'application', 'window'
                });

                // 初始化流
                liveStream.screenStream.init(function() {
                                   
                    // 播放流
                    liveStream.screenStream.play('agora_local');

                    // 推流
                    liveStream.screenClient.publish(liveStream.screenStream);

                    // 监听流（用户）加入频道事件
                    liveStream.screenClient.on('stream-added', function(evt) {
                            var stream = evt.stream;
                            var uid = stream.getId();

                            // 收到流加入频道的事件后，先判定是不是本地的uid
                            if(!localStreams.includes(uid)) {
                                console.log('subscribe stream:' + uid);
                                // 拉流
                                screenClient.subscribe(stream);
                            }
                    })

                }, function (err) {
                  console.log(err);
                });

                }, function (err) {
                  console.log(err);
                })
        });

    }

    //结束屏幕共享
    closeShareScreen(){

        console.log("结束");
        console.log(liveStream.screenClient);

        console.log("kll");
        console.log(liveStream.screenStream);
        //结束屏幕共享推流
         liveStream.screenClient.unpublish(liveStream.screenStream);

    }
    
}


export {liveStream};
