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

