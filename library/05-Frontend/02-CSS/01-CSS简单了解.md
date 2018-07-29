## CSS简单使用

[TOC]

## 0、CSS介绍

CSS（**C**ascading **S**tyle **S**heet，层叠样式表)定义**如何显示**HTML元素。

当浏览器读到一个样式表，它就会按照这个样式表来对文档进行格式化（渲染）。

## 1、选择器

```css
selector {
          property: value;
          property: value;
     ...  property: value
 
  }
```

比如：

```css
h1 {color:red; font-size:14px;}
```

![](http://omk1n04i8.bkt.clouddn.com/17-11-8/77825534.jpg)

### 1.1、基本选择器

![](http://omk1n04i8.bkt.clouddn.com/17-11-8/79864028.jpg)

### 1.2、组合选择器

```css
E,F   多元素选择器，同时匹配所有E元素或F元素，E和F之间用逗号分隔      :div,p { color:#f00; }
 
E F   后代(儿子，孙子都算后代)元素选择器，匹配所有属于E元素后代的F元素，E和F之间用空格分隔 :
      li a { font-weight:bold;｝，会把li下的所有的a都给设置上。
 
E > F   子元素选择器，匹配所有E元素的子元素F            :div > p { color:#f00; }
        只是父级元素的二级元素才会被选择上。三级以后就不会被选择上了
  
E + F   毗邻元素选择器，匹配所有紧随E元素之后的同级元素F  :div + p { color:#f00; } 
        什么叫毗邻，就是紧挨着，中间插个第三者这就不叫紧挨着了。放到它上面还不行，只能在下面紧挨着。
 
E ~ F   普通兄弟选择器（以破折号分隔）                 :.div1 ~ p{font-size: 30px; }
        也是向下找，但是不管你挨着不挨着，反正就是同一级别的就行。
```

注意，关于标签嵌套：

一般，块级元素可以包含内联元素或某些块级元素，但内联元素不能包含块级元素，它只能包含其它内联元素。需要注意的是，p标签不能包含块级标签。

### 1.3、属性选择器

```css
E[att]          匹配所有具有att属性的E元素，不考虑它的值。（注意：E在此处可以省略。
                比如“[cheacked]”。以下同。）   p[title] { color:#f00; }
 
 
E[att=val]      匹配所有att属性等于“val”的E元素   div[class=”error”] { color:#f00; }
 
 
E[att~=val]     匹配所有att属性具有多个空格分隔的值、其中一个值等于“val”的E元素
                td[class~=”name”] { color:#f00; }
 
E[attr^=val]    匹配属性值以指定值开头的每个元素                    
                div[class^="test"]{background:#ffff00;}
 
E[attr$=val]    匹配属性值以指定值结尾的每个元素    div[class$="test"]{background:#ffff00;}
 
E[attr*=val]    匹配属性值中包含指定值的每个元素    div[class*="test"]{background:#ffff00;}
```

##2、CSS的引用

### 2.1、CSS的四种引用方式

**行间样式**  （很少用）

```html
<!--行间样式很直观，但是只针对当前的标签生效，不具备统一修改的特效-->
<body>
	<div style="width: 100px;height: 100px;background: red;">
		aaa
	</div>	
</body>
```

**内联样式表** （仍然是在文件内部）

```html
<!--不写在行间，而是写在head的style标签内部，便于分别去管理-->
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<style type="text/css">
		#div1{
			width: 100px;
			height: 100px;
			background: green;
		}
	</style>
</head>
<body>
	<div id="div1">
		test
	</div>
</body>
</html>
```

**外联样式表** （用在外部，实际应用的方式）

```html
<!--从外部引用，将网页和样式进行分离-->
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
    <link rel="stylesheet" type="text/css" href="day1.css">
</head>
<body>
	<div id="div1">
		test
	</div>
</body>
</html>

<!--day1.css文件-->
#div1{
	width: 100px;
	height: 100px;
	background: yellow;
}
```

**导入式的方法**：

将一个独立的.css文件引入HTML文件中，导入式使用CSS规则引入外部CSS文件，style标记也是写在head标记中，使用的语法如下：    

```css
<style type="text/css">
 
          @import"mystyle.css"; 此处要注意.css文件的路径
 
</style>　
```

注意：

​      导入式会在整个网页装载完后再装载CSS文件，因此这就导致了一个问题，如果网页比较大则会儿出现先显示无样式的页面，闪烁一下之后，再出现网页的样式。这是导入式固有的一个缺陷。使用链接式时与导入式不同的是它会以网页文件主体装载前装载CSS文件，因此显示出来的网页从一开始就是带样式的效果的，它不会象导入式那样先显示无样式的网页，然后再显示有样式的网页，这是链接式的优点。

### 2.2、CSS的优先级

> 参考资料：https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity

首先说CSS的属性是可以继承的，继承是CSS的一个主要特征，它是依赖于祖先-后代的关系的。继承是一种机制，它允许样式不仅可以应用于某个特定的元素，还可以应用于它的后代。例如一个BODY定义了的颜色值也会应用到段落的文本中。

```css
body{color:red;}       <p>helloyuan</p>
```

这段文字都继承了由body {color:red;}样式定义的颜色。然而CSS继承性的权重是非常低的，是比普通元素的权重还要低的0。

```css
p{color:green}
```

发现只需要给加个颜色值就能覆盖掉它继承的样式颜色。由此可见：任何显示申明的规则都可以覆盖其继承样式。此外，继承是CSS重要的一部分，我们甚至不用去考虑它为什么能够这样，但CSS继承也是有限制的。有一些属性不能被继承，如：border, margin, padding, background等。

在聊CSS优先级之前，先聊一下元素的class，元素的class是允许存在多个的，比如：

```css
<div class="aaa bbb">
    lalala
</div>
```

在这种情况下属于同级调用，class之间的优先级是一样的，那么这个时候如果两个class之间有属性冲突的话，那么就会以css中下面的为准（css的读取从上往下读），简单来说就是同级的调用之间的是收到顺序的影响的。

不同级的属性调用之间，是存在不同的优先级的，优先级可以用数字来表示。

所谓CSS优先级，即是指CSS样式在浏览器中被解析的先后顺序。

样式表中的特殊性描述了不同规则的相对权重，它的基本规则是：

```
# 选择器的特殊性分为四个等级，分别为a,b,c,d
- 如果样式是行内样式那么a=1，对应的权重为1000(a=1,b=0,c=0,c=0)
- b表示ID选择器的个数，有一个id选择器那么b=1,有两个就是2，那么对应的权重就是0100或0200
- c等于类，伪类和属性选择器的数量。比如有一个对应的权重就是0010
- d等于类型选择器（其实就是标签选择器）和伪元素选择器的数量。比如有一个就是0001
```

- 内联样式表的权值最高                       style=""－－－－－－－－－－－－1000；
- 统计选择符中的ID属性个数。           #id －－－－－－－－－－－－－－100
- 统计选择符中的CLASS属性个数。    .class －－－－－－－－－－－－－10
- 统计选择符中的HTML标签名个数。 p －－－－－－－－－－－－－-－1

```html
1、#content div#main-content h2{}  
2、#content #main-content>h2{}     
3、body #content div[id="main-content"] h2{}
4、#main-content div.new-story h2{}
5、#main-content [class="new-story"] h2{}
6、div#main-content div.new-story h2.first{}

<!--对应的html代码-->
<div id="content">
    <div id="main-content">
        <h2>Strange Times</h2>
        <p>balabalabala</p>
        <div class="new-story">
            <h2 class="first">Bog Snorkeling Champion………………</h2>
            <p>balabalabala</p>
        </div>
    </div>
</div>

# 问题为两个标题都会按照序号几的样式去设置？答案是1
```

按这些规则将数字符串逐位相加，就得到最终的权重，然后在比较取舍时按照从左到右的顺序逐位比较。

>
>1、文内的样式优先级为1,0,0,0，所以始终高于外部定义。
>
>2、有!important声明的规则高于一切。
>
>```css
>.p2 {color:red!important;}
>```
>
>3、如果!important声明冲突，则比较优先权。
>
>4、如果优先权一样，则按照在源码中出现的顺序决定，后来者居上。
>
>5、由继承而得到的样式没有specificity的计算，它低于一切其它规则(比如全局选择符*定义的规则)。
>
>6、关于经由@import载入的外部样式，由于@import必须出现在所有其他规则定义之前(如不是，则浏览器应该忽略之)，所以按照后来居上原则，一般优先权冲突时是占下风的。

### 2.3、CSS的文本属性

#### 水平对齐方式&文本属性

文本的颜色，可以通过下面这三种方式设置。：

- 十六进制值 - 如: **＃**FF0000
- 一个RGB值 - 如: RGB(255,0,0)
- 颜色的名称 - 如:  red

text-align 属性规定元素中的文本的水平对齐方式。

- left      把文本排列到左边。默认值：由浏览器决定。
- right    把文本排列到右边。
- center 把文本排列到中间。
- justify 实现两端对齐文本效果。

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>css</title>
<style>
        h1 {text-align:center;}
        p.publish_time {text-align:right;}
        p.content {text-align:justify;}
</style>
</head>

<body>
<h1>CSS text-align 水平居中</h1>
<p class="publish_time">2017 年 5 月 17 号</p>
<p class="content">
    有个落拓不得志的中年人每隔三两天就到教堂祈祷，而且他的祷告词几乎每次都相同。第一次他到教堂时，
    跪在圣坛前，虔诚地低语：“上帝啊，请念在我多年来敬畏您的份上。让我中一次彩票吧！阿门。”
    几天后，他又垂头丧气回到教堂，同样跪着祈祷：“上帝啊，为何不让我中彩票？我愿意更谦卑地来
    服侍你，求您让我中一次彩票吧！阿门。”又过了几天，他再次出现在教堂，同样重复他的祈祷。如此周而
    复始，不间断地祈求着。到了最后一次，他跪着：“我的上帝，为何您不垂听我的祈求？让我中一次彩票吧！
    只要一次，让我解决所有困难，我愿终身奉献，专心侍奉您……”就在这时，圣坛上发出一阵宏伟庄严的声
    音：“我一直垂听你的祷告。可是最起码？你也该先去买一张彩票吧!”</p>
<p><b>注意：</b> 重置浏览器窗口大小查看 &quot;justify&quot; 是如何工作的。</p>
</body>

</html>
```

其他的文字属性：

```css
font-size: 10px;
line-height: 200px;   文本行高 通俗的讲，文字高度加上文字上下的空白区域的高度 50%:基于字体大小的百分比
vertical-align:－4px  设置元素内容的垂直对齐方式 ,只对行内元素有效，对块级元素无效
text-decoration:none  text-decoration 属性用来设置或删除文本的装饰。主要是用来删除链接的下划线
font-family: 'Lucida Bright'
font-weight: lighter/bold/border/
font-style: oblique
text-indent: 150px;      首行缩进150px
letter-spacing: 10px;  字母间距
word-spacing: 20px;  单词间距
text-transform: capitalize/uppercase/lowercase ; 文本转换，用于所有字句变成大写或小写字母，或每个单词的首字母大写
```

### 2.4、CSS的样式了解

#### 颜色值：

- 十六进制表示法，比如：background: #3CC; //#33CCCC，这种的就可以进行缩写

- RGB模式，比如：rgb(100,255,233) //[RBG颜色对照表](http://tool.oschina.net/commons?type=3)

- RGBA模式，在RBG的基础上调整透明度，比如：background: rgba(255,0,0,0.5);或者使用opacity这个来调整透明度。范围是0~1,1表示颜色的纯色。

  ![](http://omk1n04i8.bkt.clouddn.com/17-10-30/37912135.jpg)

- 颜色的单词，比如：red，green等

#### 注释

```css
/*  我是被注释的内容  */
```

#### 背景图片

```css
background-image: url(img/b.png);
```

默认的情况下是平铺：

![](http://omk1n04i8.bkt.clouddn.com/17-10-30/69719727.jpg)

如果不想平铺的话我们可以进行设置（背景图片层级要高于背景颜色）

```css
background-repeat: no-repeat;
```

还可以设置为横向重复：

```css
background-repeat: repeat-x;
```



![](http://omk1n04i8.bkt.clouddn.com/17-10-30/34906123.jpg)

设置垂直平铺：

```css
background-repeat: repeat-y;
```

![](http://omk1n04i8.bkt.clouddn.com/17-10-30/62538269.jpg)

#### 设置背景定位

调整图片的定位可以使用background-position这个设置参数。

```css
background-position: 50px 30px;   # 使用像素值，第一个值最好写x轴，第二个值最好写y
background-position: -50px -30px; # 同样也支持负值
background-position: 50% 30px;    # 使用百分比
background-position: left bottom;   # 使用位置单词
/*x轴有left center right三种位置。默认居中*/
/*y轴有top，center，bottom，默认居中*/

如果写成：
background-position: center;   # 默认全放在中间 
```

如果你在设置定位的时候同时还使用了水平平铺或者垂直平铺，没被覆盖到的位置会被图片的其他部分补齐，比如：

![](http://omk1n04i8.bkt.clouddn.com/17-10-30/38561136.jpg)

如果设置的div容器的大小小于图片的话，那么就是能看到多少就是看到多少。

**设置图片不随着滚动条滚动**

```css
background-attachment: fixed;
```

**复合样式**

```css
/*这个顺序是可以任意调整的，没有的就不写，但是position定位xy轴是放到一块写的*/
background: red url(img/maka.jpg) no-repeat center fixed;
```

#### 边框

```css
/*设置元素的border属性*/
#div1{
	width: 100px;
	height: 100px
	border: 2px solid red;
}
- solid：实线
- dashed：虚线
- dotted：点线
```

边框肯定是四条边，我们可以针对这四条边进行拆分的：

```css
border-top: 3px solid red;
border-left: 3px dotted green;
border-right: 3px dashed blue;
border-bottom: 3px solid yellow;
```

![](http://omk1n04i8.bkt.clouddn.com/17-10-30/18069121.jpg)

#### 列表属性

```css
list-style-type         设置列表项标志的类型。（一般设置为None）
list-style-image    将图象设置为列表项标志。
list-style-position 设置列表中列表项标志的位置。
list-style          简写属性。用于把所有用于列表的属性设置于一个声明中（一般设置为None）
```

list-style-type属性指定列表项标记的类型：

```css
ul { list-style-type: square; }
```

使用图像来替换列表项的标记:

```css
ul {
     list-style-image: url('');
}
```

#### display属性

- none

  ```css
  p{display:none;}

  注意与visibility:hidden的区别：
  visibility:hidden可以隐藏某个元素，但隐藏的元素仍需占用与未隐藏之前一样的空间。也就是说，该元素虽然被隐藏了，但仍然会影响布局。
  display:none可以隐藏某个元素，且隐藏的元素不会占用任何空间。也就是说，该元素不但被隐藏了，而且该元素原本占用的空间也会从页面布局中消失。
  ```

- block（内联标签设置为块级标签）

  ```css
  span {display:block;}
  注意：一个内联元素设置为display:block是不允许有它内部的嵌套块元素。　
  ```

- inline

  ```css
  # 块级别标签设置为内联级别的标签
  li {display:inline;}
  # 比如上面的把li设置一行显示，而不是独占一行。内容撑开宽高。
  # 内联标签不能设置长宽，不支持上下的margin，代码换行被解析
  ```

- inline-block(设置成内联形式的块元素，可以设置长宽了；没有宽度的时候内容撑开宽度)

  ```css
  display:inline-block可做列表布局，其中的类似于图片间的间隙小bug可以通过如下设置解决：
  #outer{
              border: 3px dashed;
              word-spacing: -5px;
          }
  ```

#### 浮动Float

float：left|right|none|inherit

文档流：是文档中可以显示对象在排列时所占用的位置。

浮动的定义：使元素脱离文档流，按照指定方向发生移动，遇到父级边界或者相邻的浮动元素停下来

浮动的顺序是按照元素在页面从上到下的顺序加载的。

浮动的基本特征：

- 块在一排显示
- 内联支持宽高
- 默认文档撑开宽度
- 脱离文档流
- 提升层级半层

清除浮动的方法：

- 加高度（扩展性不好）
- 父级也浮动（页面中所有的元素都浮动，margin左右自动失效，因此也不是很好的方法）
- inline-block方法清除浮动：会导致margin左右的auto失效
- 空标签清除浮动：但是只要用到浮动的地方就要去放一个空标签也是不合适的。
- br清除浮动：br有一个属性叫`clear="all"`，不符合工作中的结构，行为，样式的三者分离的要求
- after伪类：清除浮动的方法

下边的元素会判断你上级的元素是否是浮动的。

clear：left|right|both|none|inherit

元素在某个方向上不能有浮动元素，clear both指的是两侧均不予许有浮动元素。



## 3、简单的PS抠图



## 4、网易新闻小结构案例

