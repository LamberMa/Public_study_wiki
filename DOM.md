

DOM对象

document element 文本对象text 属性对象attribute









在使用classList.remove方法删除class的时候注意不要通过要删除的元素去获取要操作的Object，因为获取的对象是实时的，比如说你删除了一个，那么获取到的内容长度会减少。for循环遍历也会变的不准确的。



跑马灯

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>Document</title>
	<script>
		window.onload = function(){
			var msg = document.getElementById('msg');
			var Obtn = document.getElementById('btn')
			function deal_with_str(){
				var str = msg.innerText	
				var first_charcter = str.substr(0,1)
				var spare_charcter = str.slice(1)
				var new_str = spare_charcter + first_charcter
				msg.innerText = new_str
			}
			setInterval(deal_with_str,150);
		}

	</script>
</head>
<body>
	<h2 id='msg'>欢迎lamber</h2>
	<button id='btn'>go</button>
</body>
</html>
```





```javascript
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>Document</title>
	<script>
		window.onload=function(){
			var info = {
				"北京":['西城区','朝阳区','海淀区'],
				"天津":['滨海新区','西青区'],
				"河北":['石家庄','沧州','邢台']
			}
			var select = document.getElementById('select');
			select.onchange = function(){
				var opts = select.children;
				var sindex = this.selectedIndex;
				var city = opts[sindex].innerText;
				var area = info[city];
				var area_select = document.getElementById('area');
				// 清空当前select的子元素
				area_select.options.length = 0;
				for(i=0;i<area.length;i++){
					var opt = document.createElement('option')
					opt.innerText = area[i];
					area_select.appendChild(opt)
				}
			}

		}
	</script>
</head>
<body>
	<select id='select'>
		<option value="1">北京</option>
		<option value="2">天津</option>
		<option value="3">河北</option>
	</select>
	<select name="area" id="area" >

	</select>
</body>
</html>
```



onsubmit的绑定事件优先于submit事件。 

```
阻止默认事件的发生的方式为：return false

function(e)
这个e就是事件保存的状态，这是一个封装了当前事件状态的对象

e.preventDefault()  //阻止默认事件的发生
```

事件传播

```
盒子嵌套的时候可能产生事件的外延，自己内部的时间会优先于外部的事件，如果想保证内部时间不受到外部容器的影响，需要进行事件阻断
e.stopPropagation()
```





onmouseout和onmouseleave的区别

```
onmouseout：除了给元素绑定该事件以外还会给它的子元素绑定。
onmouseleave：
```







onkeydown

```
e.keyCode 返回的是对应键盘的ascii

ascii转换成字符
String.fromCharCode(num)
```





小手

```
cursor:pointer
```





js中变量使用var和不使用var有什么区别？

```
var是词法分析
声明和不声明的区别，词法分析会根据这个内容做判断
```



