const AgoraSig = require('@/sw/plugins/AgoraSig');
//定义类
class Signalclint {
    //名字，appid，频道号
    constructor(options) {
    // this关键字则代表实例对象
      this.name =options.name;
      this.appid =options.appid;
      this.commonid=options.commonid;
      this.uid=null;
      //channel类
      this.channel = null;
      //初始化session类
      this.session = null;
    }
  
    login(){
        let _this=this;
        let signal = Signal(_this.appid); // 这里填注册完后的APPID
        // 登录返回 Session对象
        let session = signal.login(_this.name, '_no_need_token'); // 用户标识id,可以自己定义。唯一就可以
        // 登录成功回调
        _this.session=session;
        session.onLoginSuccess = function(uid) {
        //    console.log(uid);
        _this.uid=uid;
        let channel= session.channelJoin('10005301');//频道号
           channel.onChannelJoined = function(){
                console.log("假如频道成功")
                 _this.channel=channel
                //  _this.getmsg()//接收频道消息

          }
           channel.onChannelJoinFailed=function(ecode){
            console.log(ecode)
          }
        }    
    }
    //接收频道消息
    getmsg(cb){
        // let _this=this
        if(this.channel){
            this.channel.onMessageChannelReceive=(account, uid, msg)=>{
                console.log("111",msg)
                cb(msg)          
                return msg;          
              }
        }
        
    }
    //发送频道消息
    sendmsg(data){
        if(this.channel){        
            this.channel.messageChannelSend(JSON.stringify(data),()=>{
                console.log("222",data)
            })
        }    
    }
}
export default Signalclint;