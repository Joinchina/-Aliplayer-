let barrageWall = {
    container: null,        //弹幕容器
    barrageLen: null,       //弹幕轨道数
    lastElem: 0,            //最后一个弹幕的index
    overlapElem: -1,        //
    barrage: [],            //弹幕
    barrageOffset: [],      //偏移的弹幕
    colors: ['#2C3E50','#FF0000','#1E87F0','#7AC84B','#FF7F00','#9B39F4','#FF69B4'],        //随机颜色
    role:{Broadcaster:"主播",Assistant:'助教'},
    init: function(option) {
        if (option.container === undefined) {
            console.error("必须指定 container 属性，container为弹幕容器的选择器");
            return false;
        }
        if (option.barrageLen === undefined) {
            console.error("必须指定 barrageLen 属性，barrageLen为弹幕轨道的数");
            return false;
        }
        this.container = option.container;
        this.barrageLen = option.barrageLen;
        for (let i = 0; i < this.barrageLen; i++) {
            this.barrage[i] = new Array();
        }
    },
    upWall: function(img, user, txt,messageType) {
        if (!this.barrageLen && this.container) {
            console.error("未检测到container和barrageLen属性，请先初始化弹幕墙并指定container和barrageLen属性");
            return false;
        }
        this.positionWall();
        let index = parseInt(Math.random() * this.colors.length);  //生成一个0~6的随机数

        let elem;
        if(messageType=="horn"){
            elem = $('<div></div>').addClass('barrageItem hornItem').css({"top":this.lastElem * 38 +10 + "px"}).html("<img src='" + img + "' alt=''/>" + '<em>' +user + '：</em>' + txt).appendTo(this.container);
        }else if(messageType!="Attendee"){
            elem = $('<div></div>').addClass('barrageItem administrator').css({"top":this.lastElem * 38 +10 + "px","color":"#F8E71C"}).html("<img src='" + img + "' alt=''/>" + '<em>' +user + '：</em>'+ txt).appendTo(this.container);
        }else{
            elem = $('<div></div>').addClass('barrageItem').css({"top":this.lastElem * 38 +10 + "px","color":"#fff"}).html('<em style="color:#98FF2D">' +user + '：</em>' + txt).appendTo(this.container);
        }
        this.barrage[this.lastElem].push(elem);
        setTimeout(function() {
            elem.addClass("animate");
        }, 200);
        setTimeout(function() {
            for (let i = 0; i < this.barrage.length; i++) {
                for (let x = 0; x < this.barrage[i].length; x++) {
                    if (this.barrage[i][x] === elem) {
                        this.barrage[i].splice(x, 1);
                        break;
                    }
                }
            }
            elem.remove();
        }
        .bind(this), 25000);
    },
    positionWall: function() {
        for (let i = 0; i <= this.barrage.length; i++) {
            if (i === this.barrage.length) {
                this.minOffset();
            } else {
                if (this.afterOffset(i))
                    break;
            }
        }
    },
    minOffset: function() {
        let minOffset = 0;
        for (let x = 0; x < this.barrage.length; x++) {
            let elem = this.barrage[x][this.barrage[x].length - 1];
            let aboveWidth = elem.width();
            let matrix = elem.css('transform');
            this.barrageOffset[x] = matrix === "none" ? -aboveWidth : -parseInt(matrix.split(",")[4]) - aboveWidth;
            minOffset = this.barrageOffset[x] > this.barrageOffset[minOffset] ? x : minOffset;
        }
        this.lastElem = minOffset;
    },
    afterOffset: function(i) {
        if (this.barrage[i].length === 0) {
            this.lastElem = i;
            this.overlapElem = -1;
            return true;
        } else {
            let elem = this.barrage[i][this.barrage[i].length - 1];
            let aboveWidth = elem.width();
            let matrix = elem.css('transform');
            if (matrix !== "none") {
                let aboveTransform = parseInt(matrix.split(",")[4]);
                if (-aboveTransform - aboveWidth > 50) {
                    this.lastElem = i;
                    this.overlapElem = -1;
                    return true;
                }
            }
        }
        return false;
    }
}

export default barrageWall;
