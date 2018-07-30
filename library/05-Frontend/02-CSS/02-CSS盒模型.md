# CSS盒模型

[TOC]

## 伪类&伪元素

> 参考内容:
>
> https://blog.csdn.net/ansenamerson/article/details/71250093
>
> 伪元素特效应用：
>
> https://www.jb51.net/css/461830.html
>
> https://blog.csdn.net/natalie86/article/details/44656247

### 伪类

伪类包含两种，状态伪类和结构性伪类，状态伪类专用于控制链接的显示效果。

```css
a:link（没有接触过的链接）,用于定义了链接的常规状态。
a:hover（鼠标放在链接上的状态）,用于产生视觉效果。
a:visited（访问过的链接）,用于阅读文章，能清楚的判断已经访问过的链接。
a:active（在链接上按下鼠标时的状态）,用于表现鼠标按下时的链接状态。
a:focus 应用于用于键盘输入焦点的元素

伪类选择器 : 伪类指的是标签的不同状态:
a ==> 点过状态 没有点过的状态 鼠标悬浮状态 激活状态
a:link {color: #FF0000} /* 未访问的链接 */
a:visited {color: #00FF00} /* 已访问的链接 */
a:hover {color: #FF00FF} /* 鼠标移动到链接上 */
a:active {color: #0000FF} /* 选定的链接 */ 格式: 标签:伪类名称{ css代码; }
```

结构性伪类是CSS3新增的选择器，比如，具体内容可以移步到css3章节查看：

```css
E:nth-last-child(n) 表示E父元素中的第n个子节点，从后往前计算
E:nth-of-type(n) 表示E父元素中的第n个子节点，类型为E
E:nth-last-of-type(n) 表示E父级元素中的第n个子节点，类型为E，从后往前计算
E:empty 表示匹配E元素中没有子节点的，并且里面没有内容的。其实就是找一个空标签，有文字不行，在这里文字也算一个节点。
E:first-child 表示E元素中的第一个子节点，相当于nth-child(1)
E:last-child 表示E元素中的最后一个子节点，相当于nth-last-child(1)
E:first-of-type 表示E父元素中的第一个子节点且节点类型为E的，等价于nth-of-type(1)
E:last-of-type 表示E父元素中的最后一个子节点且节点类型为E的，等价于nth-last-of-type(1)
E:only-child 表示E元素中只有一个子节点，注意：子节点不包含文本节点
E:only-of-type：表示E的父元素只有一个子节点，且这个唯一的子节点类型必须是E，注意子节点不包含文本节点
```

### 伪元素

**伪元素**是对元素中的特定内容进行操作，而不是描述状态。它的操作层次比伪类更深一层，因此动态性比伪类低很多。实际上，伪元素就是选取某些元素前面或后面这种普通选择器无法完成的工作。控制的内容和元素是相同的，但它本身是基于元素的抽象，并不存在于文档结构中！常见的伪元素选择器包括：

```
:first-letter 选择元素文本的第一个字（母）。
:first-line 选择元素文本的第一行。
:before 在元素内容的最前面添加新内容。
:after 在元素内容的最后面添加新内容。

# 动态的添加内容
p:after{
    content:'hello world'
    color:red
}

p:before
```

单冒号(:)用于 CSS3 伪类，双冒号(::)用于 CSS3 伪元素。对于 CSS2 中已经有的伪元素，例如 :before，单冒号和双冒号的写法 ::before 作用是一样的。目的其实是为了区分伪类和伪元素，而且大部分的浏览器都是识别这种标识方法的。

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

### 伪元素的应用

#### 给首字母设置特殊样式

```css
p:first-letter {
  font-size: 48px;
  color: red;
}
```

#### 清浮动

```css
.clear:after {
    content: '';
    display: block;
    clear: both;
}
```

#### 画分割线

```html
<style>
    * {
      padding: 0;
      margin: 0;
    }
    .spliter::before, .spliter::after {
      content: '';
      display: inline-block;
      border-top: 1px solid black;
      width: 200px;
      margin: 5px;
    }
  </style>
</head>
<body>
  <p class="spliter">分割线</p>
</body>
```

#### 做一个消息气泡

```html
<head>
    <style>
        #bubble{
            position: relative;
            width:300px;
            height:150px;
            background-color: #5bc0de;
            margin: 200px auto;
            border-radius: 10px;
        }
        #bubble:before{
            position: absolute;
            content: '';
            width: 0;
            height: 0;
            right: 100%;
            top: 60px;
            border-top: 15px solid transparent;
            border-right: 30px solid #000;
            border-bottom: 15px solid transparent;
        }
    </style>
</head>
<body>

<div id="bubble"></div>
```

![](http://omk1n04i8.bkt.clouddn.com/18-7-30/35449268.jpg)

伪元素的本质是在不增加dom结构的基础上添加的一个元素，在用法上跟真正的dom无本质区别。普通元素能实现的效果，伪元素都可以。有些用伪元素效果更好，代码更精简。

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

如果父级div中没有border，padding，inlinecontent，子级div的margin会一直向上找，直到找到某个标签包括border，padding，inline content中的其中一个，然后按此div 进行margin；

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

## Tip

### 默认高度和宽度的问题

（1）父子都是块级元素

```html
<!DOCTYPE html>
<html>
<head>
    <title>fortest</title>
    <style>
        div.parent{
            width: 500px;
            height: 300px;
            background: #ccc;
        }
        div.son{
            width: 100%;
            height: 200px;
            background: green;
        }
    </style>
</head>
<body>
    <div class="parent">
        <div class="son"></div>
    </div>
</body>
</html>
```

这时，子元素设置为了父元素width的100%，那么子元素的宽度也是500px；但是如果我们把子元素的width去掉之后，就会发现子元素还是等于父元素的width。**也就是说，对于块级元素，子元素的宽度默认为父元素的100%。**

> **当我们给子元素添加padding和margin时，可以发现宽度width是父元素的宽度减去子元素的margin值和padding值。**

**毫无疑问，如果去掉子元素的height，就会发先子元素的高度为0，故height是不会为100%的，**一般我们都是通过添加内容（子元素）将父元素撑起来。

（2）父：块级元素  子：内联元素

如果内联元素是不可替换元素（除img，input以外的一般元素），元素是没有办法设置宽度的，也就谈不上100%的问题了。 即内联元素必须依靠其内部的内容才能撑开。

如果内联元素是可替换元素（img，input，本身可以设置长和宽），**不管怎么设置父元素的宽度和高度，而不设置img的宽和高时，img总是表现为其原始的宽和高。**

```html
<!DOCTYPE html>
<html>
<head>
    <title>...</title>
    <style>
        div.parent{
            width: 500px;
            height: 300px;
            background: #ccc;
        }
        img{
            height: 100px;
            background: green;
        }
    </style>
</head>
<body>
    <div class="parent">
        <img class="son" src="s1.jpg"></img>
    </div>
</body>
</html>
```

由此我们可以发现，虽然没有设置宽度，但是表现在浏览器上为160px，它并没有继承父元素的100%得到500px，而是根据既定的高度来等比例缩小宽度。  同样， 如果只设置width，那么height也会等比例改变。   如果我们把img的width设置为100%，就可以发现其宽度这时就和父元素的宽度一致了。而我们一般的做法时，首先确定img的父元素的宽度和高度，然后再将img的宽度和高度设置为100%，这样，图片就能铺满父元素了。

## 后台布局框架

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

    <style>

        .pg-header{
           height: 48px;
           width: 100%;
           background-color: #2459a2;
           position: fixed;
           top:0;
           left: 0;
        }
        .left{
            position:absolute;
            left:0;
            top:48px;
            bottom:0;
            width:200px;
            background-color: #ededed;
        }

        .right{
            position:absolute;
            right:0;
            left:200px;
            top:48px;
            bottom:0;
            overflow:auto;

        }
        .content{
            height: 2000px;
            width: 100%;
           
        }
    </style>
</head>
<body>


<div class="pg-header"></div>
<div>
    <div class="left">

    </div>
    <div class="right">
      <div class="content"></div>
    </div>
</div>

</body>
</html>
```

