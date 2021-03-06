# 跨域的Ajax JSONP

>JSONP（json with padding）是一种技巧和一种技术，或者叫一种访问方式。
>
>同源策略参考：http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html
>
>https://www.cnblogs.com/rockmadman/p/6836834.html

## 跨域的问题

- 域：域名
- 跨域请求（访问）：一个域名下的文件请求另外一个域名下的资源就产生了跨域。

Ajax存在：访问自己域名下的内容是没问题的，但是访问别的域名的请求就会存在被阻止的问题。浏览器会阻挡下来，ajax的回调函数不会执行的。如果去调用的话会出现如下的一个报错：

```javascript
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

应该如何去理解这个问题呢，相当于服务器设置的一个访问白名单，如果不在这个白名单的话是不允许访问的。

浏览器：同源策略，浏览器遵循同源策略。从浏览器向别的网址发请求会被浏览器组织掉。请求会发过去，数据也会回来，但是被浏览器阻挡，数据拿不到的。相当于数据能发出去但是回不来。

解决跨域问题的方案：

- 服务端代理：服务端的一个文件去请求资源获得结果保存，然后再去访问当前域名下这个结果。
- Flash：服务端存在一个跨域xml文件保存了能够去访问它的域名，如果这个域名存在，允许访问，如果不存在，那就拒绝。比如qq要去访问百度，那么在百度下面会有一个xml文件保存了qq域名。
- JSONP

JSONP可以解决上面的问题：

> 核心：
>
> 1. script标签
> 2. 用script标签加载资源是没有跨域问题的
> 3. ​

JSONP可以绕过同源策略，去把数据拿回来。浏览器不是针对所有都有同源策略的限制，允许带有src属性的标签是允许跨域的。比如js，jquery我们可以用网络的资源，jquery cdn。针对这种请求是没有做同源策略限制的。因此就可以钻这个空子。

在资源加载进来之前定义好一个函数，这个函数接收一个参数（数据），函数利用这个参数做一些事情，然后需要的时候通过script标签加载对应远程文件资源，当远程文件资源被加载进来的时候就会去执行我们前面定义好的函数，并且把数据当做这个函数的参数传入进去。

```javascript
# JSON with padding 把json内容填充进来使用
```





```html
# 在页面上创建一个标签，这样就不会有同源策略的限制而且能发送请求。
# 1、发送端：把数据拼接成一个srcipt代码，把script代码放到html代码中。
<script src='http://www.baidu.com'>
</script>

# 2、如果返回的内容恰巧是："func(123123)"

<a onclick="SendMSg();">发送</a>
<script>
  function SendMsg(){
    # 动态的创建标签进行加载，而不是预先加载。控制执行的过程，实现按需加载。
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

js中尽量少用全局变量，因此为了避免这个问题使用callback回调函数，而不是使用返回全局变量。

JSONP的要求：

- 客户端和服务端要达成一致。或者对返回的数据进行数据分析然后采取相应的方式进行处理
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

JSONP只能发get请求，因此jquery中的ajax不写type也是可以的。

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

简单请求就是发过来加个响应头，如果是内部（复杂）请求，会发两次请求，有一个预检的过程。

![](http://omk1n04i8.bkt.clouddn.com/18-2-27/24003776.jpg)

如何区分复杂请求和简单请求，见博客。









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





不同的数据接口返回的数据使用不同的方式去处理。



豆瓣Ajax请求

```
api.douban.com/book/subjects?q=javascript&alt=xd&cb=fn1
```

JSONP豆瓣实例

```javascript
<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>无标题文档</title>
<style>
#q {width: 300px; height: 30px; padding: 5px; border:1px solid #f90; font-size: 16px;}
dl {border-bottom: 1px dotted #000;}
dt {font-weight: bold;}
</style>
<script>
function fn1(data) {

	var oMsg = document.getElementById('msg');
	var oList = document.getElementById('list');
	
	console.log(data);
	
	oMsg.innerHTML = data.title.$t + ' : ' + data['opensearch:totalResults'].$t;
	
	var aEntry = data.entry;
	var html = '';
	for (var i=0; i<aEntry.length; i++) {
		
		html += '<dl><dt>'+ aEntry[i].title.$t +'</dt><dd><img src="'+ aEntry[i].link[2]['@href'] +'" /></dd></dl>';
		
	}
	
	oList.innerHTML = html;
	
}
window.onload = function() {
	
	var oQ = document.getElementById('q');
	var oBtn = document.getElementById('btn');
	var oMsg = document.getElementById('msg');
	var oList = document.getElementById('list');
	
	oBtn.onclick = function() {

		if ( oQ.value != '' ) {
			var oScript = document.createElement('script');
			oScript.src = 'http://api.douban.com/book/subjects?q='+oQ.value+'&alt=xd&callback=fn1';
			document.body.appendChild(oScript);
		}
		
		//http://api.douban.com/book/subjects?q='+oQ.value+'&alt=xd&callback=fn1&start-index=(当前页*每页显示的条数)&max-results=10(每页显示的条数)
		
	}
	
}
</script>
</head>

<body>
	http://www.douban.com/service/apidoc/reference/
	<input type="text" id="q" /><input type="button" id="btn" value="搜索" />
    <p id="msg"></p>
    <hr />
	<div id="list"></div>
</body>
</html>
```



