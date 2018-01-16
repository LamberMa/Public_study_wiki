# BOM

>BOM（浏览器对象模型），可以对浏览器窗口进行访问和操作。使用 BOM，开发者可以移动窗口、改变状态栏中的文本以及执行其他与页面内容不直接相关的动作。使 JavaScript 有能力与浏览器“对话”。 

## Window对象

> window对象：所有浏览器都支持 window 对象。    
>
> - 概念上讲.一个html文档对应一个window对象.    
> - 功能上讲: 控制浏览器窗口的.    
> - 使用上讲: window对象不需要创建对象,直接使用即可.

### Window对象方法

```javascript
alert()            
# 显示带有一段消息和一个确认按钮的警告框。
confirm()          
# 显示带有一段消息以及确认按钮和取消按钮的对话框。
# 根据用户不同的选择会有一个返回值，确定返回true，取消返回false
prompt(str)           
# 显示可提示用户输入的对话框。返回值就是用户输入的值，接收到的内容都是String
open()             
# 打开一个新的浏览器窗口或查找一个已命名的窗口。open("http://www.baidu.com");如果写了参数那么就是跳转到指定的url，如果没有写就是一个空白的窗口，about blank 参数1 什么都不填 就是打开一个新窗口.  参数2.填入新窗口的名字(一般可以不填). 参数3: 新打开窗口的参数.
# open('http://www,baidu.com','test_window','width=200,resizable=no,height=100'); 
# 新打开一个宽为200 高为100的窗口
close()            
# 关闭浏览器窗口。
setInterval(func_name,时间(单位：毫秒))      
# 按照指定的周期（以毫秒计）来调用函数或计算表达式。简单来说即是定时器，先等待这个time_interval然后执行这个函数。
clearInterval()    
# 取消由 setInterval() 设置的定时器
setTimeout()       
# 在指定的毫秒数后调用函数或计算表达式。
clearTimeout()     
# 取消由 setTimeout() 方法设置的 timeout。
scrollTo()         
# 把内容滚动到指定的坐标。
```

示例：

```javascript
var num = Math.round(Math.random()*100);
function acceptInput(){
//2.让用户输入(prompt)    并接受 用户输入结果
var userNum = prompt("请输入一个0~100之间的数字!","0");
//3.将用户输入的值与 随机数进行比较
        if(isNaN(+userNum)){
            //用户输入的无效(重复2,3步骤)
            alert("请输入有效数字!");
            acceptInput();
        }
        else if(userNum > num){
        //大了==> 提示用户大了,让用户重新输入(重复2,3步骤)
            alert("您输入的大了!");
            acceptInput();
        }else if(userNum < num){
        //小了==> 提示用户小了,让用户重新输入(重复2,3步骤)
            alert("您输入的小了!");
            acceptInput();
        }else{
        //答对了==>提示用户答对了 , 询问用户是否继续游戏(confirm).
            var result = confirm("恭喜您!答对了,是否继续游戏?");
            if(result){
                //是 ==> 重复123步骤.
                num = Math.round(Math.random()*100);
                acceptInput();
            }else{
                //否==> 关闭窗口(close方法).
                close();
            }
        }
```

一个在input的数据框显示时间的小练习：

```javascript
<!DOCTYPE html>
<html>
<head>
	<title></title>
	<script type="text/javascript">
		var global_id;
		function start_current_time(){
			// 首先判断一下这个global_id有没有值，如果没有值的话说明是第一次调用
			// 这里如果不做判断的话每一次调用都会产生一个定时器，但是返回的global_id
			// 只有一个全局变量在接收，stop的时候也只能关掉这么一个，其他的是关不掉的。
			if(global_id==undefined){
				get_current_time()
				global_id = setInterval(get_current_time,1000)
			};
		};
	    function get_current_time(){
	    	var c_date = new Date();
	    	var str_date = c_date.toLocaleString();

	    	var timebar = document.getElementById('timebar');
	    	timebar.value = str_date;
	    }
	    function stop_current_time(){
  			clearInterval(global_id);
  			// 清空global_id
  			global_id = undefined;
	    };
	</script>
</head>
<body>
	<input type="text" name="box" id='timebar' value='' onfocus="start_current_time()">
	<button id='btn' onclick="stop_current_time()">Stop</button>


</body>
</html>
```



