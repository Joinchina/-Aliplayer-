//extends 信令
/**
 * Wrapper for Agora Signaling SDK
 * Transfer some action to Promise and use Event instead of Callback
*/

const AgoraSig = require('@/sw/plugins/AgoraSig');
import config from '../config';
import storage from '@/utils/storage'
import userObj from '@/utils/loginServer'



class signalClient{
	constructor(options){
        if(options){          
           this.options = options; 
        }
        console.log("我是=========",options)
        this.userName = userObj.curname();
        //获取当前的账号
        this.uid = storage.get("userId")?storage.get("userId"):null;
        this.account = options.name ;
         //channel类
        this.channel = null;
        //初始化session类
		this.session = null;
        //call类
        this.call = null;
        //接收消息
        this.msgCallback = null;
        // 接收活动消息
        this.msgCallbackAct = null;
        // 接收活动消息
        this.msgCallbackFlow = null;
        //接收点对点消息
        this.msgPtoPCallback = null;
        //加入直播间
        this.userJoin = null;
        //离开直播间
        this.userLeave = null;
        //获取当前状态的登录码
        this.getStatusCode = null;
	}

    static userList
    login(options){
        let _this = this;
        //sinal类
        _this.signal = Signal(options.appId);

        _this.session = _this.signal.login(this.account, config.token);
        _this.getStatusCode = _this.session.getStatus();
         //signal打印日志
        //this.checkLog(_this.signal);
        //登录成功
        _this.session.onLoginSuccess =  function(uid){
            
            _this.getStatusCode = _this.session.getStatus();
            if(options.callback){
                options.callback(_this.session);
            }
            _this.channel = _this.session.channelJoin(config.channelName);
            _this.channel.onChannelJoined = function(){
                 //频道聊天
                _this.channelChat();
                 //发送点对点
                _this.channelChatPtoP();
               
            }

             //某人加入直播间
            _this.userJoins();
            //某人离开直播间
            _this.userLeaves(); 
            //频道属性更新
            _this.channelUpdate();


            _this.channel.onChannelJoinFailed = function(ecode){
                console.log('加入频道失败', ecode);
            };
                
            _this.channel.onChannelLeaved = function(ecode){
                console.log('离开频道',ecode);
            };

            _this.channel.onChannelUserList = function(users){
                console.log('获取频道内用户列表' + users);
                signalClient.userList = users;
                console.warn(users);
            };
            if(this.checkStatus){
                _this.checkStatus(_this.getStatusCode);
            }
            
         }


         //alert(_this.signal.getStatus());
        
        //收到呼叫邀请回调 
        _this.session.onInviteReceived = function(call){
            _this.options.onInviteReceived(call).then((params)=>{
                _this.call = call;
                _this.initCall(call,params);
                params.punStr()
            })
            
        }; 

        //登出回调
        _this.session.onLoginFailed = function(ecode){
            console.warn('登出回调' + ecode);
        }
        //websocklet链接失败
        _this.session.onLogout = function(ecode){
            alert("连接失败，请刷新重试");
            console.log("websocket链接失败，请刷新页面重新登录" + ecode);
        } 
    }
    checkLoginStatus(callback){
        this.checkStatus = callback;
    }

    //某人加入直播间
    userJoins(){
        let _this = this;
        _this.channel.onChannelUserJoined = _this.userJoin;
    }
    userJoinChannel(callback){   
        this.userJoin = callback;
    }

    //某人离开直播间
    userLeaves(){
        let _this = this;
        _this.channel.onChannelUserLeaved = _this.userLeave;
    }
    userleaveChannel(callback){
        this.userLeave = callback;
    }

    //添加频道属性
    addChannelAttr(name,val){
        let _this = this;
        if(_this.channel){
            _this.channel.channelSetAttr(name, val, function(){              
                // attr name was set
                //_this.delChannelAttr("join");
                console.log("频道属性已添加");
            });
        }
    }

    //更新频道属性
    channelUpdate(){
        this.channel.onChannelAttrUpdated = this.channelAtrUpdate;
    }
    channelAttrUpdated(callback){
       this.channelAtrUpdate = callback;
    }
    //删除频道属性
    // delChannelAttr(name,val){
    //     alert(this.channel);
    //     if(this.channel){
    //         alert(555);
    //         this.channel.channelDelAttr(name, val, function(){
    //             // attr name was set
    //             alert("频道已删除");
    //         });
    //     }
    // }

    //频道接收消息
    channelChat(){
        let _this = this;
        _this.channel.onMessageChannelReceive = function(account, uid, msg){
            //接收频道消息回调设置
            _this.msgCallback(account,uid,msg)
            _this.msgCallbackAct(account, uid, msg)
            _this.msgCallbackFlow(account, uid, msg)
        }       
    }
    receiveChannelMsg(callback){
        this.msgCallback = callback;
    }
    // 接收活动消息
    receiveChannelMsgAct(callback){
        this.msgCallbackAct = callback;
    }
    receiveChannelFloMsg(callback){
        this.msgCallbackFlow = callback;
    }
    //离开频道
    leaveChanel() {
         this.channel && this.channel.channelLeave();
    }

    //发送频道聊天
    sendChannelMsg(msg){
        this.channel.messageChannelSend(msg);
    }

    //点对点聊天-初始化
    channelChatPtoP(){
        let _this = this;
        _this.session.onMessageInstantReceive = function(account, uid, msg){
            if(_this.msgPtoPCallback){
                 _this.msgPtoPCallback(account,uid,msg);
            } 
        };       
    }
    receivePtoPMsg(callback){
        this.msgPtoPCallback = callback;
    }

    //发送点对点聊天
    sendPtoPMsg(account,msg){
        this.session.messageInstantSend(account, msg);
    }

    //发送邀请
    invitatePerson(options){ 
        let extra = typeof(options.extra)=="object"?Object.assign(options.extra,{"_timeout":60*3}):{"_timeout":60*3} ;
        this.call = this.session.channelInviteUser2(config.channelName,options.account,JSON.stringify(extra));
        this.initCall(this.call,options);
    }

    //本地挂断邀请
    invitateEndBySelf(){
        this.call.channelInviteEnd();
    }
    //本地挂断邀请
    invitateRefusedBySelf(extra){
        this.call.channelInviteRefuse(extra);
    }

    //学员申请连麦
    studentApplyOnLine(msg){
        console.log("msg");
        console.log(msg);
    }

    initCall(call,options){

        call.onInviteReceivedByPeer = function(extra){
            if(options){
                options.onInviteReceivedByPeer?options.onInviteReceivedByPeer(extra):'';
            }
            //console.log('远端已收到呼叫回调' + extra);
        }

        call.onInviteAcceptedByPeer = function(extra){
            if(options){
                options.onInviteAcceptedByPeer?options.onInviteAcceptedByPeer(extra):'';
            }
            
            //console.log('远端已接收呼叫' + extra);
        }

        call.onInviteRefusedByPeer = function(extra){
            if(options){
                options.onInviteRefusedByPeer?options.onInviteRefusedByPeer(extra):'';
            }
            //console.log('对方已拒绝呼叫' + extra);
            //clear_call();
        }
            
        call.onInviteFailed = function(extra){
            alert('超时无响应')
            console.log('呼叫失败' + extra);
            //clear_call();
        }

        call.onInviteEndByPeer = function(extra){
            if(options){
                options.onInviteEndByPeer?options.onInviteEndByPeer(extra):'';
            }
            
            //console.log('对方已结束呼叫回调' + extra);
            //clear_call();
        }
            
        call.onInviteEndByMyself = function(extra){
            if(options){
                options.onInviteEndByMyself?options.onInviteEndByMyself(extra):'';
            }
            
            //console.log('本地已结束呼叫回调' + extra);
            //clear_call();
        }

        call.onInviteMsg = function(extra){
            console.log('本地已收到消息回调' + extra);
        }
    }

    //远端已收到呼叫回调
    // inviteReceivedByPeer(){
    //     this.call.onInviteReceivedByPeer = function(extra){
    //         console.log('远端已接收呼叫' + extra);
    //     }
    // }

    //远端已接受呼叫邀请
    // channelInviteAccept(){
    //     console.log("远端已接受呼叫邀请");
    //     this.call.channelInviteAccept(extra);
    // }

    // //远端已接受呼叫邀请
    // inviteAcceptedByPeer(){
    //     this.call.onInviteAcceptedByPeer = function(extra){
    //         console.log("远端已接受呼叫回调" + extra);
    //     }
    // }

    // //远端已拒绝呼叫邀请
    // channelInviteRefuse(){
    //     console.log("远端已拒绝呼叫邀请");
    //     this.call.channelInviteAccept(extra);  
    // }

    // //对方会收到拒绝回掉邀请
    // inviteRefusedByPeer(){
    //     this.call.onInviteRefusedByPeer = function(extra){
    //         console.log("对方收到拒绝邀请" + extra);
    //      }
    // }

    // //呼叫失败回掉
    // inviteFailed(){
    //     this.call.onInviteFailed = function(extra){
    //         console.log("呼叫失败回掉" + extra);
    //     }
    // }

    // //对方已结束呼叫回调
    // onInviteEndByPeer(){
    //     this.call.onInviteEndByPeer = function(extra){
    //         console.log('对方已结束呼叫回调' + extra);
    //         //clear_call();
    //     }
    // }
   
    // //本地已结束呼叫回调 
    // inviteEndByMyself(){
    //     this.call.onInviteEndByMyself = function(extra){
    //         console.log('本地已结束呼叫回调' + extra);
    //         //clear_call();
    //     }
    // }       
        
    // //本地已收到消息回调
    // inviteMsg(){
    //     this.call.onInviteMsg = function(extra){
    //         console.log('本地已收到消息回调' + extra);
    //     }
    // }

    //退出Agora信令系统
    loginOut(){
        this.session.logout();
    }


		
	

    /****获取账号列表 */
    get accountList(){
        return signalClient.userList;
    }
}


export default signalClient;






