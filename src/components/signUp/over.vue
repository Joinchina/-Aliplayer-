<template>
    <div class="successBox">
        <img src="../../assets/img/over.png" alt="" class="overLogo">
        <p class="text">报名已结束！</p>
        <p class="text">若您已报名，可<span class="viewInfo" @click="viewSgnUp">查看或修改报名信息</span></p>
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
               this.$emit("overFlag");
           }     
        },
    }
</script>

<style lang="less" scoped>
    .overLogo{
        display: block;
        margin: 100px auto;
        margin-bottom: 20px;
        width: 381/450*260px;
        height: 260px;
    }
    .text{
        font-size: 32px;
        color: #333333;
        text-align: center;
        line-height: 50px;
    }
    .viewInfo{
        color: #67A2E6;
        text-decoration: underline;
    }
</style>


