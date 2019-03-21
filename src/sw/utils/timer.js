 /**
   * @description this is a timer
   * @param {options} object
   * @description 
   	Time.sendTime({
    	time:3,
    	callback:function(status){
    		if(status == 200){
   				alert("可以发送");
 		}else{
 				alert("不可以发送");
			}
 		}
	});
 **/

 function time(){
	this.time = 0;
	this.clock = null;
	this.flag = true;
	this.send = function(){
		this.time++;
		if(this.time >= this.maxTime){
			//清除计时器
			this.time = 0;
			clearInterval(this.clock);
			this.flag = true;
		}
	}
	this.sendTime = function(options){

		let _this = this;
		_this.maxTime = options.time;

		if(_this.flag){
			//alert("可以发送");
			options.callback(200);
			_this.clock = setInterval(function(){
				_this.send();
			},1000)
			_this.flag = false;
		}else{
			options.callback(400);
			//alert("不能频繁发送");
		}
	}
}
var Timer = new time();
export default Timer;

    // function aa(){
    // 	Time.sendTime({
    // 		time:3,
    // 		callback:function(status){
    // 			if(status == 200){
    // 				alert("可以发送");
    // 			}else{
    // 				alert("不可以发送");
    // 			}
    // 		}
    // 	});
    // }