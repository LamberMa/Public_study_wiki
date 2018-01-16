# Emmet插件使用

## 1-针对html的操作

#### 初始化（输入下面代码按tab生效）

- html:5或!：初始化html5文档类型
- html:xt：用户xhtml过渡文档类型
- html:4s：用于html4严格文档类型

#### 轻松添加类、id、文本和属性

- 元素.class_name的形式/元素#id的形式

  ![](http://omk1n04i8.bkt.clouddn.com/17-10-29/90435545.jpg)

  比如输入p.bar#foo则会生成如下的代码

  ```html
  <p class="bar" id="foo"></p>
  ```

- 属性可以通过h1{foo}和a[href=#]类似这种格式的代码来进行添加

  ![](http://omk1n04i8.bkt.clouddn.com/17-10-29/44004558.jpg)

#### 嵌套

现在你只需要1行代码就可以实现标签的嵌套。 

- \>：子元素符号，表示嵌套的元素
- +：同级标签符号
- ^：可以使该符号前的标签提升一行

![](http://omk1n04i8.bkt.clouddn.com/17-10-29/79982974.jpg)

#### 分组

使用"."默认就是生成div，通过嵌套和括号可以快速生成一些小的代码块。比如输入(.foo>h1)+(.bar>h2)的话那么就会生成如下的html代码：

```html
<div class="foo">  
  <h1></h1>  
</div>  
<div class="bar">  
  <h2></h2>  
</div> 
```

#### 隐式标签

声明一个带类的标签，只需输入div.item，就会生成<div class="item"></div>。 

在过去版本中，可以省略掉div，即输入.item即可生成<div class="item"></div>。现在如果只输入.item，则Emmet会根据父标签进行判定。比如在<ul>中输入.item，就会生成<li class="item"></li>。 

下面是所有的隐式标签名称： 

- li：用于ul和ol中
- tr：用于table、tbody、thead和tfoot中
- td：用于tr中
- option：用于select和optgroup中

#### 定义多个元素

使用`*`符号即可以定义多个同样的元素，比如ul>li*3就会生成如下的代码：

```html
<ul>  
  <li></li>  
  <li></li>  
  <li></li>  
</ul> 
```

如果元素需要带属性怎么办呢？这个也很简单，比如输入 ul>li.item$*3会生成如下的html代码。

```html
<ul>  
  <li class="item1"></li>  
  <li class="item2"></li>  
  <li class="item3"></li>  
</ul>  
```

## 2-针对CSS的操作

#### css缩写(必须为对应的css格式的文件才可以生效)

- w100：width:100px
- m5e：margin: 5em
- h10p：height: 10%;

单位别名列表： 

- p 表示%
- e 表示 em
- x 表示 ex

#### 附加属性

可能你之前已经了解了一些缩写，比如 @f，可以生成： 

```css
@font-face {  
  font-family:;  
  src:url();  
} 
```

一些其他的属性，比如background-image、border-radius、font、@font-face,text-outline、text-shadow等额外的选项，可以通过“+”符号来生成，比如输入@f+，将生成： 

```css
@font-face {  
  font-family: 'FontName';  
  src: url('FileName.eot');  
  src: url('FileName.eot?#iefix') format('embedded-opentype'),  
     url('FileName.woff') format('woff'),  
     url('FileName.ttf') format('truetype'),  
     url('FileName.svg#FontName') format('svg');  
  font-style: normal;  
  font-weight: normal;  
}  
```

#### 模糊匹配

如果有些缩写你拿不准，Emmet会根据你的输入内容匹配最接近的语法，比如输入ov:h、ov-h、ovh和oh，生成的代码是相同的：

```css
overflow: hidden; 
```

#### 供应商前缀

如果输入非W3C标准的CSS属性，Emmet会自动加上供应商前缀，比如输入trs，则会生成： 

```css
-webkit-transform: ;  
-moz-transform: ;  
-ms-transform: ;  
-o-transform: ;  
transform: ; 
```

![](http://omk1n04i8.bkt.clouddn.com/17-10-29/8248386.jpg)

你也可以在任意属性前加上“-”符号，也可以为该属性加上前缀。比如输入-super-foo： 

```css
-webkit-super-foo: ;  
-moz-super-foo: ;  
-ms-super-foo: ;  
-o-super-foo: ;  
super-foo: ;  
```

如果不希望加上所有前缀，可以使用缩写来指定，比如-wm-trf表示只加上-webkit和-moz前缀： 

```css
-webkit-transform: ;  
-moz-transform: ;  
transform: ; 
```

前缀缩写如下： 

- w 表示 -webkit-
- m 表示 -moz-
- s 表示 -ms-
- o 表示 -o-

#### 渐变

输入lg(left, #fff 50%, #000)，会生成如下代码： 

```css
background-image: -webkit-gradient(linear, 0 0, 100% 0, color-stop(0.5, #fff), to(#000));  
background-image: -webkit-linear-gradient(left, #fff 50%, #000);  
background-image: -moz-linear-gradient(left, #fff 50%, #000);  
background-image: -o-linear-gradient(left, #fff 50%, #000);  
background-image: linear-gradient(left, #fff 50%, #000);  
```

![](http://omk1n04i8.bkt.clouddn.com/17-10-29/59307770.jpg)

## 3-附加功能

**生成Lorem ipsum文本** 

Lorem ipsum指一篇常用于排版设计领域的拉丁文文章，主要目的是测试文章或文字在不同字型、版型下看起来的效果。通过Emmet，你只需输入lorem 或 lipsum即可生成这些文字。还可以指定文字的个数，比如lorem10，将生成： 

```
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Libero delectus.
```

## 4-定制

你还可以定制Emmet插件： 

- 添加新缩写或更新现有缩写，可修改[snippets.json](http://docs.emmet.io/customization/snippets/)文件
- 更改Emmet过滤器和操作的行为，可修改[preferences.json](http://docs.emmet.io/customization/preferences/)文件
- 定义如何生成HTML或XML代码，可修改[syntaxProfiles.json](http://docs.emmet.io/customization/syntax-profiles/)文件

## 5-针对不同编辑器的插件

Emmet支持的编辑器如下（链接为针对该编辑器的Emmet插件）： 

- [Sublime Text 2](https://github.com/sergeche/emmet-sublime)
- [TextMate 1.x](https://github.com/emmetio/Emmet.tmplugin)
- [Eclipse/Aptana](https://github.com/emmetio/emmet-eclipse)
- [Coda 1.6 and 2.x](https://github.com/emmetio/Emmet.codaplugin)
- [Espresso](https://github.com/emmetio/Emmet.sugar)
- [Chocolat](https://github.com/sergeche/emmet.chocmixin) （通过“Install Mixin”对话框添加)
- [Komodo Edit/IDE](https://github.com/emmetio/emmet/downloads) （通过Tools → Add-ons菜单添加)
- [Notepad++](https://github.com/emmetio/emmet/downloads)
- [PSPad](https://github.com/emmetio/emmet/downloads)
- [CodeMirror2/3](https://github.com/emmetio/codemirror)
- [Brackets](https://github.com/emmetio/brackets-emmet)

