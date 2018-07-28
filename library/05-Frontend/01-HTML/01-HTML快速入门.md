# HTML快速入门

> 参考资料：http://www.cnblogs.com/yuanchenqi/articles/6835654.html

## 1-HTML基础

### 1.1 html是什么？

- 超文本标记语言（Hypertext Markup Language，HTML）通过**标签语言**来标记要显示的网页中的各个部分。一套规则，浏览器认识的规则
- 浏览器按顺序渲染网页文件，然后根据标记符解释和显示内容。但需要注意的是，对于不同的浏览器，对同一标签可能会有不完全相同的解释（兼容性）
- 静态网页文件扩展名：.html 或 .htm

### 1.2 html不是什么

HTML 不是一种编程语言，而是一种标记语言 (markup language)

HTML 使用标记标签来描述网页

### 1.3 html的结构

![](http://omk1n04i8.bkt.clouddn.com/17-10-29/37492664.jpg)

- `<!DOCTYPE html> `告诉浏览器使用什么样的html或者xhtml来解析html文档
- `<html></html>`是文档的开始标记和结束标记。此元素告诉浏览器其自身是一个 HTML 文档，在它们之间是文档的头部<head>和主体<body>。 
- `<head></head>`元素出现在文档的开头部分。<head>与</head>之间的内容不会在浏览器的文档窗口显示，但是其间的元素有特殊重要的意义。
- `<title></title>`定义网页标题，在浏览器标题栏显示。  
- `<body></body>`之间的文本是可见的网页主体内容

到了html5以后结构变得更加的细化：

![](http://omk1n04i8.bkt.clouddn.com/17-10-29/10107051.jpg)

### 1.4 html标签格式

![](http://omk1n04i8.bkt.clouddn.com/17-10-29/23230425.jpg)

标签的语法：

<标签名 属性1=“属性值1” 属性2=“属性值2”……>内容部分</标签名>
<标签名 属性1=“属性值1” 属性2=“属性值2”…… />

### 1.5 常用标签

#### 1.5.1 <!DOCTYPE>标签

<!DOCTYPE> 声明位于文档中的最前面的位置，处于 <html> 标签之前。此标签可告知浏览器文档使用哪种 HTML 或 XHTML 规范。

作用：声明文档的解析类型(document.compatMode)，避免浏览器的怪异模式。
document.compatMode：

1. BackCompat：怪异模式，浏览器使用自己的怪异模式解析渲染页面。
2. CSS1Compat：标准模式，浏览器使用W3C的标准解析渲染页面。

这个属性会被浏览器识别并使用，但是如果你的页面没有DOCTYPE的声明，那么compatMode默认就是BackCompat

#### 1.5.2 \<head\>内常用标签

##### \<meta\>标签

meta介绍
`<meta>`元素可提供有关页面的元信息（meta-information），针对搜索引擎和更新频度的描述和关键词。
`<meta>`标签位于文档的头部，不包含任何内容。
`<meta>`提供的信息是用户不可见的

meta标签的组成：meta标签共有两个属性，它们分别是http-equiv属性和name 属性，不同的属性又有不同的参数值，这些不同的参数值就实现了不同的网页功能。

- 设置字符集：

  ```html
  <!--设置字符集-->
  <meta charset="UTF-8" />
  ```

- name属性: 主要用于描述网页，与之对应的属性值为content，content中的内容主要是便于搜索引擎机器人查找信息和分类信息用的。    

  ```html
  <meta name="keywords" content="meta总结,html meta,meta属性,meta跳转">
  <meta name="description" content="哈哈哈哈哈">
  ```

- http-equiv属性：相当于http的文件头作用，它可以向浏览器传回一些有用的信息，以帮助正确地显示网页内容，与之对应的属性值为content，content中的内容其实就是各个参数的变量值。

  ```html
  <!--设置自动刷新，每两秒刷新一次-->
  <meta http-equiv="Refresh" Content="2" />
  <meta http-equiv="Refresh" content="2;URL=https://www.oldboy.com"> 
  //(注意后面的引号，分别在秒数的前面和网址的后面，表示2s后跳转到后面的网址)
  <meta http-equiv="content-Type" charset="UTF8">
  <meta http-equiv = "X-UA-Compatible" content = "IE=EmulateIE7" /> 
  <!--兼容IE，告诉IE内部启用最新的引擎-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">                                                           
  ```

##### 非meta标签

```html
<title>lamber</title>   # 网页文档的标题
<link rel="icon" href="http://www.jd.com/favicon.ico">  # 网页的icon
<link rel="stylesheet" href="css.css">  # 外部引入css
<script src="hello.js"></script>　# 引入js
<style type="text/css"></style>  # 引入css
```

#### 1.5.3 body内常用标签

##### 基本标签

```html
<hn>: n的取值范围是1~6; 从大到小. 用来表示标题。一般h1在文档中只会有一个，和搜索引擎有关。
<p>: 段落标签. 包裹的内容被换行.并且也上下内容之间有一行空白.
<b> <strong>: 加粗标签.
<strike>: 为文字加上一条中线。
<em>: 文字变成斜体.
<sup>和<sub>: 上角标 和 下角表.
<br>:换行.
<hr>:水平线

特殊字符：
      &lt; &gt；&quot；&copy;&reg;（小于，大于，引号，版权，注册商标）
<!--html中的特殊符号大全-->
http://www.cnblogs.com/web-d/archive/2010/04/16/1713298.html
```

##### div和span

- `<div></div>` ：` <div>`只是一个块级元素，并无实际的意义。主要通过CSS样式为其赋予不同的表现. 块级元素独占一行。
- `<span></span>`：  `<span>`表示了内联行(行内元素),并无实际的意义,主要通过CSS样式为其赋予不同的表现. 非独占一行。

块级元素与行内元素的区别
所谓块元素，是以另起一行开始渲染的元素，行内元素则不需另起一行。如果单独在网页中插入这两个元素，不会对页面产生任何的影响。
这两个元素是专门为定义CSS样式而生的。那么html的块级元素和行内元素都有哪些？以下内容仅供参考，实际上有用的没几个，看看就得了。

```
块元素(block element)

　　 * address - 地址
 　　* blockquote - 块引用
 　　* center - 举中对齐块
 　　* dir - 目录列表
 　　* div - 常用块级容易，也是css layout的主要标签
 　　* dl - 定义列表
 　　* fieldset - form控制组
 　　* form - 交互表单
 　　* h1 - 大标题
 　　* h2 - 副标题
 　　* h3 - 3级标题
 　　* h4 - 4级标题
 　　* h5 - 5级标题
 　　* h6 - 6级标题
 　　* hr - 水平分隔线
 　　* isindex - input prompt
　　 * menu - 菜单列表
 　　* noframes - frames可选内容，（对于不支持frame的浏览器显示此区块内容
 　　* noscript - 可选脚本内容（对于不支持script的浏览器显示此内容）
 　　* ol - 排序表单
 　　* p - 段落
 　　* pre - 格式化文本
 　　* table - 表格
 　　* ul - 非排序列表

内联元素(inline element)

　　 * a - 锚点
 　　* abbr - 缩写
 　　* acronym - 首字
 　　* b - 粗体(不推荐)
　　 * bdo - bidi override
　　 * big - 大字体
 　　* br - 换行
 　　* cite - 引用
 　　* code - 计算机代码(在引用源码的时候需要)
　　 * dfn - 定义字段
 　　* em - 强调
 　　* font - 字体设定(不推荐)
　　 * i - 斜体
 　　* img - 图片
 　　* input - 输入框
 　　* kbd - 定义键盘文本
 　　* label - 表格标签
 　　* q - 短引用
 　　* s - 中划线(不推荐)
　　 * samp - 定义范例计算机代码
 　　* select - 项目选择
 　　* small - 小字体文本
 　　* span - 常用内联容器，定义文本内区块
 　　* strike - 中划线
 　　* strong - 粗体强调
 　　* sub - 下标
 　　* sup - 上标
 　　* textarea - 多行文本输入框
 　　* tt - 电传文本
 　　* u - 下划线
 　　* var - 定义变量

可变元素

　　可变元素为根据上下文语境决定该元素为块元素或者内联元素。
 　　* applet - java applet
　　 * button - 按钮
 　　* del - 删除文本
 　　* iframe - inline frame
　　 * ins - 插入的文本
 　　* map - 图片区块(map)
　　 * object - object对象
 　　* script - 客户端脚本
```

##### img标签

```
src: 要显示图片的路径.
alt: 图片没有加载成功时的提示.
title: 鼠标悬浮时的提示信息.
width: 图片的宽
height:图片的高 (宽高两个属性只用一个会自动等比缩放.)
```

##### 超链接
什么是超级链接？
所谓的超链接是指从一个网页指向一个目标的连接关系，这个目标可以是另一个网页，也可以是相同网页上的不同位置，还可以是一个图片，一个电子邮件地址，一个文件，甚至是一个应用程序。

```
# 小知识点
什么是URL：
URL是统一资源定位器(Uniform Resource Locator)的缩写，也被称为网页地址，是因特网上标准的资源的地址。
URL举例
http://www.sohu.com/stu/intro.html
http://222.172.123.33/stu/intro.html

URL地址由4部分组成
第1部分：为协议：http://、ftp://等 
第2部分：为站点地址：可以是域名或IP地址
第3部分：为页面在站点中的目录：stu
第4部分：为页面名称，例如 index.html
各部分之间用“/”符号隔开。
```

超链接的使用：

```html
<a href="" target="_blank" >click</a>

href属性指定目标网页地址。该地址可以有几种类型：

    绝对 URL - 指向另一个站点（比如 href="http://www.jd.com）
    相对 URL - 指当前站点中确切的路径（href="index.htm"）
    锚 URL - 指向页面中的锚（href="#top"）
```

##### 列表

```html
<ul>: 无序列表 [type属性：disc(实心圆点)(默认)、circle(空心圆圈)、square(实心方块)]
<ol>: 有序列表
         <li>:列表中的每一项.
<dl>  定义列表
         <dt> 列表标题
         <dd> 列表项
```

##### 表格









