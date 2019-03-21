<template>
    <div :class="{chargeBox:true, pcDevice:pcDevice}" v-loading="lodingF">
        <header>
            <p>致用户的一封信</br>——关于师训宝收费相关信息</p>
        </header>
        <article>
            <p class="hintText">尊敬的用户您好，师训宝将于后续开始收费，部分功能使用将会受到限制。</p>
            <el-table
                :data="tableData"
                stripe
                style="width: 100%">
                <el-table-column
                    prop="date"
                    align="center"
                    label="日期">
                </el-table-column>
                <el-table-column
                    prop="name"
                    align="center"
                    label="姓名">
                </el-table-column>
                <el-table-column
                    prop="address"
                    align="center"
                    label="地址">
                </el-table-column>
            </el-table>
        </article>
        <div class="fillBlock"></div>
        <footer>
            <form action="">
                <p class="attchText">如有疑问，请留下联系方式，我们的商务会尽快跟您进行联系。</p>
                <el-input v-model="ajaxData.userName" placeholder="请输入姓名" class="inputWrite"></el-input>
                <el-input v-model="ajaxData.telephone" placeholder="请输入联系电话" class="inputWrite"></el-input>
                <el-button type="info" class="connectBtn" plain @click="submit">提交</el-button>
            </form>
        </footer>
    </div>
</template>

<script>
    import api from "../../axios/api.js"
    export default {
        data () {
            return {
                tableData: [{
                    date: '2016-05-02',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1518 弄'
                    }, {
                    date: '2016-05-04',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1517 弄'
                    }, {
                    date: '2016-05-01',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1519 弄'
                    }, {
                    date: '2016-05-03',
                    name: '王小虎',
                    address: '上海市普陀区金沙江路 1516 弄'
                    }, {
                        date: '2016-05-03',
                        name: '王小虎',
                        address: '上海市普陀区金沙江路 1516 弄'
                    }, {
                        date: '2016-05-03',
                        name: '王小虎',
                        address: '上海市普陀区金沙江路 1516 弄'
                    }, {
                        date: '2016-05-03',
                        name: '王小虎',
                        address: '上海市普陀区金沙江路 1516 弄'
                    }, {
                        date: '2016-05-03',
                        name: '王小虎',
                        address: '上海市普陀区金沙江路 1516 弄'
                    }, {
                        date: '2016-05-03',
                        name: '王小虎',
                        address: '上海市普陀区金沙江路 1516 弄'
                    }, {
                        date: '2016-05-03',
                        name: '王小虎',
                        address: '上海市普陀区金沙江路 1516 弄'
                    }, {
                        date: '2016-05-03',
                        name: '小蓝',
                        address: '上海市普陀区金沙江路 1516 弄'
                }],
                ajaxData:{
                    userName:"",
                    telephone:""
                },
                pcDevice:false,
                lodingF:false,
            }
        },
        created(){
            this.pcDevice=document.documentElement.clientWidth>650;
        },
        mounted(){
            document.querySelector('.chargeBox').setAttribute('style',"height: "+document.documentElement.clientHeight+"px");
        },
        methods:{
            submit(){
                if(this.ajaxData.userName.trim()==""){
                    this.$alert('姓名不能为空', {
                        confirmButtonText: '确定',
                        type: 'error',
                    });
                    return
                }
                if(this.ajaxData.telephone.trim()==""){
                    this.$alert('联系电话不能为空', {
                        confirmButtonText: '确定',
                        type: 'error',
                    });
                    return
                }
                this.lodingF=true;
                console.log(this.ajaxData);
                let data = {telephone:this.ajaxData.telephone,userName:this.ajaxData.userName}
                this.$filePost(api.urls.saveBusiness,data).then(res=>{
                    console.log(res);
                    this.lodingF=false;
                    if(res.data.status==200){
                        this.$message.success("提交成功");
                    }else{
                        this.$message.error(res.data.message);
                    }
                }).catch(err=>{
                    console.log(err);
                })
            },
        }
    }
</script>

<style lang="less" scoped>
    .chargeBox{
        // overflow-y: scroll;
        position: relative;
        display: flex;
        flex-direction: column;
    }
    header{
        text-align: center;
        flex:1;
        p{
            text-align: center;
            margin: 0 auto;
            width: 100%;
            font-size: 48px;
            color: #333333;
            font-family: PingFangSC-Regular;
            padding: 30px 0;
            text-indent: -270px;
        }
        border-bottom: 1px solid #F0F0F0;
    }
    article{
        padding: 0 30px;
        height: 67%;
        overflow-y: scroll;
        flex:5;
        .hintText{
            font-size: 30px;
            color: #333333;
            letter-spacing: 1px;
            text-align: center;
            margin: 20px auto;
        }
    }
    footer{
        // height: 200px;
        padding: 0 60px;
        padding-top: 20px;
        // position: absolute;
        // bottom: 0;
        // left: 0;
        // width: 100%;
        // z-index: 2;
        flex:1;
        .attchText{
            font-size: 24px;
            color: #666666;
            margin-bottom: 20px;
        }
        background: #fff;
    }
    // .fillBlock{
    //     height: 200px;
    //     // box-shadow:  0px -30px 70px #eeeeee;
    //     z-index: 1;
    //     position: relative;
    // }
    .pcDevice{
        .connectBtn{
            margin-left: 30px;/*no*/
        }
        header p{
            font-size: 24px;/*no*/
        }
        article .hintText{
            font-size: 16px;/*no*/
        }
        article .el-table .cell{
            font-size: 14px;/*no*/
        }
        .attchText{
            font-size: 14px;/*no*/
        }
    }
</style>

<style lang="less">
    #app{
        width: 100%;
        max-width: none;
    }
    article .el-table .cell{
        font-size: 28px;
        line-height: 38px;
    }
    article .el-table thead th{
        background: #eef1f6;
    }
    .pcDevice{
        article .el-table .cell{
            font-size: 14px;/*no*/
        }
        .inputWrite{
            width: 160px;/*no*/
            height: 34px;/*no*/
            input{
                font-size: 14px;/*no*/
            }
            margin-right: 10px;/*no*/
        }
        .connectBtn{
            height: 34px;/*no*/
            width: 75px;/*no*/
            font-size: 14px;/*no*/
        }
        .el-button--info.is-plain:hover{
            background: #7687A7;
        }
    }
    .inputWrite{
        width: 240px;
        height: 68px;
        max-width: 160px;/*no*/
        input{
            border-width: 1px;/*no*/
            border-radius: 6px; /*no*/
            height:100%;
            font-size: 26px;
        }
        
    }
    .connectBtn{
        height: 60px;
        width: 110px;
        border-width: 0px;
        border-radius: 6px; /*no*/
        font-size: 26px;
    }
    .el-button--info.is-plain{
        background: #E2E8EE;
    }
    .el-message-box__message{
        p{
            font-size: 20px;
        }
    }
</style>

