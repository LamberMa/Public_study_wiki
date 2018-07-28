# MiddleWare

> 用户请求到达视图函数之前还隔着一层中间件，django 中的中间件（middleware），在django中，中间件其实就是一个类，在请求到来和结束后，django会根据自己的规则在合适的时机执行中间件中相应的方法。

## 了解中间件

 中间件中可以定义五个方法，分别是：

 - process_request(self,request)
 - process_view(self, request, callback, callback_args, callback_kwargs)
 - process_template_response(self,request,response)
 - process_exception(self, request, exception)
 - process_response(self, request, response)

```python
# Django的Settings文件。
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

对应到Django中其实就是一个个的类，请求进来是一套方法，请求返回又是一套方法。在每一层中间件的时候如果遇到了错误，就不会继续执行了而是直接返回，根本到达不了视图函数。

以上方法的返回值可以是None和HttpResonse对象，如果是None，则继续按照django定义的规则向下执行，如果是HttpResonse对象，则直接将该对象返回给用户。

![](http://omk1n04i8.bkt.clouddn.com/18-4-18/45908211.jpg)

比如我们在这里做一个黑名单的功能，拦下一些ip地址。

```python
# 自定义中间件
from django.utils.deprecation import MiddlewareMixin

class M1(MiddlewareMixin):
    def process_request(self, request):
 		pass
    
    def process_response(self, request, response):
        # 在response的时候要返回给下一个中间件
        # request不用return，因为django内部帮忙操作了。添上反而有问题。
        # 你如果在request部分返回值，中间件就不继续往下执行了。
        return response
```

在配置文件中，中间件是一个有序列表，因此中间件也是按照顺序进行执行的。

- 类
  - process_request：django为你做了返回，如果自己添加的话中间件不会进一步运行
  - process_response：需要有一个返回值
- 注册中间件

## 中间件的执行流程

### process_request&process_response

![](http://omk1n04i8.bkt.clouddn.com/18-4-18/35856559.jpg)

中间绿色块是中间件层，每一个橙色的方块代表一个中间件，正常来讲是这样一个流程，当process_request有返回值的时候，就会停止请求下一个，找到自己的process_response返回。

![](http://omk1n04i8.bkt.clouddn.com/18-4-18/6924732.jpg)

不过上面这个是django1.10以后的一个流程，在1.10之前的流程并不是这样的。稍微有些小小的不同，在较低版本，如果说某一个中间件的process_request有了返回值的话，它会找到最后一个中间件的process_response然后返回。

![](http://omk1n04i8.bkt.clouddn.com/18-4-18/94437225.jpg)

### process_view

中间件除了request和response外还有一个process_view方法

```python
def process_view(self, request, callback, callback_args, callback_kwargs):
    pass

callback是路由匹配对应的url函数的函数名。
```

那么这个process_view的执行顺序又是如何的呢？来看一下这个例子：

```python
# app01/md.py
from django.utils.deprecation import MiddlewareMixin


class M1(MiddlewareMixin):

    def process_request(self, request):
        print('M1-process-request')

    def process_response(self, request, response):
        print("M1-process-response")
        return response

    def process_view(self, request, callback, callback_args, callback_kwargs):
        print('M1-process-view')


class M2(MiddlewareMixin):

    def process_request(self, request):
        print('M2-process-request')

    def process_response(self, request, response):
        print("M2-process-response")
        return response

    def process_view(self, request, callback, callback_args, callback_kwargs):
        print('M2-process-view')
```

然后再settings中注册一下这两个中间件的组件：

```python
# settings.py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'middleware.md.M1',
    'app01.md.M1',
    'app01.md.M2'
]
```

我们随便定义个url去访问然后看终端控制台print的值结果为：

```python
M1-process-request
M2-process-request
M1-process-view
M2-process-view
M2-process-response
M1-process-response
```

可以发现顺序是这样的：

![](http://omk1n04i8.bkt.clouddn.com/18-4-18/10046146.jpg)

从上面的代码可以看到目前的process_view是没有返回值的。没有返回值的情况下，目前是这么个流程。我们发现process_view的参数多了很多，打印一下callback可以发现这个其实返回的就是我们的视图函数的地址。其实也就是说执行到process_view的时候我们已经可以拿到视图函数了，就是通过这个callback去拿就可以。那么现在加以改造上面的中间件写法，单独修改一下M1：

```python
from django.utils.deprecation import MiddlewareMixin


class M1(MiddlewareMixin):

    def process_request(self, request):
        print('M1-process-request')

    def process_response(self, request, response):
        print("M1-process-response")
        return response

    def process_view(self, request, callback, callback_args, callback_kwargs):
        print('M1-process-view')
        response = callback(request, *callback_args, **callback_kwargs)
        return response
```

我们为process_view添加上返回值。再次观察终端输出的值

```python
M1-process-request
M2-process-request
M1-process-view
M2-process-response
M1-process-response
```

可以发现执行了M1的process_view，但是跳过了M2的process_view，我们在M1的process_view中去主动的调用视图函数了，所以流程可以归结如下：

![](http://omk1n04i8.bkt.clouddn.com/18-4-18/32736201.jpg)

1. 先依次走完每个中间件的process_request
2. 然后折返到最初的中间件去执行对应的各个中间件的process_view，当没有返回值的时候会依此执行每个中间件的process_view，当有返回值的时候，从这个中间件往下的其他中间件的process_view不会继续执行，而是直接去调用视图函数。
3. 从最后一个中间件的process_response逐个返回。

### process_exception

这个方法会捕获视图函数中的错误，默认并不会执行，只有视图函数中报错的时候才会执行。执行流程如下：

![](http://omk1n04i8.bkt.clouddn.com/18-4-18/51116656.jpg)

遇到视图函数报错以后会从最后一个中间件的exception依次执行到第一个，然后再折返到最后一个中间件去执行process_response然后返回。形状就像一个鸡爪或者两个闪电~，目前是exception没有返回值，一旦exception有返回值的时候那么就不会继续往下执行了。就算是谁把错误处理了以后就不会继续往下执行了。而是直接折返到最后一个中间件去执行process_response依次执行到第一个。

### process_template_response(self, request, response)

针对视图函数的返回值做一个要求，如果有render方法才会被调用，其他情况下是不会被调用的。这个render函数我们可以自己去定义，只要是名称为render：

```python
# 在视图函数中
from django.shortcuts import render,HttpResponse
import json

class Foo:
    def __init__(self,req,status,msg):
        self.req = req
        self.status = status
        self.msg = msg
    def render(self):
        ret = {
            'status':self.status,
            'msg':self.msg
        }
        return HttpResponse(json.dumps(ret))
    
def test(request):
    return Foo(request,True,"错误信息")
```

相当于我们做一个类将信息封装成json格式给用户返回，而且我们定义了一个render方法，这样就会触发中间件的process_template_response方法（返回的对象中有render方法），然后通过这个方法可以再对返回内容做一定的规范和要求。

## 小结

到底什么时候开始应用中间件：

- 适用于对所有请求或者一部分请求做批量处理。（比如针对所有的用户请求做日志统计）
- 可以应用于请求做判断进行缓存应用的处理。