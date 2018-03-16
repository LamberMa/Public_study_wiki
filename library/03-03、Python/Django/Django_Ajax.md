# Ajax全套

> http://www.cnblogs.com/wupeiqi/articles/5703697.html
>
> 偷偷地向后台发请求。

## 原生Ajax

JQuery的Ajax内部是基于原生的ajax，其实就是jquery就是封装了ajax

**1、XmlHttpRequest对象介绍**

XmlHttpRequest对象的主要方法：

```
a. void open(String method,String url,Boolen async)
   用于创建请求
   
   参数：
       method： 请求方式（字符串类型），如：POST、GET、DELETE...
       url：    要请求的地址（字符串类型）
       async：  是否异步（布尔类型），体现在回调。
                如果是异步，那么偷偷的给后台发数据，然后期间你该干嘛干嘛。
                如果是非异步，那么后台处理期间，整个页面就被卡主了。

b. void send(String body)
    用于发送请求

    参数：
        body： 要发送的数据（字符串类型）

c. void setRequestHeader(String header,String value)
    用于设置请求头

    参数：
        header： 请求头的key（字符串类型）
        vlaue：  请求头的value（字符串类型）

d. String getAllResponseHeaders()
    获取所有响应头

    返回值：
        响应头数据（字符串类型）

e. String getResponseHeader(String header)
    获取响应头中指定header的值

    参数：
        header： 响应头的key（字符串类型）

    返回值：
        响应头中指定的header对应的值

f. void abort()

    终止请求
```

XmlHttpRequest对象的主要属性：

```
a. Number readyState
   状态值（整数）

   详细：
      0-未初始化，尚未调用open()方法；
      1-启动，调用了open()方法，未调用send()方法；
      2-发送，已经调用了send()方法，未接收到响应；
      3-接收，已经接收到部分响应数据；
      4-完成，已经接收到全部响应数据；

b. Function onreadystatechange
   当readyState的值改变时自动触发执行其对应的函数（回调函数）

c. String responseText
   服务器返回的数据（字符串类型）

d. XmlDocument responseXML
   服务器返回的数据（Xml对象）

e. Number states
   状态码（整数），如：200、404...

f. String statesText
   状态文本（字符串），如：OK、NotFound...
```



实际应用：

```javascript
### GET请求
function add2(){
  var xhr = new XMLHttpRequest();
  xhr.onreadystateChange = function(){
    # 当状态码为4的时候执行回调函数。
    if (xhr.readyState == 4){
      alert(xhr.responsetext)
    }
  };
  # 打开一个连接，是否异步不写默认就是异步的
  xhr.open('GET','/add2/?i1=1&i2=2');
  # 用于发送请求，
  xhr.send();
}

### POST请求
function add2(){
  var xhr = new XMLHttpRequest();
  xhr.onreadystateChange = function(){
    # 当状态码为4的时候执行回调函数。
    if (xhr.readyState == 4){
      alert(xhr.responsetext)
    }
  }
  # 打开一个连接，是否异步不写默认就是异步的
  xhr.open('POST','/add2/');
  # POST请求的时候要记得设置Content-Type请求头
  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  # 用于发送请求，
  xhr.send('i1=12&i2=23');
}
```

伪ajax，非XMLHTTPRequest：

iframe标签说起：iframe标签可以伪造出局部刷新的效果。可以开辟一个类似向后台提交的通道。不刷新，发送HTTP请求。`<form>`标签可以把input的数据打包，因此这俩结合起来也可以实现不刷新向后台提交数据的功能。iframe相当于又嵌套了一个页面。

```html
<body>
  <input type='text' />
  <!--使用target可以指定提交的方式，不用form原来的提交方式了。-->
  <form method='post' action='/fake_ajax/' target="ifr">
    <!--这个iframe放哪其实无碍-->
    <iframe name="ifr" style='display:none'></iframe>
    <input type="text" name="user" />
    <input type="submit" value="提交" />
  </form>
</body>
```

这种情况下是无法使用回调函数的。后台返回的值会放到iframe中去。那么其实可以这样，只要iframe中有内容的时候，证明后台的值就返回来了。如果里面有内容了，是可以执行一个onload函数的。这个onload也适用于其他的标签，只要加载的时候就会执行这个onload，后台返回一次数据就会加载一次。

```html
<body>
  <input type='text' />
  <!--使用target可以指定提交的方式，不用form原来的提交方式了。-->
  <form method='post' action='/fake_ajax/' target="ifr">
    <!--这个iframe放哪其实无碍-->
    <iframe name="ifr" onload="loadIframe();"></iframe>
    <input type="text" name="user" />
    <input type="submit" value="提交" />
  </form>
  <script>
    function loadIframe(){
      alert(123);
    }
  </script>
</body>
```

但是这个会出现一个问题，console会报错，html从上往下加载第一次执行到iframe的时候回进行加载，但是此时js脚本还没有读到呢，因此会报错，说loadIframe找不到。为了避免这个问题：

```html
<body>
  <input type='text' />
  <!--使用target可以指定提交的方式，不用form原来的提交方式了。-->
  <form id="f1" method='post' action='/fake_ajax/' target="ifr">
    <!--这个iframe放哪其实无碍-->
    <iframe name="ifr"  id='ifr' style='display:none'></iframe>
    <input type="text" name="user" />
    <a onclick="submitForm();">提交</a>
  </form>
  <script>
    # 通过js代码提交表单，可以在提交的时候再绑定事件。
    function submitForm(){
      document.getElementById('f1').submit();
      # 在点的时候才绑定事件，第一遍读取的时候并不绑定事件。
      document.getElementById('ifr').onload=loadIframe();
    }
    function loadIframe(){
      # 取iframe中的数据要用contentWindow取内容。
      var content = document.getElementById('ifr').contentWindow.document.body.innerText;
      alert('content')
    }
  </script>
</body>
```

上面的这些都是发送的文字，接下来来看如何使用ajax在后台上传文件。

```javascript
function upload(){
  # 创建一个FormData对象，这个对象能传字符串能传文件
  var formData = new FormData();
  # 字符串
  formData.append('k1','v1')
  # 拿到文件对象，i1为input的type为file的标签的id，它下面有一个files，拿到的是
  # 一个文件对象的列表，因为有可能上传多个文件，我们取第一个就是索引0的位置
  formData.append('fafafa',document.getElementById('i1').files[0])
  var xhr = new XMLHttpRequest();
  xhr.onreadystateChange = function(){
    if (xhr.readyState == 4){
      var file_path = xhr.responsetext;
      var tag = document.createElement('img');
      tag.src = "/" + file_path;
      document.getElementById('container1').appendChild(tag);
    }
  }
  xhr.open('POST','/add2/');
  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  # 用于发送请求，将formData对象放到这里，formData里既有普通的文本又有文件
  xhr.send(formData);
}


def upload(request):
  if request.method == "GET":
    return render(xxx)
  else:
    file_obj = request.FILES.get('fafafa')
    file_path = os.path.join("static",file_obj.name)
    with open(file_path, 'wb') as f:
      for chunk in file_obj.chunks():
        f.write(chunk)
    
    return HttpResponse(file_path)
```

使用jquery封装的ajax提交

```javascript
function upload2(){
  var formData = new FormData();
  formData.append('k1','v1');
  formData.append('fafafa',$('#i2')[0].files[0]);
  # jquery对象和Dom对象的互换，直接把dom对象加个$(dom对象)就变成jquery对象
  # 把jquery对象加个0的索引就能转换成dom对象，比如$('#i2')[0]
  $('#i2')
  $.ajax({
    url:'/upload/',
    type:'POST',
    data:formData,
    # 告诉jquery不要添加Content-Type，让jquery不做处理。
    contentType:false,
    processData:false
    success:function(arg){
      var tag = document.createElement('img');
      tag.src = "/" + arg;
      $('#container2').append(tag);
    }
  })
}
```

FormData对象是html5以后提出来的这么一个对象，主流的浏览器和ie10以上都是可以使用的，但是针对以前的浏览器就会有问题。因此兼容性存在一定的问题，如果想要兼容性更好一些，可以使用伪造的Ajax。

```javascript
# html:
<form id="f1" method="POST" action="/upload/" target='ifr' enctype="multipart/form-data">
  <iframe id='ifr' name='ifr' style='display:none'></iframe>
  <input type="file" name="fafafa" />
  <a onclick="upload3;">上传</a>
</form>


function upload3(){
  document.getElementById('f1').submit();
  document.getElementById('ifr').onload=loadIframe();
}
function loadIframe(){
  var content = document.getElementById('ifr').contentWindow.document.body.innerText;
  # 这个拿到的content就是上传文件的地址。
  alert('content');
}
```

总结：

1. 上传文件，推荐使用伪造的。
2. 上传数据，推荐有限使用jQuery，如果不允许使用jQuery可以使用XMLHttpRequest。
3. 不要被好看的上传按钮所迷惑

上传按钮，做一个分层，把默认按钮的透明度调成是0，把自己做的放到底层。

hidefocus = True

## 跨域的Ajax JSONP

JSONP是一种技巧和一种技术，或者叫一种访问方式。

Ajax存在：访问自己域名下的内容是没问题的，但是访问别的域名的请求就会存在被阻止的问题。浏览器会阻挡下来，ajax的回调函数不会执行的。

浏览器：同源策略，浏览器遵循同源策略。从浏览器向别的网址发请求会被浏览器组织掉。请求会发过去，数据也会回来，但是被浏览器阻挡，数据拿不到的。相当于数据能发出去但是回不来。

JSONP可以解决上面的问题：

JSONP可以绕过同源策略，去把数据拿回来。浏览器不是针对所有都有同源策略的限制，但是允许带有src属性的标签是允许跨域的。比如js，jquery我们可以用网络的资源，jquery cdn。针对这种请求是没有做同源策略限制的。因此就可以钻这个空子。

```html
# 在页面上创建一个标签，这样就不会有同源策略的限制而且能发送请求。
# 1、发送端：把数据拼接成一个srcipt代码，把script代码放到html代码中。
<script src='http://www.baidu.com'>
</script>

# 2、如果返回的内容恰巧是："func(123123)"

<a onclick="SendMSg();">发送</a>
<script>
  function SendMsg(){
    var tag = document.createElement('script')
    tag.src = 'http://www.baidu.com';
    # 在头部加一个script代码，访问网站的返回值就被读到内存了。
    document.head.appendChild('tag');
  }
</script>
```

双方有约定，和远程约定好共同遵循规则。一个约定好的测试地址如下：

`http://www.jxntv.cn/data/jmd-jxtv2.html?callback=list&_=1454376870403`



开发需求：向其他网站发送http请求

- 浏览器直接发送请求，需要考虑同源策略。


- 把请求发给服务端，让本地服务端去请求然后再返给本地服务器，此时就不会有同源策略，因为不是浏览器。



```javascript
function getUser(){
  var tag = document.createElement('script');
  # 传递参数传递一个funcname
  tag.src = "http://xxx:8881/users/?funcname=bbb"
  document.head.appendChild(tag);
}

#
function bbb(arg){
  console.log(arg)
}

# 后端数据
def users(request):
    v = request.GET.get('funcname')
    user_list = ['aaa','vvv','bbb']
    user_list_str = json.dumps(user_list)
    temp = "%s(%s)" % (v,user_list_str,)
    return HttpResponse(temp)
```

JSONP的要求：

- 客户端和服务端要达成一致。
- 在客户端的URL中要加一个?funcname=xxxx
- 在客户端要有一个和funcname同名的函数
- 服务端要获取funcname
- 返回funcname(args)

一般情况下funcname叫callback，其实就是回调函数。

不过上面这些东西Jquery有现成的。

```javascript
functiuon getUsers(){
  # 默认使用XMLHttpRequest，如果指定dataType为JSONP那么内部就会
  # 使用JSONP来进行发送
  # jquery内部会在触发以后添加一个script标签，然后又给你删掉了
  $.ajax({
    url: 'xxxxxx',
    type:'GET',
    dataType: 'JSONP',
    # 下面这俩参数相当于  xxxx/?callback=list，一个对应前面的一个对应后面的。
    jsonp: 'callback',
    jsonpCallback: 'list'
  })
}

function bbb(arg){
  console.log(arg)
}
```

使用：

- 动态创建script标签然后删除
- Jquery去做

使用JSONP的时候：

- 只能发get请求，不能发POST，即使写了POST，内部JSONP还是通过get传递。
- 客户端和服务端相互约定好。

JSONP在哪一种语言都有

额外的在响应头中加点值就可以让浏览器忽略同源策略：cors

```javascript
function getUsers(){
  $.ajax({
    url:'xxxxx/new_users',
    type:'GET',
    success:function(arg){
      console.log(arg);
    }
  })
}

def new_users(request):
  user_list = [1,2,3]
  user_list_str = json.dumps(user_list)
  obj = HttpResponse(user_list_str)
  # 跨站资源共享
  # 允许所有人访问：
  # obj['Access-Control-Allow-Origin'] = "*"
  obj['Access-Control-Allow-Origin'] = "访问源地址，表示允许来源拿数据"
  return obj
```

简单请求就是发过来加个响应头，如果是内部请求，会发两次请求，有一个预检的过程。

![](http://omk1n04i8.bkt.clouddn.com/18-2-27/24003776.jpg)











伪造Ajax：

- iframe+form(target='xx')
- JS:document.getElementById('f1').submit()

原生Ajax:

- XMLHttpRequest对象
  - POST请求时注意请求头：Content-type，如果不加的话Request.POST没有，在Request.Body里，POST请求会根据content-type去判断是否从request.body中取值并解析。
- Jquery Ajax





Interview

- python基础
- 数据库一类的，根据需求做数据库设计，数据库性能
- 前端，作用域，词法分析，this，面向对象，JSONP





**2、跨浏览器支持**

- XmlHttpRequest
  IE7+, Firefox, Chrome, Opera, etc.
- ActiveXObject("Microsoft.XMLHTTP")
  IE6, IE5

```javascript
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title></title>
</head>
<body>

    <h1>XMLHttpRequest - Ajax请求</h1>
    <input type="button" onclick="XmlGetRequest();" value="Get发送请求" />
    <input type="button" onclick="XmlPostRequest();" value="Post发送请求" />

    <script src="/statics/jquery-1.12.4.js"></script>
    <script type="text/javascript">

        function GetXHR(){
            var xhr = null;
            if(XMLHttpRequest){
                xhr = new XMLHttpRequest();
            }else{
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            return xhr;

        }

        function XhrPostRequest(){
            var xhr = GetXHR();
            // 定义回调函数
            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4){
                    // 已经接收到全部响应数据，执行以下操作
                    var data = xhr.responseText;
                    console.log(data);
                }
            };
            // 指定连接方式和地址----文件方式
            xhr.open('POST', "/test/", true);
            // 设置请求头
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset-UTF-8');
            // 发送请求
            xhr.send('n1=1;n2=2;');
        }

        function XhrGetRequest(){
            var xhr = GetXHR();
            // 定义回调函数
            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4){
                    // 已经接收到全部响应数据，执行以下操作
                    var data = xhr.responseText;
                    console.log(data);
                }
            };
            // 指定连接方式和地址----文件方式
            xhr.open('get', "/test/", true);
            // 发送请求
            xhr.send();
        }

    </script>

</body>
</html>
```





使用原生的ajax：

```javascript

```

