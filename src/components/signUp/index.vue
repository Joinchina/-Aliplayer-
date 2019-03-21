<template>
    <div class="wraper">
        <header></header>
        <div class="infoBox" v-show="!successShow&&!overShow">
            <div class="inner">
                <p class="title">{{infoSet.title}}</p>
                <p class="hintText endTimeText"><i class="el-icon-time"></i>报名截止时间：{{infoSet.endTime}}</p>
                <p :class="{'hintText':true,'introText':showMore}" style="-webkit-box-orient: vertical;"><i class="el-icon-document"></i>{{infoSet.description}}</p>
            </div>
            <span round :class="{'showMore':showMore,'packUp':!showMore}" @click="showToogle" v-if="textPShow"></span>
        </div>
        <div v-loading="lodingF">
            <div :class="{writeBox:true, wating:hasSignUp&&userInfo.signUpStatus=='REVIEWING', failed:hasSignUp&&userInfo.signUpStatus=='FAILED', refuse:hasSignUp&&userInfo.signUpStatus=='REFUSED',success:hasSignUp&&userInfo.signUpStatus=='SUCCESSED'}" v-show="!successShow&&!overShow">
                <p class="refuseText" v-if="userInfo.signUpStatus=='FAILED'||userInfo.signUpStatus=='REFUSED'">若有疑问，请联系客服 QQ：3467899286</p>
                    <div class="boxOne" v-if="!twoShow||hasSignUp">
                        <h2>第一步：基本信息<p class="smallText" v-if="!twoShow">(若您已报名，填写基本信息后，查看或修改报名结果)</p></h2>
                        
                        <el-form :model="formInfos" :rules="rules" ref="formInfos" @validate="hasvalidate" class="demo-ruleForm" label-width="80px">
                            <el-form-item label="姓名：" prop="name">
                                <el-input type="text" v-model.trim="formInfos.name" autocomplete="off" :readonly="hasSignUp&&!toEdit"></el-input>
                            </el-form-item>
                            <el-form-item label="手机号：" prop="phoneNum" ref="phoneItem" class="prompt">
                                <el-input type="text" v-model.number="formInfos.phoneNum" autocomplete="off" :readonly="hasSignUp&&!toEdit"></el-input>
                            </el-form-item>
                            <el-form-item label="验证码：" prop="yzm" class="prompt" v-if="!hasSignUp||modifyPhone">
                                <el-input type="text" v-model="formInfos.yzm" autocomplete="off" class="yzmInput" :readonly="hasSignUp&&!toEdit"></el-input>
                                <el-button type="primary" round class="yzmBtn" :disabled="smsDisable" @click="clickSms">{{smsBtnText}}</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                    <div class="boxTwo" v-if="twoShow">
                        <h2>第二步：详细信息</h2>
                        <el-form :model="formTwoInfos" :rules="rulesTwo" ref="formTwoInfos" class="demo-ruleForm" label-width="80px">
                            <el-form-item v-for="(item,index) in twoStepsFields" :key="index" :label="item.name+'：'" :prop="item.code" v-show="!(['name','phone'].includes(item.code))">
                                <template v-if='item.code=="sex"'>
                                    <el-radio label="男" v-model="formTwoInfos.sex" :disabled="hasSignUp&&!toEdit"></el-radio>
                                    <el-radio label="女" v-model="formTwoInfos.sex" :disabled="hasSignUp&&!toEdit"></el-radio>
                                </template>
                                <template v-else>
                                    <el-input type="text" v-model.trim="formTwoInfos[item.code]" autocomplete="off" :readonly="hasSignUp&&!toEdit"></el-input>
                                </template>
                            </el-form-item>
                        </el-form>
                    </div>
                
            </div>
            <div v-show="!successShow&&!overShow">
                <button class="bottomBtn" @click="nextHandler" v-if="!hasSignUp">{{nextBtnText}}</button>
                <button class="bottomBtn" @click="confirmHandle" v-if="hasSignUp&&(userInfo.signUpStatus=='REVIEWING')">{{toEdit?"确定":"重新编辑"}}</button>
            </div>
        </div>
        <success v-if="successShow" @signFlag="successBoxHandler"></success>
        <over v-if="overShow" @overFlag="overBoxHandler"></over>
    </div>
</template>

<script>
    import api from "../../axios/api.js"
    import success from './success.vue'
    import over from './over.vue'
    export default {
        data () {
            let validateName=(rule,value,callback)=>{
                if (!value) {
                    return callback(new Error('请填写姓名'));
                }else if(value.length>12){
                    return callback(new Error('姓名不能超过12个字'));
                }else{
                    callback();
                }
            }
            // let checkEmail=(rule, value, callback) => {
            //     if (!value||value.trim()==="") {
            //         return callback(new Error('请填写邮箱'));
            //     }else if(!/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(value)){
            //         return callback(new Error('邮箱信息有误'));
            //     }else{
            //         callback();
            //     }
            // };
            let checkPhone = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('请输入手机号'));
                }
                setTimeout(() => {
                    if(!(/^1[0345789]\d{9}$/.test(value))) {
                        callback(new Error('请输入正确的手机号'));
                    } else {
                        callback();
                    }
                }, 500)
            };
            return {
                rules: {
                    name: [
                        {required: true,validator: validateName,trigger: 'blur'}
                    ],
                    phoneNum: [
                        {required: true,validator: checkPhone,trigger: 'blur'},
                    ],
                    yzm: [
                        {required: true,message:"请填写验证码"}
                    ]
                },
                formInfos: {
                    name: '',
                    phoneNum: '',
                    yzm: ''
                },
                rulesTwo:{},
                formTwoInfos:{},
                gender:"",
                twoShow: false,
                showMore: true,
                infoSet:{},
                smsDisable:false,//三十秒不允许重复获取验证码
                cutSeconds:0,
                smsBtnText:'获取验证码',
                nextBtnText:"下一步",
                phoneNumFlag:false, 
                twoStepsFields:[],
                userInfo:{},        //已经报名的信息
                hasSignUp: false,   //已经报名
                successShow:false,  //报名成功
                overShow:false,     //报名结束
                toEdit: false,      //重新编辑
                modifyPhone: false, //换手机号
                signUpPhone: "",     //注册用手机号
                staticClazzId:284,  //默认班级id
                textPShow:false,
                lodingF:false,
            }
        },
        created(){
            this.staticClazzId=this.$route.query.clazzId;
            this.getSignUpInfo();
        },
        mounted(){
            
        },
        watch:{
            formInfos:{
                handler(newVal,oldVal){
                    if(this.hasSignUp){
                        this.modifyPhone=(this.signUpPhone!=newVal.phoneNum)?true:false;
                    }
                },
                deep: true
            }
        },
        methods: {
            nextHandler(){
                // this.twoShow=!this.twoShow;
                if(!this.twoShow){
                    this.checkPhoneCode();
                }else{
                    this.submitWrite();
                }
                
            },
            checkEmail(rule, value, callback){
                if (!value||value.trim()==="") {
                    if(rule.required){
                        return callback(new Error('请填写邮箱'));
                    }else{
                        return callback();
                    }
                }else if(!/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(value)){
                    return callback(new Error('邮箱信息有误'));
                }else{
                    return callback();
                }
            },
            checkIdNumber(rule, value, callback) {
                if (!value||value.trim()==="") {
                    if(rule.required){
                        return callback(new Error('请填写身份证号码'));
                    }else{
                        return callback();
                    }
                }else if((value.length!=15&&value.length!=18)||/[\u4E00-\u9FA5]/g.test(value)){
                    return callback(new Error('身份证信息有误'));
                }else{
                    return callback();
                }
            },
            /**
             * 第一步检查手机号和验证码
             */
            checkPhoneCode(){
                this.$refs["formInfos"].validate(validate=>{
                    if(validate){
                        this.lodingF=true;
                        let data = {
                            clazzId:this.staticClazzId,
                            code: this.formInfos.yzm,
                            phone: this.formInfos.phoneNum,
                        }
                        this.$get(api.urls.checkPhone,data).then(res=>{
                            console.log(res);
                            this.lodingF=false;
                            if(res.data.status==200){
                                res.data.data.fields.forEach(item=>{
                                    // this.formTwoInfos[item.code] = '';
                                    if(item.code!="idnumber"&&item.code!="email"){
                                        this.rulesTwo[item.code]=[{required:item.required,message:"请填写"+item.name}]
                                    }else if(item.code=="email"){
                                        this.rulesTwo[item.code]=[
                                            {required: item.required,validator: this.checkEmail,trigger: 'blur'},
                                        ]
                                    }else if(item.code=="idnumber"){
                                        this.rulesTwo[item.code]=[
                                            {required: item.required,validator: this.checkIdNumber,trigger: 'blur'},
                                        ]
                                    }
                                })
                                this.twoStepsFields= res.data.data.fields;
                                this.twoShow=true;
                                this.nextBtnText="提交";
                                this.formTwoInfos.name=this.formInfos.name;
                                this.formTwoInfos.phone=this.formInfos.phoneNum;
                                this.formTwoInfos.clazzId = this.staticClazzId;
                                if(res.data.data.user){
                                    this.hasSignUp=true;
                                    this.userInfo = res.data.data.user;
                                    for(let key in this.userInfo){
                                        let keyValue = this.userInfo[key];
                                        this.formTwoInfos[key] = keyValue;
                                        this.formInfos.name =this.formInfos.name = this.userInfo.name;
                                    }
                                    window.onbeforeunload=()=>{
                                        sessionStorage.setItem("signUp",JSON.stringify({phone:this.userInfo.phone}))
                                    }
                                    this.formTwoInfos = JSON.parse(JSON.stringify(this.formTwoInfos));
                                    this.formInfos.yzm="";
                                    setTimeout(()=>{
                                        this.$refs["formInfos"].clearValidate(["yzm"]);
                                    },500)
                                    this.signUpPhone = this.userInfo.phone;
                                }
                            }else{
                                this.$message.error(res.data.message);
                            }
                        }).catch(err=>{
                            console.log(err);
                        })
                    }else{
                        this.lodingF=false;
                        console.log('Check failure');
                        return false;
                    }
                })
            },
            /**
             * 第二部提交填写信息
             */
            submitWrite(){
                this.$refs["formTwoInfos"].validate(validate=>{
                    if(validate){
                        this.lodingF=true;
                        this.$jsonPost(api.urls.infoSubmit,this.formTwoInfos).then(res=>{
                            console.log(res);
                            this.lodingF=false;
                            if(res.data.status==200){
                                this.successShow=true;
                            }else{
                                this.$message.error(res.data.message);
                            }
                        }).catch(err=>{
                            console.log(err);
                        })
                        
                    }else{
                        this.lodingF=false;
                        console.log('Check failure');
                        return false;
                    }
                })
            },
            showToogle(){
                this.showMore=!this.showMore;
            },
            clickSms(){
                console.log(111);
                this.$refs.formInfos.validateField('phoneNum');
                setTimeout(()=>{
                    if(this.phoneNumFlag){
                        this.smsDisable=true;
                        this.getSms();
                    }
                },500)
            },
            successBoxHandler(){
                this.getStudentInfo();
                
                // this.checkPhoneCode();
            },
            overBoxHandler(){
                this.overShow=false;
                setTimeout(()=>{
                    let textP = document.querySelector('.introText');
                    this.textPShow=textP.scrollHeight-textP.clientHeight>10;
                },700)
            },
            //获取验证码
            getSms(){
                this.$get(api.urls.sms,{phone:this.formInfos.phoneNum,type:5}).then(res=>{
                    this.countdown();
                    if(res.status==200){
                        
                    }else{
                        this.$message.error(res.message);
                    }
                }).catch(err=>{
                    console.log(err);
                })
            },
            /**
             * 确认活重新编辑
             */
            confirmHandle(){
                if(!this.toEdit){
                    this.toEdit=true;
                    return;
                }
                this.$refs["formInfos"].validate(validate=>{
                    if(validate){
                        this.$refs["formTwoInfos"].validate(checkedRes=>{
                            if(checkedRes){
                                if(this.modifyPhone){
                                    //修改手机号
                                    let data = {
                                        clazzId:this.staticClazzId,
                                        code: this.formInfos.yzm,
                                        phone: this.formInfos.phoneNum,
                                    }
                                    this.$get(api.urls.checkPhone,data).then(res=>{
                                        console.log(res);
                                        if(res.data.status==200){
                                           this.saveModify();
                                        }else{
                                            this.$message.error(res.data.message);
                                        }
                                    }).catch(err=>{
                                        console.log(err);
                                    })
                                }else{
                                    //没有修改手机号
                                    this.saveModify()
                                }
                            }
                        })
                    }
                })
            },
            /**
             * 保存修改信息
             */
            saveModify(){
                this.formTwoInfos.name=this.formInfos.name;
                this.formTwoInfos.phone=this.formInfos.phoneNum;
                this.formTwoInfos.identification=this.userInfo.identification
                this.$jsonPost(api.urls.infoSubmit,this.formTwoInfos).then(res=>{
                    if(res.data.status==200){
                        this.$message.success('修改成功');
                        this.toEdit=false;
                    }else{
                        this.$message.error(res.data.message);
                    }
                }).catch(err=>{
                    console.log(err);
                })
            },
            countdown(){
                clearInterval(this.curInterval);
                this.curInterval=setInterval(()=>{
                    if(this.cutSeconds<60){
                        this.cutSeconds++;
                        this.smsBtnText=(60-this.cutSeconds)+"秒后获取";
                        
                    }else{
                        clearInterval(this.curInterval);
                        this.smsBtnText="获取验证码";
                        this.smsDisable=false;
                        this.cutSeconds=0;
                    }
                },1000)
            },
            hasvalidate(param,flag){
                if(param=="phoneNum"&&flag){
                    this.phoneNumFlag=true;
                }
            },
            //获取班级信息  //1186
            getSignUpInfo(){
                console.log(api.urls.signUpInfo);
                this.$get(api.urls.signUpInfo,{clazzId:this.staticClazzId}).then(res=>{
                    console.log(res)
                    if(res.data.status==200){
                        this.infoSet= res.data.data;
                        this.overShow = this.infoSet.over;
                        console.log(res);
                        if(sessionStorage.signUp){
                            this.reloadStay();
                        }
                        setTimeout(()=>{
                            let textP = document.querySelector('.introText');
                            this.textPShow=textP.scrollHeight-textP.clientHeight>10;
                        },700)
                    }else{
                        this.$message.error(res.data.message);
                    }
                }).catch(err=>{
                    alert(err)
                })
            },
            //查看学员报名信息
            getStudentInfo(){
                this.$get(api.urls.infoStudentSignUp,{clazzId:this.staticClazzId,phone:this.formInfos.phoneNum}).then(res=>{
                    console.log(res)
                    if(res.data.status==200){
                        this.userInfo= res.data.data.user;
                        this.successShow=false;
                        this.hasSignUp=true;
                        this.userInfo.signUpStatus=this.userInfo.signUpStatus;
                        this.signUpPhone = JSON.parse(JSON.stringify(this.userInfo.phone));
                        window.onbeforeunload=()=>{
                            sessionStorage.setItem("signUp",JSON.stringify({phone:this.userInfo.phone}))
                        }
                    }else{
                        this.$message.error(res.data.message);
                    }
                }).catch(err=>{
                    console.log(err);
                })
            },
            //刷新留在查看报名页面
            reloadStay(){
                console.warn(JSON.parse(sessionStorage.signUp).phone);
                this.$get(api.urls.infoStudentSignUp,{clazzId:this.staticClazzId,phone:JSON.parse(sessionStorage.signUp).phone}).then(res=>{
                    console.log(res.data)
                    if(res.data.status==200){
                        this.twoShow=true;
                        if(res.data.data.fields){
                            res.data.data.fields.forEach(item=>{
                                // this.formTwoInfos[item.code] = '';
                                if(item.code!="idnumber"&&item.code!="email"){
                                    this.rulesTwo[item.code]=[{required:item.required,message:"请填写"+item.name}]
                                }else if(item.code=="email"){
                                    this.rulesTwo[item.code]=[
                                        {required: item.required,validator: this.checkEmail,trigger: 'blur'},
                                    ]
                                }else if(item.code=="idnumber"){
                                    this.rulesTwo[item.code]=[
                                        {required: item.required,validator: this.checkIdNumber,trigger: 'blur'},
                                    ]
                                }
                            })
                            this.twoStepsFields= res.data.data.fields;
                            this.twoShow=true;
                            this.nextBtnText="提交";
                            this.formTwoInfos.name=this.formInfos.name;
                            this.formTwoInfos.phone=this.formInfos.phoneNum;
                            this.formTwoInfos.clazzId = this.staticClazzId;
                        }
                        if(res.data.data.user){
                            this.hasSignUp=true;
                            this.userInfo = res.data.data.user;
                            for(let key in this.userInfo){
                                let keyValue = this.userInfo[key];
                                this.formTwoInfos[key] = keyValue;
                                this.formInfos.name =this.formInfos.name = this.userInfo.name;
                            }
                            this.formInfos.name =this.formTwoInfos.name = this.userInfo.name;
                            this.formInfos.phoneNum =this.formTwoInfos.phone = this.userInfo.phone;
                            window.onbeforeunload=()=>{
                                sessionStorage.setItem("signUp",JSON.stringify({phone:this.userInfo.phone}))
                            }
                            this.formTwoInfos = JSON.parse(JSON.stringify(this.formTwoInfos));
                            this.formInfos.yzm="";
                            setTimeout(()=>{
                                this.$refs["formInfos"].clearValidate(["yzm"]);
                            },500)
                            this.signUpPhone = this.userInfo.phone;
                        }
                    }else{
                        this.$message.error(res.data.message);
                    }
                }).catch(err=>{
                    console.log(err);
                })
            },
        },

        components:{
            success,
            over,
        }
    }
</script>

<style lang="less" scoped>
    header{
        background: #F5A623;
        height: 100px;
        background-image: url(../../assets/img/logo-sign.png);
        background-position: center center;
        background-size: 384/171*60px 60px;
        background-repeat: no-repeat;
    }
    .infoBox{
        padding: 3%;
        .inner{
            transition: height .2s linear;
        }
        .title{
            font-size: 40px;
            color: #000000;
            letter-spacing: 0;
            font-weight: 700;
        }
        .hintText{
            font-size: 30px;
            color: #666666;
            line-height: 40px;
            margin-top: 20px;
            -webkit-box-orient: vertical;
            font-family: PingFangSC-Regular;
            i{
                font-size: 30px;
                margin-right: 6px;
                vertical-align: baseline;
            }
        }
        .introText{
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            /* autoprefixer: off */
            -webkit-box-orient: vertical;
            /* autoprefixer: on */
        }
        .showMore,.packUp{
            width: 200px;
            height: 200*0.28px;
            font-size: 30px;
            display: block;
            margin: 0 auto;
            background: url(../../assets/img/showMore.png) center center no-repeat;
            background-size: 100% 100%;
            margin-top: 20px;
        }
        .packUp{
            background: url(../../assets/img/packUp.png) center center no-repeat;
            background-size: 100% 100%;
        }
    }
    .writeBox{
        padding: 3%;
        background: #fff;
        background-size: 90*.983px 90px;
        background-position: top right;
        background-repeat: no-repeat;
        h2{
            text-align: center;
            font-size: 36px;
            color: #333333;
            margin: 30px 0;
        }  
        .refuseText{
            font-size: 28px;
            color: #7687A7;
        }
    }
    .wating{
        background-image: url(../../assets/img/wating.png);
    }
    .failed{
        background-image: url(../../assets/img/failed.png);
    }
    .refuse{
        background-image: url(../../assets/img/refuse.png);
    }
    .success{
        background-image: url(../../assets/img/success.png);
    }
    .smallText{
        text-align: center;
        font-size: 26px;
        color: #666666;
    }
</style>

<style lang='less'>
    body{
        background: #F9F9FB;
    }
    .writeBox{
        .el-input{
            height: 70px;
            .el-input__inner{
                border: 2px solid #DCDFE6;
                height: 60px;
            }
        }
        .yzmInput{
            width: 50%;
        }
        .yzmBtn{
            // width: 30%;
            height: 50px;
            background: #F5A623;
            border-radius: 150px;
            border: 0 none;
            margin-left:10px;
            span{
                font-size: 24px;
            }
        }
        .el-form-item__content,.el-form-item__label{
            line-height: 70px;
        }
        .el-form-item__content{
            margin-left: 170px !important;
        }
        .el-form-item__label{
            // inherit
            font-size: 28px;
            width: 170px !important;
        }
        .el-form-item__content input{
            font-size: 28px;
        }
        .el-radio__inner{
            width: 30px;
            height: 30px;
            border: 2px solid #DCDFE6;
        }
        .el-radio__inner::after{
            width: 12px;
            height: 12px;
        }
        .el-radio__label{
            font-size: 32px;
            color: #666666;
        }
        .el-form-item__error{
            font-size: 20px;
        }
    }
    .bottomBtn{
        display: block;
        width: 80%;
        font-size: 36px;
        color: #FFFFFF;
        background: #FD7E23;
        border-radius: 10px;
        height: 90px;
        margin: 10px auto;
        line-height: 90px;
        text-align: center;
        outline: 0;
        border: 0 none;
    }
</style>

