# Ajax全套

> http://www.cnblogs.com/wupeiqi/articles/5703697.html
>
> 什么是Ajax？(Asynchronous Javascript and XML)，异步JavaScript和XML
>
> - 节省用户操作，时间，提高用户体验，减少护具请求
> - 传输获取数据
>
> Ajax最直接的作用就是数据交互。Ajax其实是可以通过不刷新页面的情况去请求和发送数据。

## 原生Ajax

JQuery的Ajax内部是基于原生的ajax，其实就是jquery就是封装了ajax

### Ajax流程

```javascript
# HTML
<form action="" method="post">
    <input type="button" value="button" id="btn">
</form>


# JS
window.onload = function () {
    var oBtn = document.getElementById('btn');
    oBtn.onclick = function () {
        // 1-相当于打开浏览器
        var xhr = new XMLHttpRequest();
        // 2-在地址栏输入地址
        xhr.open('get', '/login/',true);
        // 3-提交
        xhr.send();
        // 4-等待服务器返回内容
        xhr.onreadystatechange = function () {
            if( xhr.readyState == 4 ){
                if ( xhr.status == 200 ){
                    alert(xhr.responseText)
                } else {
                    alert('出错了！,Err' + xhr.status);
                }
            }
        }
    }
};
```

1. 新建一个ajax的对象
2. 相当于在地址栏中输入地址，open方法需要三个参数，第一个参数是打开方式，第二个是打开的地址，第三个是是否异步。
3. 发送请求给服务端
4. 数据的获取，responseText存放ajax请求返回的内容。readyState代表ajax的工作状态，4表示接受完成可以直接调用了。并且我们可以通过responseText

### XMLHttpRequest

**1、XmlHttpRequest对象介绍**

XmlHttpRequest对象的主要方法：

```
a. void open(String method,String url,Boolen async)
   用于创建请求
   
参数：
- method： 请求方式（字符串类型），如：POST、GET、DELETE...
- url：    要请求的地址（字符串类型）
- async：  是否异步（布尔类型），体现在回调。默认就是异步的
如果是异步，那么偷偷的给后台发数据，然后期间你该干嘛干嘛。前面的代码不会影响后面的代码的执行。
如果是非异步，那么后台处理期间，整个页面就被卡主了。当后面的代码用到了前面的内容的时候就应该使用同步的。

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
      0-初始化，尚未调用open()方法；
      1-启动，调用了open()方法；
      2-发送，已经调用了send()方法，未接收到响应；
      3-接收，已经接收到部分响应数据；
      4-完成，已经接收到全部响应数据，并解析完成，可以在客户端进行调用了；

b. Function onreadystatechange
   当readyState的值改变时自动触发执行其对应的函数（回调函数）

c. String responseText
   服务器返回的数据（字符串类型）

d. XmlDocument responseXML
   服务器返回的数据（Xml对象）

e. Number states
   状态码（整数），如：200、404...等，可以通过状态码做容错处理，来规避一些错误，比如我们的请求输错了，或者服务器挂了，数据库down了返回来的一些错误信息等。

f. String statesText
   状态文本（字符串），如：OK、NotFound...
```

### 举例应用：

```javascript
### GET请求
function add2(){
  var xhr = new XMLHttpRequest();
  xhr.onreadystateChange = function(){
    # 当状态码为4的时候触发执行回调函数。
    if (xhr.readyState == 4){
      alert(xhr.responsetext)
    }
  };
  # 打开一个连接，是否异步不写默认就是异步的
  xhr.open('GET','/add2/?i1=1&i2=2');
  //encodeURI解决编码问题，解决缓存问题就在请求的路径后面接一个时间戳
  //为避免和后台要获取的key产生冲突，因此直接在请求的连接后面加一个&然后直接接时间戳，不指定key
  //注意千万不要忘了“&”，不然就直接接到30后面了。
  //xhr.open('get','2.get.php?username='+encodeURI('刘伟')+'&age=30&' + new Date().getTime(),true);
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
  # POST请求的时候要记得设置Content-Type请求头，申明发送的数据类型。告诉后端我提交的数据是二进制编码的数据。并且post不存在get方法提交时候的缓存问题。所以也无需关系，而且编码问题也无需关心。
  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  # 把数据放到send的参数中，用于发送请求，无需编码
  xhr.send('i1=12&i2=23');
}
```

### Ajax获取数据的处理

> - JSON.stringify()：可以把一个对象转换成对应的字符串
> - JSON.parse：可以把字符串转换成对应的对象
>
> Tip：Json的key值必须是双引号引起来的，json针对这格式是异常严格的，单引号也不行，注意。

### 封装Ajax的方法

```javascript
function ajax(method, url, data, success){
    xhr = new XMLHttpRequest();
    if (method == 'get' && data){
        // 把url和参数数据分开
        url += '?' + data;
    }
    
    xhr.open(method,url,true);
    if (method == 'get'){
        xhr.send();
    } else {
        xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        xhr.send(data)
    }
    
    xhr.onreadystateChange = function(){
    	if (xhr.readyState == 4){
            if (xhr.status == 200){
                // 判断有没有success这个函数，如果有就调用
                // success函数的作用就是把获取到的数据进行处理，比如格式化，放到哪个标签下等
                // xhr.responseText作为success的参数回调给调用端。
                success && success( xhr.responseText );
            }else{
                alert('Error' + xhr.status);
            }
    	}
  	}
}
```

## 伪ajax

> 从iframe标签说起：iframe标签可以伪造出局部刷新的效果。可以开辟一个类似向后台提交的通道。不刷新，发送HTTP请求。`<form>`标签可以把input的数据打包，因此这俩结合起来也可以实现不刷新向后台提交数据的功能。iframe相当于又嵌套了一个页面。

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

