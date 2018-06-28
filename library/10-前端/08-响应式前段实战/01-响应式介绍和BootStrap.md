**meta标签**

```html
<!--设置字符集-->
<meta charset="utf-8">
<!--启用最新的IE引擎进行页面的渲染-->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--设置移动设备时候需要的视口-->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

**媒询**

> - css3
> - 根据当前媒体设备（媒体特征），显示媒询内的对应样式。

利用媒询选择加载样式

```css
@media
    - 在对应的媒体下，媒询中的样式才会被解析
```

媒体的类型：

- all，所有的类型的设备
- screen，彩屏设备，电脑啊，手机啊都算
- braille，盲文触觉设备，基本不用
- handheld，手持设备，基本不用
- print，打印预览
- ……………………

按照我们写css的标准：同一个样式写在后面的会替换掉前面的，

媒体的特征：比如width，device-width，min-width；

```css
@media screen and (min-width: 800px){
    /*在彩屏设备并且宽度大于等于800的时候符合条件*/
    #box{
        background: pink;
    }
}

# 这里的这个and叫做关键词，我们可以用的关键词有
- and：用于连接设备和设备特征，这是最常用的。
- only：只有
- not：除……之外
```

**布局容器&流体容器**

```css
/*.container在最大屏幕下是一个1170px的尺寸，这个是从大屏往小屏匹配，也可以小屏幕到大屏逐一匹配*/
.container{
    width: 1170px;
    height: 500px;
    background: #000;
    margin:0 auto;
}
/*小于1200*/
@media all and (max-width: 1199px){
    .container{
        width:970px;
        background:red;
    }
}
/*小于992*/
@media all and (max-width: 991px){
    .container{
        width:750px;
        background: pink;
    }
}
@media all and (max-width: 768px){
    .container{
        width: 100%;
        background: orange;
    }
}
```

**栅格系统**

- 列为什么要放到行（row）里，即使不放到row里仍然可以正常使用。
- 行必须包含在container或者container-fluid里面，以便为其赋予核实的排列和内填充

**行和列**

```
可视宽度=width + border + padding
border-box的可视宽度就等于当前写的宽度。
```



```css
.col-xs-1,.col-xs-2,.col-xs-3,.col-xs-4,.col-xs-5,.col-xs-6,.col-xs-7,.col-xs-8,.col-xs-9,.col-xs-10{float:left;box-sizing: border-box;}
.col-xs-1{width:10%;}
.col-xs-2{width:20%;}
.col-xs-3{width:30%;}
.col-xs-4{width:40%;}
.col-xs-5{width:50%;}
.col-xs-6{width:60%;}
.col-xs-7{width:70%;}
.col-xs-8{width:80%;}
.col-xs-9{width:90%;}
.col-xs-10{width:100%;}
```



## 需求

### 去除默认样式

#### PC端

```css

```

#### 移动端

### 响应式

> 分三种屏幕+一个最小屏幕
>
> - xs < 768px
> - sm >=768px
> - md >=970px
> - lg >=1180px

### 头部

- 导航栏
- 个人信息
  - 头像、人名
  - 个性签名
  - 个人信息
  - 联系方式
- 技能展示
  - 标题
  - 技能展示列表
- 工作时光轴
  - 标题
  - 工作经验（无序列表）
- 案例展示
  - 标题
  - 案例栏目标题
  - 案例内容
- 项目池
  - 标题
  - 项目列表
    - 项目图片
    - 文章
- 底部
  - 更新时间
  - copyright



# LESS

## 编译工具

- Koala：国人开发的less、sass编译工具
- http://koala-app.com/index-zh.html

```css
# less中的注释
/**/：这种形式的注释会被编译到css中
//：这种形式的注释是不会被编译到css中的

# less中的变量，想要声明变量的话一定要用@开头，例如：@变量名：值；
@test_width: 300px
.box{
    width: @test_width;
}

# less中的混合，比如可以用在样式的重用里，在下面的例子里中，直接拿过来用就可以了。
.border{border:solid 5px #333;}
.box{width:100px;.border;}

# 带参数的混合
.border_02(@border_width){
    border:solid yellow @border_width;
}
.test_hehehe{
    // 注意这里写了需要参数就必须带值，否则会报错。
    .border_02(30px)
}

# 不仅可以带参数，参数还可以有默认值
.border_03(@border_width:30px){
    border:solid pink @border_width;
}
.test_hehehe{
    // 我这里有一个默认值，所以可以不带值进去，没变量的时候括号可以省略
    .border_03();
}

# 匹配模式，相当于if但是不完全是。比如下面这段匹配
.triangle(top,@width:5px,@color:#ccc){
  border-width:@width;
  border-color: transparent transparent @color transparent;
}

.triangle(bottom,@width:5px,@color:#ccc){
  border-width:@width;
  border-color: @color transparent transparent transparent;
}

.triangle(left,@width:5px,@color:#ccc){
  border-width:@width;
  border-color: transparent @color transparent transparent;
}

.triangle(right,@width:5px,@color:#ccc){
  border-width:@width;
  border-color: transparent transparent  transparent @color;
}

.triangle(@_,@width:5px,@color:#ccc){
  width: 0;
  height:0;
  overflow: hidden;
}

.sanjiao{
  .triangle(right)
}

生成的css就是下面这样的，
.sanjiao {
  border-width: 5px;
  border-color: transparent transparent transparent #cccccc;
  width: 0;
  height: 0;
  overflow: hidden;
}
它会去根据你输入的第一个判断是哪一个方向的三角，然后进行对应的编译生成响应的css文件，注意匹配到上下左右的时候同时最后一条也会匹配到，因为也满足条件，因此width和height为0px也会被编译进去。如果说你写的不是上下左右而是其他的内容的时候，就会匹配到最后一个。仅仅体现宽高和overflow。

# 匹配模式的简单应用，下面的内容就可以直接进行调用了。
.pos(r){
    postion:relative;
}
.pos(a){
    postion:absolute;
}
.pos(f){
    postion:fixed;
}

# 运算
@test_01:300px;
.box_02{
    // 没有强制要求后面这个20带这个px，只要里面其中带一个单位就可以了。注意变量与减号之间要有空格，否则会被ide识别成变量的一部分
    width:(@test_01 - 20) * 20;
    // 同样的颜色也可以进行计算，less会为你抓换成255然后-10.颜色的加减一般也要用不到。
    color:#ccc - 10;
}

# less中的嵌套
比如下面这样一个内容：
.list{}
.list li{}
.list a{}
.list span{}
如果使用嵌套写的话就是：
.list{
    width:200px;
    margin:0 autu;
    list-style: none;
    li{……一大堆样式……};
    a{……一大堆样式……};
    span{………………}
}

# 在控制伪类的时候，之前写的时候是这么写的，比如
.list a{}
.list a:hover{}

# 现在可以这么来写
.list {
    a{
        float:left;
        // &代表它的上一层选择器，这里的上一层选择器其实就是a。
        &:hover{
            color:red;
        }
    }
}

# arguments变量，用的不多，@arguments包含了所有传递进来的参数，如果你不想单独处理每一个参数的话你就可以这样写。
.border_arg(@w:30px,@c:red,@xx:solid){
    border:@arguments;        
}
然后进行调用：
.test_arguments{
    .border_arg()
}
最后生成的css结果就是这样的：
.test_arguments {
  border: 30px #ff0000 solid;
}

# 避免编译，!important以及总结
有的时候我们需要输出一些不正确的css语法或者使用一些less不认识的专有语法，要输出这样的值我们可以在字符串前加一个"~"，就可以让less给原封不动的输出来。
例如：width:~"calc(300px-30px)";

# 混合模式可以添加!important，会被编译到css文件中去。
.test_important{
    .border_radius() !important;
}
```

