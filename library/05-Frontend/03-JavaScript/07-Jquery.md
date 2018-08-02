www.cnblogs.com/yuanchenqi/articles/6870763.html

# Jquery

> http://jquery.cuishifeng.cn/
>
> http://www.cnblogs.com/yuanchenqi/articles/6936986.html
>
> http://www.cnblogs.com/yuanchenqi/articles/6070667.html

## Jq是什么

- jQuery由美国人John Resig创建，至今已吸引了来自世界各地的众多 javascript高手加入其team。
- jQuery是继prototype之后又一个优秀的Javascript框架。其宗旨是——WRITE LESS,DO MORE!
- 它是轻量级的js库(压缩后只有21k) ，这是其它的js库所不及的，它兼容CSS3，还兼容各种浏览器
- jQuery是一个快速的，简洁的javaScript库，使用户能更方便地处理HTMLdocuments、events、实现动画效果，并且方便地为网站提供AJAX交互。
- jQuery还有一个比较大的优势是，它的文档说明很全，而且各种应用也说得很详细，同时还有许多成熟的插件可供选择。

## JQ对象

jQuery 对象就是通过jQuery包装DOM对象后产生的对象。jQuery 对象是 jQuery 独有的**.** 如果一个对象是 jQuery 对象**,** 那么它就可以使用 jQuery 里的方法: $(“#test”).html();

```javascript
$("#test").html() 
   
         意思是指：获取ID为test的元素内的html代码。其中html()是jQuery里的方法 

         这段代码等同于用DOM实现代码： document.getElementById(" test ").innerHTML; 

         虽然jQuery对象是包装DOM对象后产生的，但是jQuery无法使用DOM对象的任何方法，同理DOM对象也不能使用jQuery里的方法.乱使用会报错

         约定：如果获取的是 jQuery 对象, 那么要在变量前面加上$. 这样一看就知道是dom对象还是jq对象了。

var $variable = jQuery 对象
var variable = DOM 对象

$variable[0]：jquery对象转为dom对象      $("#msg").html(); $("#msg")[0].innerHTML
```

 jquery的基础语法：$(selector).action() 

## 选择器和筛选器

### 选择器

**基本选择器**

```javascript
$("*")  $("#id")   $(".class")  $("element")  $(".class,p,div")
```

**层级选择器**

```javascript
$(".outer div")  $(".outer>div")   $(".outer+div")  $(".outer~div")
```

**基本筛选器**

```javascript
# even取的是索引的偶数，索引的0，2，4
# odd拿的是索引的奇数
$("li:first")  $("li:eq(2)")  $("li:even") $("li:gt(1)")
```

**属性选择器**

```javascript
$('[id="div1"]')   $('["alex="sb"][id]')
```

**表单选择器**

```javascript
$("[type='text']")----->$(":text")         注意只适用于input标签  : $("input:checked")
```

**表单属性选择器**

```javascript
:enabled
:disabled
:checked
:selected

<body>

<form>
    <input type="checkbox" value="123" checked>
    <input type="checkbox" value="456" checked>


  <select>
      <option value="1">Flowers</option>
      <option value="2" selected="selected">Gardens</option>
      <option value="3" selected="selected">Trees</option>
      <option value="3" selected="selected">Trees</option>
  </select>
</form>


<script src="jquery.min.js"></script>
<script>
    // console.log($("input:checked").length);     // 2

    // console.log($("option:selected").length);   // 只能默认选中一个,所以只能lenth:1

    $("input:checked").each(function(){

        console.log($(this).val())
    })
</script>
</body>
```

### 筛选器

**过滤筛选器**

```javascript
$("li").eq(2)  $("li").first()  $("ul li").hasclass("test")
```

**查找筛选器**

```javascript
查找子标签：(children是找子代，find是找的后代)      
$("div").children(".test")      $("div").find(".test")  
                              
向下查找兄弟标签：  
# 取下面的一个标签，括号里可以多加限制条件，比如$("a").next('.item')   
# 记住这里只能是下一个标签，并且满足条件的。
$(".test").next()                
$(".test").nextAll()    # 取下面的所有标签
$(".test").nextUntil()  # 设置一个区间，到这个设置的区间位置，是一个开区间，中间的生效。
                          
向上查找兄弟标签：    
$("div").prev()                  
$("div").prevAll()       
$("div").prevUntil()   

查找所有兄弟标签：    
$("div").siblings()  
             
查找父标签：         
$(".test").parent()              
$(".test").parents()     
$(".test").parentUntil() 
```

## 操作元素

### 事件

**页面载入**

```javascript
ready(fn) // 当DOM载入就绪可以查询及操纵时绑定一个要执行的函数。
$(document).ready(function(){}) -----------> $(function(){})　
还有一种简写方式就是
$(function(){
  ……………………
})
```

**事件绑定**

```javascript
//语法:  标签对象.事件(函数)    
eg: $("p").click(function(){})

Tip：有一个事件绑定顺序的问题，后天生成的标签不会被应用上之前的事件绑定。这里就要用到事件委派了。
比如我点击一个button按钮的时候会给ul下添加li标签：
$("button").click(function(){
  $("ul").append("<li>asdasd</li>")
})
我想要点击li的时候弹出alert
$("li").click(function(){
  alert(123)
})

html:
<ul>
  <li>123</li>
  <li>123</li>
  <li>123</li>
  <li>123</li>
</ul>

在一开始的时候就有4个li，这4个li会被我们写的click时间所绑定，但是如果按button按钮后，新添加的li并不会收到click事件绑定的影响，这个就是我们所说的问题。
```

**事件委派**

```javascript
# 现在在3.x里只剩下一个方法用这个on可以搞定
$("").on(event,[selector],[data],fn)  // 在选择元素上绑定一个或多个事件的事件处理函数。

# 示例，现在不给li绑定事件了，我们给ul绑定时间，然后委派给ul下的li。
# 这个li不管是你先有的，还是后有的都是ul下的，因此都会触发on的click事件。
# 在jq2.x中是delegate
# 如果没有事件委派的话也可以用on，只不过selector这个可选参数这里不写就行了。
$("ul").on("click",'li',function(){
  console.log(123)
})

# 在jq2.x中有一个老的写法，由于部分jq代码还是2的版本因此也要知道这个内容
$(".p").bind(function(){xxxxx})

# 与事件委派相反的解除时间就是是用off。off不加参数表示取消所有事件，加的话表示取消具体事件，比如click
$("p").off()
```

示例

```html
<ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
</ul>
<hr>
<button id="add_li">Add_li</button>
<button id="off">off</button>

<script src="jquery.min.js"></script>
<script>
    $("ul li").click(function(){
        alert(123)
    });

    $("#add_li").click(function(){
        var $ele=$("<li>");
        $ele.text(Math.round(Math.random()*10));
        $("ul").append($ele)

    });


//    $("ul").on("click","li",function(){
//        alert(456)
//    })

     $("#off").click(function(){
         $("ul li").off()
     })
    
</script>
```

**事件切换**

hover事件：

一个模仿悬停事件（鼠标移动到一个对象上面及移出这个对象）的方法。这是一个自定义的方法，它为频繁使用的任务提供了一种“保持在其中”的状态。

over:鼠标移到元素上要触发的函数

out:鼠标移出元素要触发的函数

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        *{
            margin: 0;
            padding: 0;
        }
        .test{

            width: 200px;
            height: 200px;
            background-color: wheat;

        }
    </style>
</head>
<body>


<div class="test"></div>
</body>
<script src="jquery.min.js"></script>
<script>
//    function enter(){
//        console.log("enter")
//    }
//    function out(){
//        console.log("out")
//    }
// $(".test").hover(enter,out)


$(".test").mouseenter(function(){
        console.log("enter")
});

$(".test").mouseleave(function(){
        console.log("leave")
    });

</script>
</html>
```

### 属性操作

```javascript
--------------------------CSS类
$("").addClass(class|fn)
$("").removeClass([class|fn])

--------------------------属性
$("").attr();
$("").removeAttr();
$("").prop();
$("").removeProp();

--------------------------HTML代码/文本/值
$("").html([val|fn]) # 获取到的是整个标签的内容
$("").text([val|fn]) # 获取的是标签的内部文本
$("").val([val|fn|arr])

---------------------------
$("#c1").css({"color":"red","fontSize":"35px"})
```

attr方法使用：

```html
<input id="chk1" type="checkbox" />是否可见
<input id="chk2" type="checkbox" checked="checked" />是否可见



<script>

//对于HTML元素本身就带有的固有属性，在处理时，使用prop方法。
//对于HTML元素我们自己自定义的DOM属性，在处理时，使用attr方法。
//像checkbox，radio和select这样的元素，选中属性对应“checked”和“selected”，这些也属于固有属性，因此
//需要使用prop方法去操作才能获得正确的结果。


//    $("#chk1").attr("checked")
//    undefined
//    $("#chk1").prop("checked")
//    false

//  ---------手动选中的时候attr()获得到没有意义的undefined-----------
//    $("#chk1").attr("checked")
//    undefined
//    $("#chk1").prop("checked")
//    true

    console.log($("#chk1").prop("checked"));//false
    console.log($("#chk2").prop("checked"));//true
    console.log($("#chk1").attr("checked"));//undefined
    console.log($("#chk2").attr("checked"));//checked
</script>
```

#### 循环

我们知道：

```javascript
$("p").css("color","red")　
```

是将css操作加到所有的标签上，内部维持一个循环；但如果对于选中标签进行不同处理，这时就需要对所有标签数组进行循环遍历啦

jquery支持两种循环方式：

 **方式一**：**格式：$.each(obj,fn)**

```javascript
li=[10,20,30,40];
dic={name:"yuan",sex:"male"};
$.each(li,function(i,x){
    console.log(i,x)
});
```

**方式二：格式：$("").each(fn)**

```javascript
$("tr").each(function(){
    console.log($(this).html())
})
```

其中,$(this)代指当前循环标签。

**each扩展**

关于循环中，return false和return true有什么区别。

```javascript
/*
        function f(){

        for(var i=0;i<4;i++){

            if (i==2){
                return
            }
            console.log(i)
        }

    }
    f();  // 这个例子大家应该不会有问题吧!!!
//-----------------------------------------------------------------------


    li=[11,22,33,44];
    $.each(li,function(i,v){

        if (v==33){
                return ;   //  ===试一试 return false会怎样?
            }
            console.log(v)
    });

//------------------------------------------


    // 大家再考虑: function里的return只是结束了当前的函数,并不会影响后面函数的执行

//本来这样没问题,但因为我们的需求里有很多这样的情况:我们不管循环到第几个函数时,一旦return了,
//希望后面的函数也不再执行了!基于此,jquery在$.each里又加了一步:
     for(var i in obj){

         ret=func(i,obj[i]) ;
         if(ret==false){
             return ;
         }

     }
// 这样就很灵活了:
// <1>如果你想return后下面循环函数继续执行,那么就直接写return或return true
// <2>如果你不想return后下面循环函数继续执行,那么就直接写return false


// ---------------------------------------------------------------------
```

#### 文档节点处理

```javascript
# 创建一个标签对象
$("<p>")


# 内部插入，append在末尾插入，prepend在开头插入。appendto是某一个节点插入到某个父节点
# 比如自己新建一个标签然后插入到某一个父节点内。
$("").append(content|fn)      ----->$("p").append("<b>Hello</b>");
$("").appendTo(content)       ----->$("p").appendTo("div");
$("").prepend(content|fn)     ----->$("p").prepend("<b>Hello</b>");
$("").prependTo(content)      ----->$("p").prependTo("#foo");

# 外部插入，这个是同级别兄弟节点之间的插入，insertAfter就是新节点查到谁后面和上面append和appendto的区别其实是一样的。
$("").after(content|fn)       ----->$("p").after("<b>Hello</b>");
$("").before(content|fn)      ----->$("p").before("<b>Hello</b>");
$("").insertAfter(content)    ----->$("p").insertAfter("#foo");
$("").insertBefore(content)   ----->$("p").insertBefore("#foo");

# 替换
$("").replaceWith(content|fn) ----->$("p").replaceWith("<b>Paragraph. </b>");

# 删除，empty是清空内容，但是本身标签还存在，但是remove是直接把内容连带标签一起给删除了。
$("").empty()
$("").remove([expr])

# 复制，对应原生js下的cloneNode方法
$("").clone([Even[,deepEven]])
```

示例：

```javascript
<!DOCTYPE html>
<html>
<head>

</head>
<body>
<div class="box">
    <div class="item">
        <input type="button" value="+">
        <input type="text" value="请输入默认值">
    </div>
</div>
<script src="/static/js/jquery-3.2.1.min.js"></script>
<script>
    $(':button').click(function () {
        var $aaa = $(this).parent().clone();
        $aaa.children(':button').val('-').click(function () {
            $(this).parent().remove();
        });
        $('.box').append($aaa);
    })

</script>
</body>
</html>
```

#### 动画效果

**显示隐藏**

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="jquery-2.1.4.min.js"></script>
    <script>

$(document).ready(function() {
    $("#hide").click(function () {
        $("p").hide(1000);
    });
    $("#show").click(function () {
        $("p").show(1000);
    });

//用于切换被选元素的 hide() 与 show() 方法。省的绑定两个方法了。
    $("#toggle").click(function () {
        $("p").toggle();
    });
})

    </script>
    <link type="text/css" rel="stylesheet" href="style.css">
</head>
<body>


    <p>hello</p>
    <button id="hide">隐藏</button>
    <button id="show">显示</button>
    <button id="toggle">切换</button>

</body>
</html>
```

**滑动**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="jquery-2.1.4.min.js"></script>
    <script>
    // 类似于幕布的一种上拉下拉的效果。
    $(document).ready(function(){
     $("#slideDown").click(function(){
         $("#content").slideDown(1000);
     });
      $("#slideUp").click(function(){
         $("#content").slideUp(1000);
     });
      $("#slideToggle").click(function(){
         $("#content").slideToggle(1000);
     })
  });
    </script>
    <style>

        #content{
            text-align: center;
            background-color: lightblue;
            border:solid 1px red;
            display: none;
            padding: 50px;
        }
    </style>
</head>
<body>

    <div id="slideDown">出现</div>
    <div id="slideUp">隐藏</div>
    <div id="slideToggle">toggle</div>

    <div id="content">helloworld</div>

</body>
</html>
```

**淡入淡出**：淡入淡出其实就是一个透明度的变化，应用于addclass和removeclass，hide的值。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="jquery-2.1.4.min.js"></script>
    <script>
    $(document).ready(function(){
   $("#in").click(function(){
       $("#id1").fadeIn(1000);


   });
    $("#out").click(function(){
       $("#id1").fadeOut(1000);

   });
    $("#toggle").click(function(){
       $("#id1").fadeToggle(1000);
   });
    $("#fadeto").click(function(){
       // 这个fadeto第一参数是时间，第二个是到某一个透明度
       // 上面的都是透明度是0~1之间，这个是0.4~1.这个意思。
       $("#id1").fadeTo(1000,0.4);
   });
   // 回调函数
   $("toggle").click(function(){
       $('#id1').fadeToggle(1000, function(){
           …………………………
       })
   })
});
</script>

</head>
<body>
      <button id="in">fadein</button>
      <button id="out">fadeout</button>
      <button id="toggle">fadetoggle</button>
      <button id="fadeto">fadeto</button>

      <div id="id1" style="display:none; width: 80px;height: 80px;background-color: blueviolet"></div>

</body>
</html>
```

**回调函数**：完成某个动作以后触发的函数。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="jquery-2.1.4.min.js"></script>

</head>
<body>
  <button>hide</button>
  <p>helloworld helloworld helloworld</p>



 <script>
   $("button").click(function(){
       $("p").hide(1000,function(){
           alert($(this).html())
       })

   })
    </script>
</body>
</html>
```

#### CSS处理

*CSS位置操作*

```javascript
# offset获取的是当前视口的相对偏移。var $xxx=$('xxx').offset()拿到的是一个对象。
# 有left属性，top属性等等。
$("").offset([coordinates])
# offset赋值操作
$('.p1').offset({left:300,top:200})

# 相当于已定位的父级的位置
$("").position()

# 返回顶部，不加val就是取当前的位置，如果填值的话那就是相当于一个赋值的操作。
$("").scrollTop([val])
# 示例，这个是对当前的window窗口生效。
$(".top").click(function(){
  $(window).scrollTop(0);
})

# 控制没拉到最下面的时候先不显示这个回到顶部的按钮
window.onscroll=function(){
  if($(window)).scrolltop()>200){
    $(".top").show();
  }else{
    $(".top").hide();
  }
}

$("").scrollLeft([val])
```

Example1:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        .test1{
            width: 200px;
            height: 200px;
            background-color: wheat;
        }
    </style>
</head>
<body>


<h1>this is offset</h1>
<div class="test1"></div>
<p></p>
<button>change</button>
</body>
<script src="jquery-3.1.1.js"></script>
<script>
    var $offset=$(".test1").offset();
    var lefts=$offset.left;
    var tops=$offset.top;

    $("p").text("Top:"+tops+" Left:"+lefts);
    $("button").click(function(){

        $(".test1").offset({left:200,top:400})
    })
</script>
</html>
```

Example2:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        *{
            margin: 0;
        }
        .box1{
            width: 200px;
            height: 200px;
            background-color: rebeccapurple;
        }
        .box2{
            width: 200px;
            height: 200px;
            background-color: darkcyan;
        }
        .parent_box{
             position: relative;
        }
    </style>
</head>
<body>




<div class="box1"></div>
<div class="parent_box">
    <div class="box2"></div>
</div>
<p></p>


<script src="jquery-3.1.1.js"></script>
<script>
    var $position=$(".box2").position();
    var $left=$position.left;
    var $top=$position.top;

    $("p").text("TOP:"+$top+"LEFT"+$left)
</script>
</body>
</html>
```

Example3:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

    <style>
        body{
            margin: 0;
        }
        .returnTop{
            height: 60px;
            width: 100px;
            background-color: peru;
            position: fixed;
            right: 0;
            bottom: 0;
            color: white;
            line-height: 60px;
            text-align: center;
        }
        .div1{
            background-color: wheat;
            font-size: 5px;
            overflow: auto;
            width: 500px;
            height: 200px;
        }
        .div2{
            background-color: darkgrey;
            height: 2400px;
        }


        .hide{
            display: none;
        }
    </style>
</head>
<body>
     <div class="div1 div">
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
           <h1>hello</h1>
     </div>
     <div class="div2 div"></div>
     <div class="returnTop hide">返回顶部</div>

 <script src="jquery-3.1.1.js"></script>
    <script>
         $(window).scroll(function(){
             var current=$(window).scrollTop();
              console.log(current);
              if (current>100){

                  $(".returnTop").removeClass("hide")
              }
              else {
              $(".returnTop").addClass("hide")
          }
         });


            $(".returnTop").click(function(){
                $(window).scrollTop(0)
            });


    </script>
</body>
</html>
```

**尺寸操作**

```javascript
# 内容区域的高度
$("").height([val|fn])
# 我们一直说的width其实是content内容部分的宽度，这就是为什么设置了padding之后容器被撑开了。
$("").width([val|fn])
# 这个innerheight拿的就是padding+内容的大小。
$("").innerHeight()
$("").innerWidth()
# centent+padding+border，默认这个里面还有一个参数，默认为false，如果改为true的话会默认计算margin的值
# 比如$("").outerHeight(true)，记住这里的参数默认是false，也就是不会计算margin的值。
$("").outerHeight([soptions])
$("").outerWidth([options])
```

示例：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        *{
            margin: 0;
        }
        .box1{
            width: 200px;
            height: 200px;
            background-color: wheat;
            padding: 50px;
            border: 50px solid rebeccapurple;
            margin: 50px;
        }

    </style>
</head>
<body>




<div class="box1">
    DIVDIDVIDIV
</div>


<p></p>

<script src="jquery-3.1.1.js"></script>
<script>
    var $height=$(".box1").height();
    var $innerHeight=$(".box1").innerHeight();
    var $outerHeight=$(".box1").outerHeight();
    var $margin=$(".box1").outerHeight(true);

    $("p").text($height+"---"+$innerHeight+"-----"+$outerHeight+"-------"+$margin)
</script>
</body>
</html>
```

## Jq的插件









jquery支持链式操作。