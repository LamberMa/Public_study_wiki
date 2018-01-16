# js学习小结

在js的使用过程中，一定要注意语法

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>初学js</title>
	<style type="text/css">
		#div1{
			width: 100px;
			height: 100px;
			background: red;
		}
	</style>
	<script type="text/javascript">
		window.onload = function (){
			var oDiv1 = document.getElementById('div1');
             # 事件提取的时候函数不加括号
			oDiv1.onmouseover = toGreen;
			oDiv1.onmouseout = toRed;
		}
		function toGreen(){
			var odiv1 = document.getElementById('div1');
			odiv1.style.width = '200px';
			odiv1.style.height = '200px';
			odiv1.style.background = 'green';
		};
		function toRed(){
			var odiv1 = document.getElementById('div1');
			odiv1.style.width = '100px';
			odiv1.style.height = '100px';
			odiv1.style.background = 'red';
		};
	</script>
</head>
<body>
	<div id="div1">
		
	</div>
	
</body>
</html>
```

- 上面代码中涉及到方法的不管是有名称的还是匿名的都要加一个小括号，然后函数体用一个花括号括起来。
- 变量要用var去声明，而且每一句都要有分号结尾，每一个函数后面也要有分号结尾。
- 涉及到style变化的，记得style的属性值要用引号引起来。
- 事件提取的话函数不要带小括号
- js的读取是从上到下一行一行的去执行的。window.onload的作用是预先把页面内容给加载了。如果不加window.onload是会报错的

## if

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<script type="text/javascript">
		window.onload = function (){
			var obtn = document.getElementById('btn');
			var oul1 = document.getElementById('ul1');
			obtn.onclick = function(){
				if (oul1.style.display=='none')
				{
					oul1.style.display='block';
				}
				else
				{
                    oul1.style.display='none';
				}
			};
		};
	</script>
</head>
<body>
	<div id="box">
		<p id="btn">输入法</p>
		<ul id="ul1" style="display: none;">
			<li><a href="#">手写</a></li>
			<li><a href="#">拼音</a></li>
			<li><a href="#">关闭</a></li>
		</ul>
	</div>
</body>
</html>
```

具体逻辑

```javascript
if (条件) {
    
}
else if ()
{
           
         }
```

## for循环

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<script type="text/javascript">
        window.onload = function(){
        	var obtn = document.getElementById('btn');
        	var oinput = document.getElementsByTagName('input');
        
	        var i=0;
	        obtn.onclick=function(){
	        	for(i=0;i<oinput.length;i++)
	        	{
	        		if (oinput[i].checked == true)
	        		{
	        			oinput[i].checked=false;
	        		}
	        		else
	        		{
	        			oinput[i].checked=true;
	        		}
	        		
	        	};
	        };
        };


	</script>
</head>
<body>
	<p id='btn'>全选</p>
	<input type="checkbox"><br>
	<input type="checkbox"><br>
	<input type="checkbox"><br>
	<input type="checkbox"><br>
	<input type="checkbox"><br>
	<input type="checkbox"><br>
	<input type="checkbox"><br>
	<input type="checkbox"><br>
	<input type="checkbox"><br>
	
</body>
</html>
```

- 注意不该大写的不要大写，比如checked=true，就不要写成True了。

## this指代的是当前发生事件的那个元素

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<script type="text/javascript">
        window.onload = function(){
        	var oinput = document.getElementsByTagName('input');
            oinput[0].onclick = function()
            {
            	alert(this.value);
            };

        };


	</script>
</head>
<body>
	<input type="button" value='你点我干嘛！'>
</body>
</html>
```

- this指代的是当前操作的元素。比如点input就是当前那个input
- alter是错误的，是alert
- getElementByTagName得到的是一个数组而不是一个单个元素，因此在取用的时候要加下标

```javascript
# 例二
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<style type="text/css">
		input {
			background: white;
		}
		.active {
			background: red;
		}
		div {
			width: 100px;
			height: 100px;
			background: green;
			display: none;
		}
	</style>
	<script type="text/javascript">
		window.onload = function(){
		var oinput = document.getElementsByTagName('input');
		var odiv = document.getElementsByTagName('div')
		for(i=0;i<oinput.length;i++)
		{
            //加一个索引值用来给div做索引
		    oinput[i].index = i;
        	oinput[i].onclick = function()
        	{
        		for(i=0;i<oinput.length;i++)
        		{
                      //先把所有的class都置为空
					oinput[i].className='';
					odiv[i].style.display='none';
				}
				odiv[this.index].style.display='block';
                  //将当前的元素的class置为active
				this.className = 'active';
        	};
		}
    };
	</script>
</head>
<body>
	<input class='active' type="button" name="">
	<input type="button" name="">
	<input type="button" name="">
	<div style='display: block;'>111</div>
	<div>222</div>
	<div>333</div>
</body>
</html>
```

## JavaScript基础

ECMAScript帮助计算机读懂人类写的语言，其实相当于一个媒介，就是解释器，类似于python解释器。（几乎没有兼容性问题）

### DOM（Document Object Model）

文档对象模型，把文档变成一个js可以操作的对象。（有一些兼容性问题）

### BOM（Browser Object Model）

给予JS操作浏览器的手段和方法。（几乎不兼容，所以不存在兼容性问题）

### 注释

单行 //

多行 /**/

console.log(变量名)  将内容输出到终端，f12打开以后点击console

变量规范和语句规范，记得每一个结束的位置要写分号。

### 变量类型

typeof的应用，相当于python中的isinstanceof

```javascript
<script type="text/javascript">
	var a = 'asdasd';
	var b = '111';
	var c = 3333;
	alert(typeof a)
	alert(typeof b)
	alert(typeof c)
</script>
```

常见的变量类型如下：

- undifined：未定义的，未声明过的，或者声明了没有值
- boolean：布尔值，非黑即白，真假
- number：整数，小数都是number，部分int、float、double
- string：字符串，一般用引号去引起来。
- object：比如div什么的，数组也属于一个对象
- function：方法

#### 数据类型转换

- parseInt：类型转换成数字，如果字符串有数字会把数字提取出来，如果字符串没办法转成数字就会转成NaN，任何数+Nan结果还是NaN
- parsefloat：可以提取一个浮点数

判断是不是NaN不能用xxx==NaN来进行判断，因为NaN和任何数值都不相等，包括它自己。也就是说NaN==NaN做判断的结果也是false，有点奇葩，不过有一个函数可以做判断就是isNaN(args)

#### 关于双等和三等

- ==：先把两边的东西转成一样的类型，然后再做比较
- ===：不转换直接比较。建议用三等，但是用双等也没问题的

#### 关于减法

- -,*,/：减法，乘法，除法都会把两边内容转换成一种类型再做数学运算
- +：加法有一点特殊，一个数做字符串链接，另外一个是做数字的相加，做数字的相加的话要parseint以后再做。它不会做自动的转换操作。

#### 变量作用域

- 局部变量：定义在函数内的，只能在函数内部使用。
- 全局变量：定义在函数外部，可以在全局使用

#### 闭包

```javascript
function aaa(){
	var a=33
	function bbb(){
		alert(a)
	}
	bbb()
}
aaa()
```

子函数可以使用父函数的局部变量

#### 变量命名规范

- 可读性，能看懂
- 规范性，符合规则

匈牙利命名法：

- 类型前缀
- 首字母大写

| 类型   | 前缀   | 类型       | 实例           |
| ---- | ---- | -------- | ------------ |
| 数组   | a    | Array    | aItems       |
| 布尔值  | b    | Boolean  | BIsComplete  |
| 浮点数  | f    | Float    | fPrice       |
| 函数   | fn   | Function | fnHandler    |
| 整数   | i    | Interger | iItemCount   |
| 对象   | o    | Object   | oDiv1        |
| 正则   | re   | RegExp   | reEmailCheck |
| 字符串  | s    | String   | sUserName    |
| 变体变量 | v    | Variant  | vAnything    |

### 运算符

- 算数：+ = * / %（取模，可以应用于隔行变色） 

  ```javascript
  window.onload = function(){
  	var oUL = document.getElementById('ul1')
  	var oli = oUL.getElementsByTagName('li')
  	for (i=0;i<oli.length;i++){
  		if ((i+1)%2==0){
  			oli[i].style.background='green'
  		}
  	}
  }
  ```

- 赋值：=、+=、-=、/=、*=、%=

- 关系：>、<、>=、<=、==、===、!=、!==(不转换类型直接比)

- 逻辑运算符：&& || !

- 优先级：利用括号改变算式的优先级，优先运算。

### 流程控制

if

```javascript
if(condition){
    
}else{
    
}
```

switch

```javascript
switch(变量)
{
      case 值1：
            ……
            break;
       case 值2：
            ……
            break;
       ……
       default:
            ……
}
```

三目运算符

```javascript
a%2==0?alert('双数'):alert('单数')
条件?结果1:other结果2
```

循环while，for（break，continue）

- cotinue：跳出本次循环继续下一次循环
- break：退出整个循环体

True or false

那么什么是真的什么是假的？

- true：可以返回true的布尔值的、非零数字、非空字符串、Object（window或者document）即非空对象也是真的
- false：false、数字0、空字符串、null、undefined

### Json

什么是json？

> Javascript Object Notation专门为js诞生的一个数据交换语言

for in：其实就是相当于一个简单的遍历

```
var a = {
	a:3,
	b:4,
	c:'123123',
}
var attr=''
for (attr in a){
	alert(attr+'='+a[attr])
}                
```

### 返回值

很简单，return 返回值即可。

关于函数的参数，和python很像，位置参数……不过多赘述。返回值不是必须的。当没有返回值的时候就会返回一个undefined。retrun空也是undefined。

- arguments：实质上是一个数组，用于参数不固定的情况，当然arguments和位置参数是可以共存的。

```javascript
function sum()
{
    var result = 0
    for(i=0;i<arguments.length;i++){
        result+=arguments[i]
    }
    alert(result);
}
```

**如何用JavaScript取非行间样式？**

通过document.get方式获取的直接调用对象的.style只能获取行间样式，如果要获取外联的或者写在head头部的，就不可以直接使用style而需要使用currentStyle来获取了，这个写法指的是获取计算后的样式，或者说当前样式，最终样式，叫法很多。

```javascript
oDiv1.currentStyle.width;
```

不过这个用法在不同的浏览器存在兼容性的问题，不过这个currentStyle只在ie下使用，火狐下使用getComputedStyle()，这个函数接受两个参数，第一个是要获取的对象，第二个是一个布尔值（true or false），这第二个参数其实没什么实际的意义。

``` javascript
getComputedStyle(oDiv1,false).width
```

在新版的火狐这个函数的第二个参数已经被取消。

兼容性的处理：

```javascript
if (oDiv1.currentStyle){
    //For IE
    alert(oDiv1.currentStyle.width);
}
else
{
    //For firefox
    alert(getComputedStyle(oDiv1).width);
}
```

但是使用if和else很麻烦，因此可以把这个功能封装成一个函数。

```javascript
//哪个元素，哪个样式
function getStyle(obj,attr){
    if (obj.currentStyle){
    //For IE，获取属性的时候不是点而是一个中括号
    alert(obj.currentStyle[attr]);
  }
else
{
    //For firefox
    alert(getComputedStyle(obj)[attr]);
  }
}
```

获取样式可以获取到有一些没有设置的默认值，比如font-size这种，但是针对于background这种复合样式支持是存在问题的。复合样式是获取不到的，只能获取到单一样式（基本样式）。

### 数组

数组的定义

```javascript
var arr = [1,2,3,4];
var arr = new Array(1,2,3,4);
```

数组的length是允许赋值的，比如说：

```javascript
//首先定义一个数组
var arr = [1,2,3,4]
arr.length=2;
alert(arr);
//此时你会发现虽然数组内容是1,2,3,4但是由于数组可以赋值，我们赋值为2，所以就打印出来了1和2.
//如果把数组的长度设置为大于数组实际长度的值，那些其他的位置会被undefined给填充。
```

如何清空数组：

```javascript
arr.length=0;
```

数组使用原则，数组中应该只存一种类型的变量，如果想寸多种的，建议使用json。

数组方法

- push：从尾部添加元素

  ```javascript
  arr.push(4)
  ```

- pop：从尾部弹出元素，默认删除最后一个

  ```javascript
  arr.pop()
  ```

- unshift()：从头部添加元素

  ```javascript
  arr.unshift(1)
  ```

- shift：从头部弹出元素

### 排序转换

#### sort

sort([比较函数])，排序一个数组

- 排序一个字符串数组
- 排序一个数字数组

```javascript
//普通排序，默认第一个字符的ascii顺序在排序，sort只认识字符串，不认识数字，因此他会把给的数字当做字符串进行排序。
arr.sort()
//因此为了解决这个问题，我们就要通过比较函数去比较排序
arr.sort(function(){
    //从小到大排序
    return num1-num2;
    //从大到小排序
    //return num2-num1;
})
```

#### 转换类

- concat(array)：把两个数组合并成一个大数组

  ```
  arr1.concat(arr2);
  ```

- join(delimeter分隔符)：使用指定的分隔符把数组的内容连成一个字符串。

  ```
  arr.join('-');
  ```

- split(分隔符)：用指定的分隔符将字符串分割成为一个数组。

  ```
  var arr = str.split('-');
  ```

### 数组的插入与删除

- splice(start,length,元素1，元素2……)

  ```javascript
  //从什么位置开始删除指定长度的元素
  arr.splice(2,3)
  //splice从指定位置插入，从第6个位置开始，删除0个元素，插入后面的元素。
  arr.splice(5,0,'a','b')
  //从某个位置插入几个元素然后插入几个元素实现替换的功能，下面的意思就是指的删两个插入两个实现替换的效果
  arr.splice(2,2,'lamber','mxy')
  ```

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
>
>
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





