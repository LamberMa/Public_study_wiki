# CSS小结

## 1、语法

```css
selector {
    property:value
}
```

比如：

```css
h1 {color:red;font-size:14px;}
多个属性用分号隔开，单个属性多个单词，要用引号引起来表示一个整体
```

如果要给多个选择器加上样式的话那么，那么多个选择器用逗号隔开

```css
h1,h2,h3 {color:red;font-size:14px;}
```

### 1.1 继承

子级别元素会继承父级别元素的样式，比如给body设置了样式，那么子级别元素会继承父级别元素的属性，但是如果单独为这个子级别元素设置自己的样式的话，那么会优先于父级别的。

### 1.2 派生选择器

```html
<p>
  <ul>
    <li></li>
  </ul>
</p>

通过派生选择器可以选择到li
p ul li {background:'red';}
```

### 1.3 id 选择器

```css
#div1 {}
#div a {}
```

### 1.4 类选择器

```css
.div1 {}
.div a {}
```

### 1.5 属性选择器

```css

```





## n、关于样式重置

```css
body {margin:0px;}
li {list-tyle:none;}
ul {padding-left:0;margin:0px}

//很多面试官不喜欢这样，还是具体用到啥写啥比较好
* {padding:0;margin:0;font-family:arial}  
li {list-style:none;}
//去掉蓝色的那个边框
img {border:none;}
//如果a链接没有下划线也要重置一些样式
a {text-decoration:none}
a:hover {text-decoration:underline}
```





