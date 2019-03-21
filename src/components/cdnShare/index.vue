<template>
	<div>
		<div class="my_object">
			<!-- 弹窗   -->
		    <div class="inputname" v-if="name_input">
		      <div class="name_box">
		        <div class="name_input">
		          <h1>请输入名字</h1>
		          <input type="text" v-model="name" placeholder="12个字以内" @change="namechange">
		        </div>
		        <!-- <div class="leftbtn rightbtn" @click="getname('cancel')">
		          取消
		        </div> -->
		        <div class="leftbtn" @click="getname('ensure')">
		          确定
		        </div>
		      </div>
		    </div>
		    <!-- 验证提示 -->
		    <div class="tishi" v-if="istishi">
		      <h1>{{tixing}}</h1>
		    </div>
		</div>
	</div>
</template>

<script type="text/javascript">
import storg from '@/sw/storage.js'
	export default{
		data(){
			return{
				name_input:true,//输入名字
				name:"",
				tixing:"",
				istishi:false
			}
		},
		computed:{
			roomCode(){
				return this.$route.query.roomCode;
			}
		},
		methods:{
			namechange(){
				    this.name=this.name.replace(/\s+/g, "")//如果用户输入是空格则去掉
		        if(this.name.length>12 || this.name.length==0){
		          $(".name_input input").css("color","red")
		          this.endname=false;
		        }else{
		          $(".name_input input").css("color","#565656")
		          this.endname=true;
		        }
	        },
	        //姓名验证，点击取消提示必须输入姓名
		    getname(val){
		        //输入姓名验证
		        //alert(this.endname)
		        if(this.name == ""){
		        	this.istishi=true;
		        	this.closetishi()
		        	this.tixing="请输入输入名字";
		        	return;
		        }
		        if(this.endname==false){
		            this.istishi=true;
		            this.closetishi()
		            this.tixing="字数超过限制12";
		          return
		        }else{
		          if(val=='ensure'){
								//确定						
		            this.name_input=false;
								storg.set('myname',this.name)
								setTimeout(()=>{
									this.$router.push({
										path:"/live",
										query:{
											roomCode:this.roomCode
										}
									}); 
								},500)		                            
		          }
		        }        
		     },
		      //自动关闭错误提示
		      closetishi(){
		        if(this.istishi==true){
		          setTimeout(()=>{
		            this.istishi=false
		          },2000)
		        }
		      },
		}
	}
</script>
<style type="text/css" lang="less">
	.my_object{
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: #000;
		background-image: -webkit-linear-gradient(left, #3D282A, #1F2F29);
		.inputname{
		    width: 100%;
		    height: 100%;
		    position: absolute;
		    top: 0;
		    left: 0;
		    z-index: 20;
		    background: rgba(0, 0, 0, 1);
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
		        width: 100%;
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
		    top: 50%;
		    left: 50%;
		    transform: translate(-50%,-50%);
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