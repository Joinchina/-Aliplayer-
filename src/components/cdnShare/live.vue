<template>
  <div class="my_object">
    <header class="tophe">
      <img src="../../assets/img/logo.png" alt="">
    </header>
    <div class="videoplay">
      <div class="novideo" v-if="noisvideo">
        <img src="../../assets/img/bj_2.png" alt="">
        <h1>直播暂未开始～</h1>
      </div>
      <div class="video">
        <div  class="prism-player" id="J_prismPlayer"></div>
      </div>       
    </div>
    <div class="bottombox">
      <!-- 聊天 -->
      <div class="chat">
          <ul id="testDiv">
            <h1>系统消息：欢迎来到直播间。请各位老师认真听讲课积极发言。配合老师完成教学。同时禁止发送任何违法、违规、低俗等不良信息行为。</h1>
            <li v-for="(item,index) in chat_info" :key="index">
              <!-- 主播或者助教 -->
              <div class="chat_1" v-if="item.fromRole=='Broadcaster' || item.fromRole=='Assistant'">
                  <span>
                    <img src="../../assets/img/zhu.png" alt="" v-if="item.fromRole=='Broadcaster'">
                    <img src="../../assets/img/zhu1.png" alt="" v-else>
                  </span>
                    {{item.fromName}}：{{item.content}}
              </div>
              <!-- 学员信息 -->
              <div class="chat_2" v-else>
                  <span>{{item.fromName}}：</span>{{item.content}}
              </div>
            </li>
          </ul>
      </div>
      <!-- 输入框 -->
      <div class="sent">
        <input type="text" id="textinput" v-model="mysend" >
        <div class="proti" @click="inputsend" v-if="inputfont">
          <img src="../../assets/img/senti.png" alt="">
          <h2>积极发言～</h2>
        </div>
        <div class="sendbtn_1" >
          <img src="../../assets/img/chat.png" alt="" v-if="chat" class="chatbtn" @click="chatdiop">
          <img src="../../assets/img/send.png" alt="" v-else class="sendbtn" @click="sendchat">
        </div>        
      </div>
    </div> 
    <!-- 课程说明 -->
    <div class="work_box">
      <div class="work_heard">
        <h1>课程介绍</h1>
      </div>
      <h2>{{courseName}}</h2>
      <div class="work_info">
        <p>
          <img src="../../assets/img/z.png" alt="">
          <span>主讲人：{{mainTeacherName}}   </span>
        </p>
        <p>
          <img src="../../assets/img/s.png" alt="">
          <span>{{courseDate}}  {{beginTime}}－{{endDate}}  {{endTime}}</span>
        </p>
        <p>
          <img src="../../assets/img/j.png" alt="">
          <span>云课堂</span>
        </p>
      </div>
      <div class="jj">
        课程简介：{{description}}
      </div>
    </div>
    <!-- 弹窗   -->
    <!-- 验证提示 -->
    <div class="tishi" v-if="istishi">
      <h1>{{tixing}}</h1>
    </div>
  </div>
</template>

<script>
import API from '../../axios/api.js'
import '@/sw/plugins/AgoraSig.js'
import config from '@/sw/config.js'
import storg from '@/sw/storage.js'
export default {
  data () {
    return {
      chat:true,//聊天按钮
      inputfont:true,//控制输入框提示文字的显示隐藏
      mysend:'',//我发送的聊天内容
      zhu:false,
      bottomheight:'',//课程简介的高度
      timerdata:10000,//公告时间
      name:'',//直播间姓名
      endname:false,//名字输入验证结果
      chat_info:[],
      array:[],
      moheight:'',//聊天内容的默认高度
      noisvideo:true,
      videourl:'',
      videourlrtmp:'',
      liveController:null,            //控制器
      channel:'',
      acuid:"",
      Signalclint:'',//信令函数
      tixing:"不能超过100字",
      gonggao:"",//直播间公告
      beginTime: "",//课程开始时间
      courseDate: "",//开课日期
      courseName: "",//课程名
      description: "",//课程描述
      endDate: "",//结束课程日期
      endTime: "",//课程结束时间
      mainTeacherName: "",//讲师名
      videonum:0,
      istishi:false,
      jinyan:false,//禁言
      player:'',//视频播放器初始化
    }
  },
  created(){
    this.GetUrlParms()
  },
  mounted(){
      this.setHeight()
      this.setani_bottom()
      $(document).click((event)=>{
        if(event.target.className!="chatbtn"){
          $(".work_box").animate({"bottom":-this.bottomheight+"px"},500)
        }
      })
      this.getplay();
      this.liveRoomAuth();
  },

  methods:{
      
      //设置底部高度，让页面不能滑动
      setHeight(){
        let H=$(window).height();
        let topheight=$("header").height();
        let bannerheight=$(".videoplay").height();
        let sendhight=$(".sent").height();
        $(".bottombox").css({"height":""+(H-topheight-bannerheight)+"px"})
        $(".chat").css({"height":""+(H-topheight-bannerheight-sendhight-10)+"px"})
        $(".chat ul").css({"height":""+(H-topheight-bannerheight-sendhight-10)+"px"})
      },
      //设置课程简介滑动显示
      setani_bottom(){
        let getheight=$(".work_box").outerWidth();
        this.bottomheight=getheight;
        $(".work_box").css({"bottom":-getheight+"px"})
      },
      chatdiop(){
        $(".work_box").animate({"bottom":"0px"},500)
      },
      //输入框训中并发送文字
      inputsend(){
        if(this.jinyan==false){
          this.inputfont=false;
          this.chat=false;
          $("#textinput").focus();
        }else{
          this.tixing="全体禁言中~"
            this.istishi=true;
            this.closetishi();
        }       
      },
      //发送聊天内容
      sendchat(){
        if(this.mysend.length>100){
          this.istishi=true;
          return;
        }
        this.inputfont=true;
        this.chat=true;

        $("#textinput").blur();        
          this.sendmsg()
          this.closetishi()            
      },
      //自动关闭错误提示
      closetishi(){
        if(this.istishi==true){
          setTimeout(()=>{
            this.istishi=false
          },2000)
        }
      },
      //执行滚动条滚动到底部
      scrollend(){
          var div = document.getElementById('testDiv');
          $('#testDiv').animate({scrollTop:div.scrollHeight}, 800);
      },
      liveRoomAuth(){
         this.account = storg.get("myname");
         let data={
          name:this.account,
          roomCode:this.$route.query.roomCode
        }
        this.$get(API.urls.liveRoomAuth,data)
        .then(res => {
          if(res.status==200){
            let result = res.data.data.authInfo;
            let account = result.account;
            let appId = result.appId;
            this.login(account,appId)
          }
        })
      },

      //信令登录
      login(name,appId){
        // console.log(Signal)
        let _this=this;
        let roomCode =this.$route.query.roomCode;
        let signal = Signal(appId); // 这里填注册完后的APPID
        // 登录返回 Session对象
        let session = signal.login(name, '_no_need_token'); // 用户标识id,可以自己定义。唯一就可以
        // 登录成功回调
        session.onLoginSuccess = function(uid) {
           console.log(uid);
           _this.acuid=uid;
           let channel= session.channelJoin(roomCode);//频道号
           channel.onChannelJoined = function(){
                console.log("假如频道成功")
                 _this.channel=channel;
                 _this.getmsg()
          }
          channel.onChannelJoinFailed=function(ecode){
            console.log(ecode)
          }
        }    
      },
      //发送频道消息
      sendmsg(){
        //时间
        let oDate = new Date(); //实例一个时间对象；
        let year=oDate.getFullYear();   //获取系统的年；
        let month= (oDate.getMonth()+1)>=10?(oDate.getMonth()+1):'0'+(oDate.getMonth()+1);   //获取系统月份，由于月份是从0开始计算，所以要加1
        let date = oDate.getDate()>=10?oDate.getDate():'0'+oDate.getDate(); // 获取系统日，
        let hours= oDate.getHours()>=10?oDate.getHours():'0'+oDate.getHours(); //获取系统时，
        let miutes=oDate.getMinutes()>=10?oDate.getMinutes():'0'+oDate.getMinutes(); //分
        let nowdate=year+'-'+month+'-'+date+' '+hours+':'+miutes;
        let data={
                "command":"CHAT",
                "fromRole":"Audience",
                "chatMessage":{
                    avatar: "",
                    chatMessageType: "CHAT",
                    chatType: "ROOM",
                    content: this.mysend,
                    contentType: "TXT",
                    role: "Audience",
                    time: nowdate,
                }
            }
        this.channel.messageChannelSend(JSON.stringify(data),()=>{
          // console.log(data)
        })
        this.mysend='';
      },
      //接收频道消息
      getmsg(){
        let _this = this;
        this.channel.onMessageChannelReceive=(account, uid, msg)=>{
          let nowaccount=account.split('_')[0]
          let data=JSON.parse(msg)
           console.log('我是接收到的频道消息几次',data)
          //接收的聊天消息添加到聊天内容中
          if(data.command=='CHAT'&&data.chatMessage.chatMessageType=='CHAT'){
            let newobj=data.chatMessage;
            _this.$set(newobj,'fromName',nowaccount);
            _this.$set(newobj,'fromRole',data.fromRole);
            _this.chat_info.push(newobj);
            _this.scrollend();
          }
          //接收上下课的信令用来控制视频的显示和隐藏
          if(data.command=='BEGIN_CLASS'){
            this.noisvideo=false;
            this.getplay()
          }
          if(data.command=='FINISH_CLASS'){
            this.noisvideo=true;
            this.getplay()
          }
          //全体禁言
          if(data.command=="TURN_OFF_ALL_MIC"){
            this.jinyan=true;
            this.tixing="全体禁言中~"
            this.istishi=true;
            this.closetishi();
          }
          if(data.command=="TURN_ON_ALL_MIC"){
            this.jinyan=false;
            this.tixing="可以发言了~"
            this.istishi=true;
            this.closetishi();
          }           
          
        }
      },
      //接口请求视频流
      getplay(){        
        let data={
          roomCode:this.$route.query.roomCode,
          requestName: 'get_1'
        }
        this.$get(API.urls.videoplay,data)
        .then(res => {
          if(res.status==200){
            // console.log(`请求成功:`,res.data)            
            this.videourl=res.data.data.hlsPlayUrl;  //m3u8视频流
            this.videourlrtmp=res.data.data.rtmpPlayUrl;//rtmp视频流
            if(res.data.data.liveStatus=="LIVING"){
              // let myvideo='<video id="myvideo"'+ 
              //              'width="100%"'+ 
              //              'height="100%"'+ 
              //              'webkit-playsinline=true'+ 
              //              'x-webkit-airplay=true'+ 
              //              'x5-video-player-fullscreen=true'+
              //              'x5-video-ignore-metadata=true'+
              //              'x5-video-player-typ="h5"'+  
              //              'preload="auto"'+ 
              //              'playsinline=true'+ 
              //              'object-fit="file"'+
              //              'object-position="center center"'+
              //              'controls'+ 
              //              '-webkit-playsinline'+ 
              //              'webkit-playsinline'+ 
              //              'playsinline'+
              //              '>'+
              //             '</video>'
              // $('.videoplay').append(myvideo);
              // var videoSrc = res.data.data.hlsPlayUrl;//新的视频播放地址
              // document.getElementById("myvideo").src=videoSrc ;
              // document.getElementById("myvideo").play();
               this.player= new Aliplayer({
                            id: 'J_prismPlayer',
                            width: '100%',
                            height:'100%',                      
                            autoplay: true,//是否自动播放
                            playsinline:true,//H5是否内置播放
                            useH5Prism:true,//强制H5播放器
                            isLive:true,//是不是直播
                            preload:true,//播放器自动加载
                            snapshot:true,//falsh启用截图

                            // x5_type:"h5",
                            // x5_fullscreen:true,
                            // x5_video_position:'top',
                            // x5_orientation:'portraint',
                            //支持播放地址播放,此播放优先级最高
                            source :"http://liveplay.shixunbao.cn/shixunbaodev/10005276.m3u8?auth_key=1553063501-0-0-6ee8323752dea1978074e4ae1ba1edad",
                            skinLayout: [{name: "bigPlayButton", align: "blabs", x:140, y: 80}]
                  });
                this.player.on("ended", endedHandle);
                function endedHandle(){
                  this.player.player.loadByUrl( this.videourl);
                }

              this.noisvideo=false;                          
            }else{
              // $('#myvideo').remove();
              this.player.dispose();
              this.videourl='';
              this.noisvideo=true;                          
            }            
            this.beginTime=res.data.data.beginTime
            this.courseDate=res.data.data.courseDate
            this.courseName=res.data.data.courseName
            this.description=res.data.data.description
            this.endDate=res.data.data.endDate
            this.endTime=res.data.data.endTime
            this.mainTeacherName=res.data.data.mainTeacherName                 
          }           
        })
        .catch(err=>{
          console.log(err)
        })
      },
      //获取直播间的50条聊天记录
      getchat(){
        let data={
          roomCode:this.$route.query.roomCode,
          requestName: 'get_2'
        }
        this.$get(API.urls.getchat,data)
        .then(res => {
          if(res.status==200){
            console.log(`聊天信息请求成功:`,res.data.data.content) 
            this.chat_info=res.data.data.content;                        
          }           
        })
        .catch(err=>{
          alert(err)
          console.log(err)
        })
      },
      //分享url解析
      //获取url传递过来的参数
       GetUrlParms() {
        let args=new Object();
        let query=window.location.search.substring(1);//获取查询串 
        //let query='roomCode=10005301'//获取查询串 
        let pairs=query.split("&");//在&处断开 
        for(var i=0;i<pairs.length;i++) { 
          var pos=pairs[i].indexOf('=');//查找name=value 
          if(pos==-1) continue;//如果没有找到就跳过 
          var argname=pairs[i].substring(0,pos);//提取name 
          var value=pairs[i].substring(pos+1);//提取value 
          args[argname]=decodeURI(value);//存为属性 
        };

        storg.set('roomCode',args.roomCode)

          this.getchat()
          
			}

  },
}
</script>

<style lang="less" scoped>
.my_object{
/*video默认全屏按钮*/
video::-webkit-media-controls-fullscreen-button{ display: none !important; }

/*video默认aduio音量按钮*/
video::-webkit-media-controls-mute-button { display: none !important;}

/*video默认setting按钮*/
video::-internal-media-controls-overflow-button{ display: none !important;}

/*腾讯云点播禁用firefox全屏、设置按钮*/
.trump-button[sub-component="fullscreen_btn"],.trump-button[now="fullscreen"]{ display:none!important;}
.trump-button[sub-component="setting"]{ display:none !important;}

/*禁用video的controls（要慎重！不要轻易隐藏掉，会导致点击视频不能播放）*/
video::-webkit-media-controls {
  display:none !important;
}
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-image: -webkit-linear-gradient(left, #3D282A, #1F2F29);
  position: relative;
  header{
    width: 100%;
    height: 80px;
    background: #14171F;
    display: block;
    img{
      display:block;
      width: 230px;
      margin: 0 auto;
      padding-top: 14px;
    }
  }
  .videoplay{
    width: 100%;
    height: 422px;
    position: relative;
    .novideo{
      position: absolute;
      top: 0;
      left: 0;
      z-index: 9999;
      width: 100%;
      height: 422px;
      background: #14171F;
      img{
        width: 118px;
        margin: 0 auto;
        display: block;
        padding-top: 110px;
      }
      h1{
        text-align: center;
        font-size: 17px;/*no*/
        color: #FFFFFF;
        letter-spacing: 0;
        margin-top: 56px;
      }
    }
    .video{
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }
  .bottombox{
    width: 100%;
    position: relative;
    .sent{
      width: 100%;
      height: 117px;
      position: absolute;
      left: 0;
      bottom: 0;
      .proti{
        width: 556px;
        height: 82px;
        border-radius: 82px;
        position: absolute;
        top: 0;
        left: 20px;
        img{
          width: 35px;
          float: left;
          margin: 26px 14px 0 38px;
        }
        h2{
          font-size: 32px;
          color: #CCCCCC;
          letter-spacing: 0;
          line-height: 82px;
        }
      }
      input{
        width: 556px;
        height: 82px;
        border-radius: 82px;
        float: left;
        margin-left: 20px;
        background: rgba(255, 255, 255,0.11);
        color: #ffffff;
        font-size: 16px;/*no*/
        padding-left: 20px;
        padding-right: 20px;
      }
      .sendbtn_1{
        height:82px;
        width: 135px;
        float: right;
        margin-right: 20px;
        .chatbtn{
          width: 82px;
          display:block;
          margin: 0 auto;
        }
        .sendbtn{
          width: 135px;
          margin: 0 auto;
          display:block;
          margin-top: 10px;
        }
      }
    }
    .tell{
      width: 100%;
      height:140px;
      position: absolute;
      left: 0;
      top: 0px;
      background-image: linear-gradient(-180deg, #000000 0%, rgba(35,36,38,0.00) 100%);
      .tell_box{
        // width: 80%;
        background: #7400F3;
        border-top-right-radius: 31px;
        border-bottom-right-radius: 31px;
        overflow: hidden;
        z-index: 2;
        img{
          width: 51px;
          float: left;
          margin: 14px 10px 0 30px;
        }
        h1{
          float: left;
          font-size: 16px;/*no*/
          color: #EFB256;
          line-height: 62px;
        }
        h2{
          float: left;
          font-size: 16px;/*no*/
          color: #FFFFFF;
          line-height: 62px;
        }
      }
      
    }
    .chat{
      width: 100%;
      overflow: hidden;
        ul{
          width: 100%;
          overflow-y: auto;
          h1{
            font-size: 16px;/*no*/
            color: #FFE783;
            width: 90%;
             
            margin: 20px 0;
            margin-left: 5%;
          }
          li{
            overflow: hidden;
            // padding:0 36px;
            margin-bottom: 20px;
            clear: left;
            float: left;
            border-radius: 52px;
            max-width: 90%;
            margin-left: 5%;
            border-radius: 20px; 
            .chat_1{
              background-image: linear-gradient(-269deg, #070314 36%, #2B1463 100%);
              font-size: 16px;/*no*/
              color: #FD7E23;
              text-align: justify;
              line-height:52px;
              padding: 10px 20px;
              span{
                width: 90px;
                height: 41px;
                float: left;
                margin-top: 5px;
                margin-right: 10px;
                img{
                  width: 90px;;
                  display: block;
                }
              }
            }
            .chat_2{
              font-size: 15px;/*no*/
              color: #FFFFFF;
              text-align: justify;
              line-height:52px;
              background: rgba(0, 0, 0, 0.3);
               padding: 10px 20px;
              span{
                color: #F5A623;
              }
            }
          }
      }
    }
  }
  .work_box{
    width: 100%;
    overflow: hidden;
    background-color: #282B2C;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    position: absolute;
    left: 0;
    padding: 0 30px;
    .work_heard{
      width: 100%;
      border-bottom:1px solid #585858;
      h1{
        font-size: 17px;/*no*/
        color: #FFFFFF;
        line-height: 88px;
        text-align: center;
      }
    }
    h2{
      width: 100%;
      font-size: 17px;/*no*/
      color: #FFFFFF;
      letter-spacing: 0;
      line-height: 52px;
      text-align: center;
      margin-top: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .work_info{
      width: 100%;
      margin-top: 30px;
      overflow: hidden;
      p{
        clear: both;
        width: 100%;
        float: left;
        margin-bottom: 20px;
        img{
          width:33px;
          float: left;
        }
        span{
          float: left;
          font-size: 14px;/*no*/
          color: #CCCCCC;
          letter-spacing: 0;
          line-height: 34px;
          margin-left: 10px;
        }
      }
    }
    .jj{
      font-size: 15px;/*no*/
      color: #CCCCCC;
      letter-spacing: 0;
      text-align: justify;
      line-height: 46px;
      margin-bottom: 20px;
    }
  }
  .inputname{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 20;
    background: rgba(0, 0, 0, 0.5);
    .name_box{
      position: absolute;
      overflow: hidden;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      border-radius:26px;
      background-color: #ffffff;
      .name_input{
        overflow: hidden;
        border: 1px solid #D4D4D6;/*no*/
        h1{
          font-size: 16px;/*no*/
          color: #333333;
          text-align: center;
          margin: 50px auto;
        }
        input{
          width: 477px;
          height: 57px;
          margin: 0 50px;
          border: 1px solid #565656;/*no*/
          margin-bottom: 50px;
          color: #565656;
          font-size: 14px;/*no*/
          padding: 20px;
        }
        input::-webkit-input-placeholder{
        color: #dddddd;
        }
        input::-moz-placeholder{ 
                color: #dddddd;        
        }
        input:-ms-input-placeholder{ 
                color: #dddddd;        
        }
      }
      
      .leftbtn{
        width: 50%;
        float: left;
        height: 90px;
        text-align: center;
        line-height: 90px;
        font-size: 16px;/*no*/
        color: #0176FF;
      }
      .rightbtn{
       border-right: 1px solid #D4D4D6;/*no*/
      }
    }
  }
  .tishi{
    overflow: hidden;
    background-color: rgba(0, 0, 0, 1);
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%,0%);
    border-radius: 4px;
    z-index: 9999;
    h1{
      line-height: 52px;
      color: #ffffff;
      font-size: 14px;/*no*/
      padding: 10px 20px;
    }
  }
}
</style>

