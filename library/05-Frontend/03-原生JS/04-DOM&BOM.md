## 2、DOM中级

> 什么是DOM？DOM 是 W3C（万维网联盟）的标准。DOM 定义了访问 HTML 和 XML 文档的标准：
>
> "W3C 文档对象模型（DOM）是中立于平台和语言的接口，它允许程序和脚本动态地访问和更新文档的内容、结构和样式。"
>
> W3C DOM 标准被分为 3 个不同的部分：
>
> - 核心 DOM - 针对任何结构化文档的标准模型
> - XML DOM - 针对 XML 文档的标准模型
> - HTML DOM - 针对 HTML 文档的标准模型
> - 什么是 XML DOM？  －－－－>XML DOM 定义了所有 XML 元素的对象和属性，以及访问它们的方法。
> - 什么是 HTML DOM？－－－－>HTML DOM 定义了所有 HTML 元素的对象和属性，以及访问它们的方法。

### DOM节点

根据 W3C 的 HTML DOM 标准，HTML 文档中的所有内容都是节点(NODE)：

- 整个文档是一个文档节点(document对象)
- 每个 HTML 元素是元素节点(element 对象)
- HTML 元素内的文本是文本节点(text对象)
- 每个 HTML 属性是属性节点(attribute对象)
- 注释是注释节点(comment对象)

画dom树是为了展示文档中各个对象之间的关系，用于对象的导航。

![](http://omk1n04i8.bkt.clouddn.com/17-11-22/74616341.jpg)

节点(自身)属性:

- attributes - 节点（元素）的属性节点
- nodeType – 节点类型
- nodeValue – 节点值
- nodeName – 节点名称
- innerHTML - 节点（元素）的文本值

导航属性:

- parentNode - 节点（元素）的父节点 (推荐)
- firstChild – 节点下第一个子元素
- lastChild – 节点下最后一个子元素
- childNodes - 节点（元素）的子节点 

### 创建DOM元素

- createElement(标签名)
- appendChild(节点)：比如为ul插入li

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<style type="text/css">

	</style>
	<script type="text/javascript">
  		window.onload = function(){
  			var otxt1 = document.getElementById('txt1')
  			var obtn1 = document.getElementById('btn1');
  			var oul1 = document.getElementById('ul1');

  			obtn1.onclick=function(){
  				var oli = document.createElement('li');
  				//更改标签内部的内容，放在追加之前可以减少页面的渲染
  				oli.innerHTML = otxt1.value
  				//在一个父级插入一个子节点
  				oul1.appendChild(oli)
  			}
  		}
	</script>
</head>
<body>
	<input id="txt1" type="text"></input>
	<input id='btn1' type="button" value="创建li">
<ul id='ul1'>
	
</ul>
</body>
</html>
```

上面的例子是默认插入到后面，而不是插入到前面，比如微博或者qq空间的说说这种，一般新发表的都是默认的生成在一个的。越往后的数据其实是越来越旧的。因此可以使用insertBefore(子节点，在谁之前插入子节点)

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<style type="text/css">

	</style>
	<script type="text/javascript">
  		window.onload = function(){
  			var otxt1 = document.getElementById('txt1')
  			var obtn1 = document.getElementById('btn1');
  			var oul1 = document.getElementById('ul1');

  			obtn1.onclick=function(){
  				var oli = document.createElement('li');
  				//获取到当前的所有li的一个数组
  				var ali = oul1.getElementsByTagName('li');
  				//更改标签内部的内容，放在追加之前可以减少页面的渲染
  				oli.innerHTML = otxt1.value;
  				//在一个父级插入一个子节点
  				if (ali.length==0){
  					//首先确认有没有li，如果本来就没有走这里否则会报错
  					oul.appendChild(oli);
  				}
  				else{
  					oul1.insertBefore(oli,ali[0]);
  				}
  			};
  		};
	</script>
</head>
<body>
	<input id="txt1" type="text"></input>
	<input id='btn1' type="button" value="创建li">
<ul id='ul1'>
	<li>aaa</li>
</ul>
</body>
</html>
```

如何删除子节点？[removeChild(子节点)]

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<script type="text/javascript">
		window.onload = function()
		{
			var aA = document.getElementsByTagName('a');
			var oUL = document.getElementById('ul1');

			for (i=0;i<aA.length;i++){
				aA[i].onclick=function(){
					//这里要求点击a删除它的父级li，因此用到了parentNode
					oUL.removeChild(this.parentNode);
				}
			}
		}
	</script>
</head>
<body>
	<ul id="ul1">
		<li>我是第1个li<a href="javascript:;">删除</a></li>
		<li>我是第2个li<a href="javascript:;">删除</a></li>
		<li>我是第3个li<a href="javascript:;">删除</a></li>
		<li>我是第4个li<a href="javascript:;">删除</a></li>
	</ul>
	
</body>
</html>
```

### 文档碎片

- 文档碎片可以提高DOM操作性能（理论上），有时候还会降低性能，这个东西其实很诡异，一般只有面试用得到。实际性能提升的很低。
- 文档碎片原理
- document.createDocumentFragment()





# BOM

> BOM（浏览器对象模型），可以对浏览器窗口进行访问和操作。使用 BOM，开发者可以移动窗口、改变状态栏中的文本以及执行其他与页面内容不直接相关的动作。使 JavaScript 有能力与浏览器“对话”。 

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

