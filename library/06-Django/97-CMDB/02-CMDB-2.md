# CMDB AutoServer设计

## API部分

在上一节的AutoClient设计中，已经可以通过API向服务端发送消息了，现在可以简单的测试一下服务端接收消息了。

### API部分模拟测试

- 首先新建AutoServer端项目

  ```python
  # 进入虚拟环境
  workon cmdb
  # 创建django project
  cd workspace
  django-admin startproject autoserver
  # 新建两个django的app项目，一个用来做api，一个用来做server的后台
  python manage.py startapp api
  python manage.py startapp backend
  ```

- 在全局url路径中引入api项目的路由

  ```python
  from django.contrib import admin
  from django.urls import path, include

  urlpatterns = [
      path('admin/', admin.site.urls),
      path('api/', include('api.urls'))
  ]
  ```

- 书写api路由

  ```python
  from django.urls import path, re_path
  from api import views

  urlpatterns = [
      re_path('asset.html$', views.asset),
  ]
  ```

- 书写视图函数，先简单一点。

  ```python
  from django.shortcuts import render, HttpResponse


  # Create your views here.
  def asset(request):
      if request.method == "POST":
          print(request.POST)
          print(request.body)

      return HttpResponse('...')

  ```

- 在client端发送数据，当前client端的mode为agent，那么会将采集的内容，发送过来，这里我们打印了request.POST和request.body，由于在client端发送的时候，header为`application/json`的，因此这里的request.POST是拿不到数据的，可以发现第一个querydict为空。

  ```python
  <QueryDict: {}>
  b'{"basic": {"status": true, "data": {"os_platform……………………………………略
  ```

### Server端数据库设计

api采集的信息要入库，api要使用这些表，后台同时也会使用这些表，那么数据库表的模型应该放在哪一个app下呢？其实放在哪一个下面都对。放在api中比较好，当然拆出来也是可以的，因此把数据库模型这块单独拆出来，作为一个数据库访问层单独来提供数据的访问来进行统一管理。

```python
# MTV中的Model层
python manage.py startapp repository
```

### 资产入库







### API验证

> 首先为什么要做API验证？主要就是为了防止别随便来一个人都能从我这个接口这里拿数据，随便来一个人访问我的接口都能给我提交数据。保证数据一定的安全性。

为了验证来访者是我们认识的，一个可用方案是可以让来访问的人带着一个我能认识的东西来访问这样就可以彼此达成共识。

####静态token

这个静态的token串是预先存在client和server端的，彼此预先做好交互的暗号。比如在客户端新建一个py文件做如下的操作：

```python
#!/usr/local/bin/python3

import requests
key = "asdfasdfasdfasdf098712sdfs"
response = requests.get("http://127.0.0.1:8000/api/asset.html",headers={'OpenKey':key})
print(response.text)
```

这里我们把这个key放到请求头里去，那么在server端应该如何去取呢？

```python
# 在视图函数中进行操作
def asset(request):
    if request.method == "GET":
        for k, v in request.META.items():
            print(k, v)
```

request中有一个META数据，这个包含了发过来的请求的所有信息，通过查看内容我们就可以发现里面有一个键值对是`HTTP_OPENKEY`对应`asdfasdfasdfasdf098712sdfs`。value对应的正好就是我们发过来的字符串，但是key前面多了一个http，这个http是django为我们添加上的。然后我们把这个key和server端的key进行比较就可以，server端可以把这key扔到settings然后通过`from django.conf import settings`，然后通过settings进行调用。

不过这种静态的认证字符串是有问题的，如果中间有第三者比如黑客截获以后你这个key是静态的不变的，那么黑客就可以拿过来自己写一个去为所欲为了。因此我们要对这个认证方案进行改进，改为动态的认证key。

#### 动态token

如果需要实现动态的token，可以采用两种方案，可以随着时间动起来，或者随着uuid动起来。这两个都能够成为唯一的辨识信息。因此对client端做如下的改动（以时间为唯一标准）：

```python
import time
# import uuid
import requests
import hashlib

# 获取当前的时间戳，把key和time结合起来，首先让它动态起来。
ctime = time.time()
key = "asdfasdfasdfasdf098712sdfs"
new_key = "%s|%s" %(key, ctime,)

# 避免内容是明文的，因此需要对这些内容需要一个加密
m = hashlib.md5()
# 在python3中，update后面接的内容是一个字节字符串，因此我们需要按照一定的编码转换一下
m.update(bytes(new_key,encoding='utf-8'))
# 这个就是拿到的加密后的新key，这个key客户端在每一次调用的时候都是不一样的！因为时间戳在变。
# 这里考虑一个问题，这个动态的内容是时刻在变的，那么服务端我怎么知道呢？服务端我只有一个key啊
# 不可能这边加密操作一遍，然后在服务端再利用时间戳加密一遍，因为网络io是有时差的，加密后的值必定是不一样的，因此这里我们要把这个当前加密的时间戳给服务端发送过去才可以。
md5_key = m.hexdigest()

# 将加密的key和时间戳拼接一下发送给服务端
md5_time_key = "%s|%s" %(md5_key,ctime)

print(md5_time_key)
response = requests.get("http://127.0.0.1:8000/api/asset.html",headers={'OpenKey':md5_time_key})
print(response.text)
```

在服务端处理

```python
def asset(request):
    
    if request.method == "GET":
        # 从META数据中拿到客户端封装到请求头的数据，一个是加密的key另外一个是客户端的时间戳
        client_md5_key, client_ctime = request.META.get('HTTP_OPENKEY').split('|')
        # 通过客户端的时间戳和服务端本地的key进行和客户端一样的加密认证，然后对比加密后值
        auth_str = "%s|%s" % (settings.AUTH_KEY, client_ctime)
        m = hashlib.md5()
        m.update(bytes(auth_str, encoding='utf-8'))
        auth_code = m.hexdigest()
        if auth_code == client_md5_key:
            print('auth ok')
        else:
            print('auth failed')
```

经过上面这一番处理以后，我们的token也动态变化起来了。但是仍然存在bug的，假如说在发送过程中被截获的话，截获者拿到的就是`dfb9bb5f3b5ac49360eb3336b73ae043|1526372746.1284108`这样的一个内容，那么这个截获者带着这一串内容去请求我们的接口的话你会发现仍然是可以的，虽然我们的key对外部不是透明的，但是经过和时间戳加密后的值是可以对应上的，截获者不需要知道你的key的值就能通过接口拿到数据。

不仅如此，现在可以访问接口的key变为无限制多个了，随便截获一个这个字符串都是有效的，可以认证成功，因此还需要改。需要添加上这些内容的时效性。让这些内容不是永久有效的。

#### 为动态token添加时效

首先说客户端其实每次发请求的时候都是结合自己的时间戳做字符串加密的，因此客户端每次发过来的加密的key应该都是不一样的。为了避免被





AES加密：www.cnblogs.com/wupeiqi/articles/6746744.html





后台序列化操作:

有两种，一种是django内置的，另外一种是重写json方法。

