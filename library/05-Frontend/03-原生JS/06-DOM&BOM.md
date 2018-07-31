# DOM&BOM

> http://www.cnblogs.com/yuanchenqi/articles/5980312.html
>
> http://www.cnblogs.com/yuanchenqi/articles/6893904.html

## BOM

BOM（浏览器对象模型），可以对浏览器窗口进行访问和操作。使用 BOM，开发者可以移动窗口、改变状态栏中的文本以及执行其他与页面内容不直接相关的动作。使 JavaScript 有能力与浏览器“对话”。

**window对象**

```
所有浏览器都支持 window 对象。
概念上讲.一个html文档对应一个window对象.
功能上讲: 控制浏览器窗口的.
使用上讲: window对象不需要创建对象,直接使用即可.
```

**window对象方法**

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

**方法使用**

```javascript
//----------alert confirm prompt----------------------------
//alert('aaa');
    
    
/* # 如果确认返回true
var result = confirm("您确定要删除吗?");
alert(result); 
*/

//prompt 参数1 : 提示信息.   参数2:输入框的默认值. 返回值是用户输入的内容.

// var result = prompt("请输入一个数字!","haha");
// alert(result);


方法讲解:    
//open方法 打开和一个新的窗口 并 进入指定网址.参数1 : 网址.
//调用方式1
//open("http://www.baidu.com");
//参数1 什么都不填 就是打开一个新窗口.  参数2.填入新窗口的名字(一般可以不填). 参数3: 新打开窗口的参数.
open('','','width=200,resizable=no,height=100'); // 新打开一个宽为200 高为100的窗口
//close方法  将当前文档窗口关闭.
//close();
```

猜数示例：

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

定时器的使用

```javascript
# setInterval() 方法会不停地调用函数，直到 clearInterval() 被调用或窗口被关闭。由 setInterval() 返回的 ID 值可用作 clearInterval() 方法的参数。
语法：<br>     setInterval(code,millisec)
其中，code为要调用的函数或要执行的代码串。millisec周期性执行或调用 code 之间的时间间隔，以毫秒计。
```

Location的使用

```javascript
Location 对象包含有关当前 URL 的信息。
Location 对象是 Window 对象的一个部分，可通过 window.location 属性来访问。

Location 对象方法
location.assign(URL)
location.reload()
location.replace(newURL)//注意与assign的区别
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

## DOM中级

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

![](http://omk1n04i8.bkt.clouddn.com/18-7-31/19321428.jpg)



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

### 常用操作

#### 常用节点操作

```javascript
createElement：创建节点
appendChild:把节点添加到最后作为最后的子节点
insertBefore(newnode,某个节点):把增加的节点放到某个节点的前面
removeChild：删除节点
replaceChild(newnode,某个节点)：替换节点
```

#### 常用查找节点的方式

```javascript
document.getElementById('')
document.getElementByTagName('div')  # 返回的是一个数组
document.getElementByName('name')
document.getElementByClassName('cls_name') # 返回的是一个数组
```

常用导航节点属性

```javascript
parentElement           // 父节点标签元素
children                // 所有子标签
firstElementChild       // 第一个子标签元素
lastElementChild        // 最后一个子标签元素
nextElementtSibling     // 下一个兄弟标签元素
previousElementSibling  // 上一个兄弟标签元素
# 注意，js中没有办法找到所有的兄弟标签！
```

#### 常用节点属性操作

1、获取文本节点的值：innerText    innerHTML

2、attribute操作

```
     elementNode.setAttribute(name,value)    

     elementNode.getAttribute(属性名)        <-------------->elementNode.属性名(DHTML)

     elementNode.removeAttribute(“属性名”);
```

3、value获取当前选中的value值

- input   
- select （selectedIndex）
- textarea  

4、innerHTML 给节点添加html代码：

        ```
#  该方法不是w3c的标准，但是主流浏览器支持    
tag.innerHTML = “<p>要显示内容</p>”;
        ```

5、关于class的操作：

```javascript
elementNode.className
elementNode.classList.add
elementNode.classList.remove
```

6、改变css样式：

```javascript
<p id="p2">Hello world!</p>
document.getElementById("p2").style.color="blue";
document.getElementById("p2").style.fontSize=48px
```

### DOM事件

#### 事件类型

```javascript
# 当用户点击某个对象时调用的事件句柄。
onclick    

# 当用户双击某个对象时调用的事件句柄。
ondblclick     

# 元素获得焦点。   练习：输入框
onfocus    

# 元素失去焦点;应用场景：用于表单验证,用户离开某个输入框时,代表已经输入完了,我们可以对它进行验证.
onblur         

# 域的内容被改变。应用场景：通常用于表单元素,当元素内容被改变时触发.（三级联动）
onchange       

# 某个键盘按键被按下。应用场景: 当用户在最后一个输入框按下回车按键时,表单提交.
onkeydown

# 某个键盘按键被按下并松开。
onkeypress     

# 某个键盘按键被松开。
onkeyup        

# 一张页面或一幅图像完成加载。
onload         

# 和鼠标相关的操作
onmousedown    鼠标按钮被按下。
onmousemove    鼠标被移动。
onmouseout     鼠标从某元素移开。
onmouseover    鼠标移到某元素之上。
onmouseleave   鼠标从元素离开


onselect       文本被选中。
onsubmit       确认按钮被点击。
```

#### 事件绑定的方式

方式1：

```javascript
<div id="div" onclick="foo(this)">点我呀</div>

<script>
    function foo(self){           // 形参不能是this;
        console.log("点你大爷!");
        console.log(self);   
    }
</script>
```

方式2：

```javascript
<p id="abc">试一试!</p>

<script>

    var ele=document.getElementById("abc");

    ele.onclick=function(){
        console.log("ok");
        console.log(this);    // this直接用
    };

</script>
```

#### 事件介绍

##### onload

onload 属性开发中 只给 body元素加.这个属性的触发 标志着 页面内容被加载完成.应用场景: 当有些事情我们希望页面加载完立刻执行,那么可以使用该事件属性，比如`window.onload = function(){xxxx}`

##### onsubmit

当表单在提交时触发. 该属性也只能给form元素使用.应用场景: 在表单提交前验证用户输入是否正确.如果验证失败.在该方法中我们应该阻止表单的提交.

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

    <script>

        window.onload=function(){
            //阻止表单提交方式1().
            //onsubmit 命名的事件函数,可以接受返回值. 其中返回false表示拦截表单提交.其他为放行.

             var ele=document.getElementById("form");
             ele.onsubmit=function(event) {
            //    alert("验证失败 表单不会提交!");
            //    return false;

            // 阻止表单提交方式2 event.preventDefault(); ==>通知浏览器不要执行与事件关联的默认动作。
             alert("验证失败 表单不会提交!");
             event.preventDefault();

    }

        };

    </script>
</head>
<body>

<form id="form">
            <input type="text"/>
            <input type="submit" value="点我!" />
</form>

</body>
</html>
```

##### 事件传播

```javascript
<div id="abc_1" style="border:1px solid red;width:300px;height:300px;">
        <div id="abc_2" style="border:1px solid red;width:200px;height:200px;">
        </div>
</div>

<script type="text/javascript">
        document.getElementById("abc_1").onclick=function(){
            alert('111');
        };
        document.getElementById("abc_2").onclick=function(event){
            alert('222');
            event.stopPropagation(); //阻止事件向外层div传播.
        }
</script>
```

##### onkeydown

Event 对象：Event 对象代表事件的状态，比如事件在其中发生的元素、键盘按键的状态、鼠标的位置、鼠标按钮的状态。 事件通常与函数结合使用，函数不会在事件发生前被执行！event对象在事件发生时系统已经创建好了,并且会在事件函数被调用时传给事件函数.我们获得仅仅需要接收一下即可.比如onkeydown,我们想知道哪个键被按下了，需要问下event对象的属性，这里就是KeyCode.

```javascript
<input type="text" id="t1"/>
<script type="text/javascript">
    var ele=document.getElementById("t1");
    ele.onkeydown=function(e){
        e=e||window.event;
        var keynum=e.keyCode;
        var keychar=String.fromCharCode(keynum);
        alert(keynum+'----->'+keychar);
    };
</script>
```

##### onmouseout&onmouseleave的区别

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        #container{
            width: 300px;
        }
        #title{
            cursor: pointer;
            background: #ccc;
        }
       #list{
           display: none;
           background:#fff;
       }

        #list div{
            line-height: 50px;
        }
        #list  .item1{
            background-color: green;
        }

         #list  .item2{
            background-color: rebeccapurple;
        }

         #list  .item3{
            background-color: lemonchiffon;
        }


    </style>
</head>
<body>


<p>先看下使用mouseout的效果:</p>

<div id="container">
        <div id="title">使用了mouseout事件↓</div>
        <div id="list">
                <div class="item1">第一行</div>
                <div class="item2">第二行</div>
                <div class="item3">第三行</div>
        </div>
</div>


<script>

// 1.不论鼠标指针离开被选元素还是任何子元素，都会触发 mouseout 事件。

// 2.只有在鼠标指针离开被选元素时，才会触发 mouseleave 事件。

   var container=document.getElementById("container");
   var title=document.getElementById("title");
   var list=document.getElementById("list");


   title.onmouseover=function(){
       list.style.display="block";
   };

   container.onmouseleave=function(){  // 改为mouseout试一下
       list.style.display="none";
   };

/*

因为mouseout事件是会冒泡的，也就是onmouseout事件可能被同时绑定到了container的子元素title和list
上，所以鼠标移出每个子元素时也都会触发我们的list.style.display="none";

*/


  /*
  思考:
  if:

       list.onmouseout=function(){
           list.style.display="none";
   };


     为什么移出第一行时,整个list会被隐藏?

     其实是同样的道理,onmouseout事件被同时绑定到list和它的三个子元素item上,所以离开任何一个
     子元素同样会触发list.style.display="none";

   */

</script>
</body>
</html>
```



### 文档碎片

- 文档碎片可以提高DOM操作性能（理论上），有时候还会降低性能，这个东西其实很诡异，一般只有面试用得到。实际性能提升的很低。
- 文档碎片原理
- document.createDocumentFragment()

