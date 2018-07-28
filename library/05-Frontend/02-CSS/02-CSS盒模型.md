# CSS盒模型

## 伪类
伪类专用于控制链接的显示效果
```css
a:link（没有接触过的链接）,用于定义了链接的常规状态。
a:hover（鼠标放在链接上的状态）,用于产生视觉效果。
a:visited（访问过的链接）,用于阅读文章，能清楚的判断已经访问过的链接。
a:active（在链接上按下鼠标时的状态）,用于表现鼠标按下时的链接状态。

伪类选择器 : 伪类指的是标签的不同状态:
a ==> 点过状态 没有点过的状态 鼠标悬浮状态 激活状态
a:link {color: #FF0000} /* 未访问的链接 */
a:visited {color: #00FF00} /* 已访问的链接 */
a:hover {color: #FF00FF} /* 鼠标移动到链接上 */
a:active {color: #0000FF} /* 选定的链接 */ 格式: 标签:伪类名称{ css代码; }

# 动态的添加内容
p:after{
    content:'hello world'
    color:red
}

p:before
```

示例：

```css
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

    <style>

       .top{
           background-color: rebeccapurple;
           width: 100px;
           height: 100px;
       }
        .bottom{
            background-color: green;
            width: 100px;
            height: 100px;
        }

        .outer:hover .bottom{
            background-color: yellow;
        }

        注意:一定是outer:hover  控制outer里某一个标签,否则无效

        .top:hover .bottom{
            background-color: yellow;
        }
    </style>
</head>
<body>


<div class="outer">
    <div class="top">top</div>
    <div class="bottom">bottom</div>
</div>
</body>
</html>
```





如果想要一个简单的居中可以使用line-height=容器的高，然后text-align的值是center



overflow-hidden

当内容的高度超过容器设置的高度以后会溢出，因此有时候我们会去设置这个overflow-hidden这个参数，让它隐藏，被隐藏的部分可以以滚动条的形式查看。但是拥有overflow:hidden样式的块元素内部的元素溢出并不总是被隐藏，具体来说，需要同时满足以下条件：

- 有overflow:hidden样式的块元素不具有position:relative和position:absolute样式；
- 内部溢出的元素是通过position:absolute绝对定位；

## 盒模型

![](http://omk1n04i8.bkt.clouddn.com/17-11-9/55577387.jpg)

- **margin**:            用于控制元素与元素之间的距离；margin的最基本用途就是控制元素周围空间的间隔，从视觉角度上达到相互隔开的目的。注意两个元素的margin是会重叠的，按照两者之间大的算，比如两个div一个margin是20，一个是30，
- **padding**:           用于控制内容与边框之间的距离；   
- **Border**(边框):     围绕在内边距和内容外的边框。
- **Content**(内容):   盒子的内容，显示文本和图像。

### margin

**单边外边距属性：**

```css
margin-top:100px;
margin-bottom:100px;
margin-right:50px;
margin-left:50px;
```

当然margin也是一个复合属性，我可以直接用一个margin来写四条边的：

```css
margin:10px 20px 20px 10px；

        上边距为10px
        右边距为20px
        下边距为20px
        左边距为10px

margin:10px 20px 10px;

        上边距为10px
        左右边距为20px
        下边距为10px

margin:10px 20px;

        上下边距为10px
        左右边距为20px

margin:25px;

        所有的4个边距都是25px
```

居中的用法

```css
margin: 0 auto;
```

### padding（内填充）

单独使用填充属性可以改变上下左右的填充。缩写填充属性也可以使用，一旦改变一切都改变。

设置同margine；(padding会影响盒子大小，简单来说可以用padding给撑起来)

**思考1: ** body的外边距

​       边框在默认情况下会定位于浏览器窗口的左上角，但是并没有紧贴着浏览器的窗口的边框，这是因为body本身也是一个盒子（外层还有html），在默认情况下，   body距离html会有若干像素的margin，具体数值因各个浏览器不尽相同，所以body中的盒子不会紧贴浏览器窗口的边框了，为了验证这一点，加上：

```css
body{
    border: 1px solid;
    background-color: cadetblue;
}
```

解决方法：

```css
body{
    margin: 0;
}
```

**思考2：**margin collapse（边界塌陷或者说边界重叠）

1、兄弟div：
上面div的margin-bottom和下面div的margin-top会塌陷，也就是会取上下两者margin里最大值作为显示值（塌陷的重叠只会针对上下，不针对左右。）

2、父子div：
if 父级div中没有border，padding，inlinecontent，子级div的margin会一直向上找，直到找到某个标签包括border，padding，inline content中的其中一个，然后按此div 进行margin；

示例：

```html
<!DOCTYPE html>
<html lang="en" style="padding: 0px">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>

        body{
            margin: 0px;
        }

        .div1{
            background-color: rebeccapurple;
            width: 300px;
            height: 300px;
            overflow: hidden;

        }
        .div2{
            background-color: green;
            width: 100px;
            height: 100px;
            margin-bottom: 40px;
            margin-top: 20px;
        }
        .div3{
            background-color:teal;
            width: 100px;
            height: 100px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
<div style="background-color: bisque;width: 300px;height: 300px"></div>

<div class="div1">

   <div class="div2"></div>
   <div class="div3"></div>
</div>

</body>

</html>
```

解决方案：

```css
overflow: hidden;　　
```







float会覆盖div但是不会影响文字

## CSS中的定位（position）

```css
position:relative; 相对定位
- 不影响元素本身的特性
- 不使元素脱离文档流，元素移动之后原始位置会被保留
- 如果没有定位偏移量，对元素本身没有任何影响
- 提升层级

定位元素位置控制： top/right/bottom/left 定位元素偏移量
```

示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <style>
        #div1{width: 200px;height: 200px;background: red}
        #div2{width: 200px;height: 200px;background: green;position: relative;left: 200px;top: 200px}
        #div3{width: 200px;height: 200px;background: blue}
    </style>
</head>
<body>
    <div id='div1'></div>
    <div id='div2'></div>
    <div id='div3'></div>
</body>
</html>
```

![](http://omk1n04i8.bkt.clouddn.com/17-12-6/16357681.jpg)

```css
position:absolute; 绝对定位
- 使元素脱离文档流
- 是内嵌元素支持宽高
- 块属性标签内容撑开宽度
- 如果有定位父级相对于定位父级发生偏移，没有定位父级相对于document发生偏移
- 相对定位一般都是配合绝对定位元素使用
- 提升层级

z-index：[number]；  定位层级
- 定位元素默认后者层级高于前者
- 建议在兄弟标签之间比较层级
```

示例参考：

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
		<style>
			body{
				position: relative;
			}
			div{
				width: 200px;
				height: 200px;
			}
			.div1{
				background-color: red;
			}
			.div2{
				position: absolute;
				left:200px;
				top:400px; # 距离body的。
				background-color: blue;
			}
			.div3{
				position: absolute;
				top: 400px;
				background-color: green;
			}
		</style>
	</head>
	<body>
		<div class="div1">div1</div>
		<div class="div2">div2</div>
		<div class="div3">div3</div>
	</body>
</html>

```



```css
position:fixed; 固定定位
与绝对定位的特性基本一致，差别是始终相对于整个文档进行定位；
问题：IE6不支持固定定位


示例：
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
		<style>
			body{
				height: 3000px;
			}
			div{
				width: 100px;
				height: 100px;
				background-color: red;
				position: fixed;
				right: 0;
				bottom: 0;
			}
		</style>
	</head>
	<body>
		<div>返回顶部</div>
	</body>
</html>


其他不常用定位：
position：static；默认值
position：inherit；从父级元素继承定位属性的值

position：relative|absolute|fixed|static|inherit
```

### 透明度

```css
opacity:0~1; 1表示不透明，0表示完全透明。这个内容是默认继承父级的透明度的。
```

广告弹层示例：

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
		<style type="text/css">
			div{
				width: 300px;
				height: 300px;
			}
			.box{
				margin: 100px auto;
				position: relative;
			}
			.content{
				position: absolute;
				background-color: blue;
				left: -6px;
				top: -6px;
				z-index: 2;
			}
			.mark{
				position: absolute;
				background-color: black;
				right: -6px;
				bottom: -6px;
				z-index: 1;
				opacity: 0.5;
			}
		</style>
	</head>
	<body>
		<div class="box">
			<div class="content"></div>
			<div class="mark"></div>
		</div>
	</body>
</html>
```

