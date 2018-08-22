# DjangoAdmin

> 本次的主题为CRM，我们需要开发一个统一化的CRM插件去完成我们的工作，但是这个插件的设计思路，其实是参考Django的Admin来做的，因此在一切的一切的开始，先从DjangoAdmin说起。

## Admin的使用

之前针对Django Admin的使用大多数是用来临时添加数据，使用方式也很简单：

0. admin本身也是一个app，但是默认的在项目创建好了以后，就自动为你注册上了；

1. 编写数据models模型

2. 进入admin.py中，注册我们的models模型，只要使用`admin.site.register(models.xx)`注册完成以后我们直接访问`http://your_address:8000/admin`就可以看到登录界面了，使用`python manage.py createsuperuser`创建好用户名和密码登录以后我们就可以登录了。

3. 路由分发，路由是如何分发过来的？在入口的urls.py中，有一条默认的配置：

   ```python
   from django.contrib import admin
   from django.urls import path
   
   urlpatterns = [
       path('admin/', admin.site.register),
   ]
   ```

   其实从一开始就有这样的疑问，为什么这里的写法和我们平常使用的时候写法是不一样的？平常的写法的话，就是简单的`path('userinfo/', views.userinfo)`样式的，不过这里并不是这样调用的？**这块到底是如何实现的？**

比如我们自己注册了一个UserInfo的model class，那么就会在django的admin中发现我们的这个类：

![](http://tuku.dcgamer.top/18-8-22/55457149.jpg)

在这里我们就可以进行数据的增删改查了，其实到这一步为止这些操作我们都已经非常熟悉了，这里只是有一个需要注意的地方，观察一下增删改查的时候这些操作的URL：

- 查：http://127.0.0.1:8000/admin/app01/userinfo/
- 增：http://127.0.0.1:8000/admin/app01/userinfo/add/
- 改：http://127.0.0.1:8000/admin/app01/userinfo/1/change/
- 删：http://127.0.0.1:8000/admin/app01/userinfo/1/delete/

通过上面的连接可以发现这几个连接的一个规律，查的时候为`http://your_ip:8000/admin/app_name/model_cls_name`，添加的时候是在上面的基础上添加一个add，删除和改的时候都是要针对某一条记录进行删和改，因此对应的后面多了一个id，对应的后面的分别为change和delete。

当我们添加其他的app并注册对应app中的model_class后，上面的app_name和model_cls_name还会根据我们添加做对应的变化，这是DjangoAdmin在设计的时候增删改的一个url设计规范，随后我们在定制自己的插件的时候，也可以按照这个规则来。

## Admin注册流程

我们在app中注册的时候是这样注册的：

```python
# app01/admin.py
admin.site.register(models.UserInfo)
```

在我们调用`python manage.py runserver`以后会去依次调用所有的app中的两个文件，其中一个是admin.py，另外一个就是app.py。app.py要早于admin.py的调用，接下来看一下调用过程都做了什么

1. admin.site.register(models.UserInfo)，这个site是什么，site是AdminSite的一个对象，这条代码在程序运行的一开始，只会执行一次，简单来说这就是一个最简单的单例模式：

   ```python
   # django/crontrib/admin/sites.py 525行 Django版本2.0.1
   site = AdminSite()
   ```

2. site.register，找到AdminSite中的register方法:

   ```python
       def register(self, model_or_iterable, admin_class=None, **options):
           """
           Register the given model(s) with the given admin class.
   
           The model(s) should be Model classes, not instances.
   
           If an admin class isn't given, use ModelAdmin (the default admin
           options). If keyword arguments are given -- e.g., list_display --
           apply them as options to the admin class.
   
           If a model is already registered, raise AlreadyRegistered.
   
           If a model is abstract, raise ImproperlyConfigured.
           """
           if not admin_class:
               admin_class = ModelAdmin
   
           if isinstance(model_or_iterable, ModelBase):
               model_or_iterable = [model_or_iterable]
           for model in model_or_iterable:
               if model._meta.abstract:
                   raise ImproperlyConfigured(
                       'The model %s is abstract, so it cannot be registered with admin.' % model.__name__
                   )
   
               if model in self._registry:
                   raise AlreadyRegistered('The model %s is already registered' % model.__name__)
   
               # Ignore the registration if the model has been
               # swapped out.
               if not model._meta.swapped:
                   # If we got **options then dynamically construct a subclass of
                   # admin_class with those **options.
                   if options:
                       # For reasons I don't quite understand, without a __module__
                       # the created class appears to "live" in the wrong place,
                       # which causes issues later on.
                       options['__module__'] = __name__
                       admin_class = type("%sAdmin" % model.__name__, (admin_class,), options)
   
                   # Instantiate the admin class to save in the registry
                   self._registry[model] = admin_class(model, self)
   ```

   

