# BootStrap

> https://github.com/twbs
>
> bootstrap是移动优先的。
>
> bootstrap的JS是基于Jquery的，因此自己下载一个Jquery放到js文件夹

## 栅格系统

把整个页面分成12列，同时支持响应式。表示一行的class就是row，表示一列的class就是col。

- 容器

  - container-fluid

    - 流体（平铺整体百分百），这个流体平铺的布局并不会顶格，他有一个padding值。

  - container

    - 固定（居中）
    - 1170（默认是1170，根据不同的分辨率会显示为不同的width）
    - 970
    - 750
    - auto

    ```html
    不同分辨率其实是存在一个阈值
    - 1200>= 较大的分辨率的设备  col-lg-xx，低于1200就会纵向排列
    - 992>=  中等屏幕的设备      col-md，低于992会纵向排列
    - 768>=  相当于pad的尺寸      col-sm-xx，小于768会纵向排列
    - 768<   小于768就是手机的尺寸    col-xs-xx，永远都是水平的
    ```

不要把container和container-flued嵌套使用。可以作为兄弟存在，比如header用流体的，body用container。

如果一列多了12个格子就会被挤到第二行。

### 栅格的组合模式

```html
<div class='row'>
  <!--依此根据class进行匹配-->
  <div class='col-lg-3 col-md-4 col-sm-6 '></div>
  <div class='col-lg-3 col-md-4 col-sm-6 '></div>
  <div class='col-lg-3 col-md-4 col-sm-6 '></div>
  <div class='col-lg-3 col-md-4 col-sm-6 '></div>
</div>
在大屏幕分辨率的时候，一个是占用3个格子，也就是四个，当达到了md的阈值的时候就是12/4=3，一行3个，然后当到了sm阈值的时候就是一行两个。再小就是一行一个了。
```

#### 栅格系统中的列偏移

```html
#  向右偏移四个网格的距离，假如偏移10个就会出去，做多可以写12，整个都偏移出去，超过12或者小于1都是不起作用的。当达到了lg的阈值的时候就会进行纵向排列，不受偏移的影响了。
<div class='col-lg-4 col-lg-offset-4'></div>
# 当没有设置栅格的网格大小，而只设置了偏移那么可以根据偏移去自动设置栅格大小哦，比如偏移为4，那么栅格大小就为12-4=8。列偏移同样适用于多种栅格混合适合用。
```

#### 列排序

```html
# 比如有两个，我想让这俩互换顺序。
<div class="col-lg-2"></div>
<div class="col-lg-10"></div>
# push是向后，pull是往前拉，第一个往后推10个格子，第二个往前拉两个格子
<div class="col-lg-2 col-lg-push-10"></div>
<div class="col-lg-10 col-lg-pull-2"></div>
```

那么列排序和偏移和什么区别呢？

- offset只能往右偏，但是排序可以使用pull和push向前向后。
- offset还存在一个问题就是当有多个元素存在的情况下如果这一行撑满了，那么就会跳转到下一行进行偏移。比如一行有两个div都是col-lg-4，右侧的div的offset设置为5的时候可想而知，4+5+4=13，一行撑满了，因此右侧的div会直接跳转到第二行，然后offset出来5个格子。那么如果有这种需求的时候就可以使用排序来做了。

#### 栅格系统的嵌套

row和row之间是可以互相嵌套的，宽度会按照父级的宽度进行12个网格的分配。

如果一行有三个div分别为6,3,3的网格占位，如果6中的内容很多会单独把这个网格撑开，比如：

![](http://omk1n04i8.bkt.clouddn.com/18-3-4/17459743.jpg)

那么假如我再加一个col，会变成如下的情况，因为本身这些内容更都是基于浮动的。

![](http://omk1n04i8.bkt.clouddn.com/18-3-4/55780879.jpg)

如果想要另起一行显示需要清除浮动。

```html
<div class="row">
            <div class="col-lg-6 " id="box1">很多的文字</div>
            <div class="box2 col-lg-3 ">col-lg-3</div>
            <div class="box2 col-lg-3 ">col-lg-3</div>
            <div class="clearfix"></div>
            <div class="box2 col-lg-3 ">col-lg-3</div>
</div>
```

![](http://omk1n04i8.bkt.clouddn.com/18-3-4/46976091.jpg)

当然如果你另起一个row的话就是另起一行了。

## 导航条





