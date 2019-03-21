<template>
    <div class="successBox">
        <img src="../../assets/img/signUp.png" alt="" class="successLogo">
        <p class="text">报名成功！</p>
        <p class="text">请等待管理员审核！</p>
        <button class="viewSignUpBtn" @click="viewSgnUp">查看报名状态</button>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                
            }
        },
        methods: {
           viewSgnUp(){
               this.$emit("signFlag")
           }     
        },
    }
</script>

<style lang="less" scoped>
    .successLogo{
        display: block;
        margin: 100px auto;
        margin-bottom: 20px;
        width: 850/750*260px;
        height: 260px;
    }
    .text{
        font-size: 32px;
        color: #333333;
        text-align: center;
        line-height: 50px;
    }
    .viewSignUpBtn{
        display: block;
        margin: 30px auto;
        // width: 240px;
        padding: 0 30px;
        // height: 60px;
        text-align: center;
        line-height: 60px;
        font-size: 30px;
        color: #FD7E23;
        border: 1px solid #FD7E23;
        border-radius: 40px;
        background: #fff;
        outline: 0 none;
        cursor: pointer;
    }
</style>


