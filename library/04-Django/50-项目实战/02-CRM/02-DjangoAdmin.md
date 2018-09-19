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

在我们调用`python manage.py runserver`以后会去依次调用所有的app中的两个文件，其中一个是admin.py，另外一个就是app.py。app.py要早于admin.py的调用；

接下来看一下调用过程都做了什么

1. admin.site.register(models.UserInfo)，这个site是什么，site是AdminSite的一个对象，这条代码在程序运行的一开始，只会执行一次，简单来说这就是一个最简单的单例模式：

   ```python
   # django/crontrib/admin/sites.py 525行 Django版本2.0.1
   site = AdminSite()
   ```

2. site.register，找到AdminSite中的register方法，这里并不做所有代码的逐行分析，只是把用到的代码拿出来说一下:

   ```python
   def register(self, model_or_iterable, admin_class=None, **options):
       if not admin_class:
           admin_class = ModelAdmin
       if isinstance(model_or_iterable, ModelBase):
           model_or_iterable = [model_or_iterable]
           for model in model_or_iterable:
               if model._meta.abstract:
                   raise ImproperlyConfigured(
                       'The model %s is abstract, so it cannot be registered with admin.' % model.__name__
                   )
   			# 避免重复注册，如果注册了两个同样的class的时候会报错。
               if model in self._registry:
                   raise AlreadyRegistered('The model %s is already registered' % model.__name__)
   
               if not model._meta.swapped:
                   if options:
                       options['__module__'] = __name__
                       admin_class = type("%sAdmin" % model.__name__, (admin_class,), options)
   
                   # Instantiate the admin class to save in the registry
                   self._registry[model] = admin_class(model, self)
   ```

   - 在注册的时候我们并没有穿什么admin_class，而只是传递了我们的模型类，admin_class默认为None，如果admin_class为None的时候admin_class会被重新赋值为ModelAdmin
   - 这里传递的模型类，可以是单个的模型类，还可以是一个可迭代的对象，因为不管是一个模型类，还是一个可迭代对象，最后它都会帮我们转换成一个列表。所以我们注册的时候不只是可以admin.site.register(models.AAA)这种写法，还可以
     admin.site.register([models.AAA, models.BBB])这样写。
   - register方法在构造函数`__init__`中，初始化了一个`self._registry`的字典
   - 最后`self._registry[model] = admin_class(model, self)`

那么最后其实分析完register这段代码以后我们发现我们执行的admin.site.register(models.UserInfo)其实是admin.site.register(models.UserInfo, ModelAdmin)。因为会去遍历执行所有app中的admin.py获取所有注册的模型类，因此最后会构造一个字典，也就是self_registry，大概结构如下：

```python
_registry = {
    model.UserInfo: admin.ModelAdmin(model.UserInfo, admin.site),
    model.UserGroup: admin.ModelAdmin(model.UserGroup, admin.site),
}
```

这个字典的key为我们传递的model class，value是ModelAdmin的对象（当admin_class没传值的时候），这个对象都是不同的，因为每一个对象都传递了不同的模型类。第二个参数传递的是self，这里的self是AdminSite的对象，其实就是site。

## Admin URLS

现在该启动程序了，执行manage.py runserver，首先会设置加载环境变量，然后读取settings，循环执行admin.py，构造_registry。然后会执行一句ROOT_URLCONF，到这里就会导入urls。接下来看urls的导入部分：

在原来我们书写url的时候可以直接在urlpatterns那里写url，以及调用的函数，比如：

```python
urlpatterns = [
    path('login/', views.login)
]
```

当然我们还有一种方式导入那就是使用include

```python
from django.urls import path, include
urlpatterns = [
    path('frontend', include('app01.urls'))
]
```

那么这个直接写和include有什么区别？来看一下include的代码怎么写的

```python
def include(arg, namespace=None):
    app_name = None
    # 在这里我们发现include首先判断这个传进来的arg是不是一个元组，变相的告诉我们，这里其实是可以传递元组进来的，这个一会再说。
    if isinstance(arg, tuple):
        try:
            urlconf_module, app_name = arg
        except ValueError:
            if namespace:
                raise ImproperlyConfigured(
                    'Cannot override the namespace for a dynamic module that '
                    'provides a namespace.'
                )
            raise ImproperlyConfigured(
                'Passing a %d-tuple to include() is not supported. Pass a '
                '2-tuple containing the list of patterns and app_name, and '
                'provide the namespace argument to include() instead.' % len(arg)
            )
    else:
        # 当不是元组的时候urlconf_module就直接等于arg，也就是字符串的app01.urls
        urlconf_module = arg
	# 如果这个是字符串的话会用import_module导入这个app01下的urls
    if isinstance(urlconf_module, str):
        urlconf_module = import_module(urlconf_module)
    # 到这一步位置其实我们就可以看懂了，我们在自己写的时候这个include进来的urls其实也是要写一个urlpatterns的，如果你写别的话其实就不生效了，django也不认识了，因此这里直接使用反射来拿urlpatterns，那么最后的返回值patterns其实就是urlpatterns。
    patterns = getattr(urlconf_module, 'urlpatterns', urlconf_module)
    app_name = getattr(urlconf_module, 'app_name', app_name)
    if namespace and not app_name:
        raise ImproperlyConfigured(
            'Specifying a namespace in include() without providing an app_name '
            'is not supported. Set the app_name attribute in the included '
            'module, or pass a 2-tuple containing the list of patterns and '
            'app_name instead.',
        )
    namespace = namespace or app_name
    # Make sure the patterns can be iterated through (without this, some
    # testcases will break).
    if isinstance(patterns, (list, tuple)):
        for url_pattern in patterns:
            pattern = getattr(url_pattern, 'pattern', None)
            if isinstance(pattern, LocalePrefixPattern):
                raise ImproperlyConfigured(
                    'Using i18n_patterns in an included URLconf is not allowed.'
                )
    # 最后看include返回了什么？返回了一个元组，为urlconfig_module，app_name，namespace
    return (urlconf_module, app_name, namespace)
```

现在知道include实际返回的内容了以后其实我们就可以实际在path这里写一个元组了：

```python
urlpatterns = [
    path('login/', ([这里填写一个个路由匹配规则], 'appname', 'namespace'))
]
```

不过还记得django的admin是怎么写的么？

```python
urlpatterns = [
    url(r'^admin/', admin.site.urls),
]
```

这样的方法和include又有什么本质上的区别呢？

```python
@property
def urls(self):
    return self.get_urls(), 'admin', self.name
```

查看一下get_urls中定义了一个urlpatterns，

![](http://tuku.dcgamer.top/18-8-23/93976210.jpg)

这里面已经定义了一堆url路由规则，比如login和logout等等，这也就是为什么装好程序以后啥都不用做直接访问`http://127.0.0.1:8000/admin`就可以进行登录的原因。紧接着：

![](http://tuku.dcgamer.top/18-8-23/99765585.jpg)

我们看到在这一步遍历了在程序一起动生成好的_registry这个字典，其中model就是我们的模型类，而model_admin是之前admin_class的对象。因为model是之前我们定义的模型类，那么可以通过\_meta信息来获取到这个model所属的app以及model name。app那么为model.\_meta.app_label，模型类的名称为model.\_meta.model_name，其实现在就开始要拼接我们创建的app的model的增删改查的url了，类似于这样：

![](http://tuku.dcgamer.top/18-8-23/2773998.jpg)

```python
urlpatterns += [
    path('%s/%s' % (model._meta.app_label, model._meta.model_name), include(model_admin.urls))
]
```

只是靠格式化是拼接不出来改和删的内容的，因为有变化的内容id在，因此admin组件在这个url的拼凑中最后使用了`include(model_admin.urls)`这个内容，看看这个内容干了点啥；model_admin是ModelAdmin这个类的一个对象，看一下类中的urls方法

```python
@property
def urls(self):
    return self.get_urls()
```

get_urls绑定方法内容：

![](http://tuku.dcgamer.top/18-8-23/28897974.jpg)

看这里的urlpatterns，这是一系列的url的匹配规则，其实到这里位置就把我们的add，delete，change也都拼接进去了，如果没有的话那么就是查，并且，每个对应的视图函数也都写好了。反向url也都写好了。

### 定制Admin

> http://www.cnblogs.com/wupeiqi/articles/7444717.html
>
> https://www.cnblogs.com/yuanchenqi/articles/8323452.html

在admin.py中只需要讲Mode中的某个类注册，即可在Admin中实现增删改查的功能，如：

```python
admin.site.register(models.UserInfo)
```

但是，这种方式比较简单，如果想要进行更多的定制操作，需要利用ModelAdmin进行操作，如：

```python
方式一：
    class UserAdmin(admin.ModelAdmin):
        list_display = ('user', 'pwd',)
 
    admin.site.register(models.UserInfo, UserAdmin) # 第一个参数可以是列表
     
 
方式二：
    @admin.register(models.UserInfo)                # 第一个参数可以是列表
    class UserAdmin(admin.ModelAdmin):
        list_display = ('user', 'pwd',)
```

ModelAdmin中提供了大量的可定制功能，接下来对这些功能进行一些详细的说明

- list_display，列表时，定制显示的列。这里的列字段不包含多对多的字段，写多对多的字段会报错

  ```python
  @admin.register(models.UserInfo)
  class UserAdmin(admin.ModelAdmin):
      list_display = ('user', 'pwd', 'xxxxx')
   
      def xxxxx(self, obj):
          return "xxxxx"
      
  # 同样这里还可以写一个函数，那么在字段显示的内容就会变为函数的返回值
  from django.contrib import admin
  from app01 import models
  
  
  # Register your models here.
  class UserInfoConfig(admin.ModelAdmin):
  
      def showtest(obj):
          # 这里的参数是什么？这里的参数其实是这个modelclass的对象，那么这里显示的内容是不是可以做成一个a标签呢？当然是可以的
          return 'aaa'
      
      list_display = ('name', 'email', 'phone', showtest)
      list_display_links = ('email', )
  
  
  admin.site.register(models.UserInfo, UserInfoConfig)
  ```

  ![](http://tuku.dcgamer.top/18-8-23/5031604.jpg)

  既然这里显示的内容是可以让我们自己定制的，那么这里可不可以显示一个a标签呢？当然是可以的

  ```python
  from django.contrib import admin
  from app01 import models
  from django.utils.safestring import mark_safe
  
  
  # Register your models here.
  class UserInfoConfig(admin.ModelAdmin):
  
      def showtest(obj):
          return mark_safe('<a href="'+str(obj.id)+'/delete">删除</a>')
  
      list_display = ('name', 'email', 'phone', showtest)
      list_display_links = ('email', )
  
  
  admin.site.register(models.UserInfo, UserInfoConfig)
  ```

  这个时候对应的页面上的showtest列就编程一个删除的a标签了。

- list_display_links，列表时，定制哪些列是可以点击并跳转。点击跳转跳转的其实就是这条记录的change页面

  ```python
  @admin.register(models.UserInfo)
  class UserAdmin(admin.ModelAdmin):
      list_display = ('user', 'pwd', 'xxxxx')
      list_display_links = ('pwd',)
  ```

- list_filter，列表时，定制右侧快速筛选。

  ```python
  from django.contrib import admin
  from app01 import models
  from django.utils.safestring import mark_safe
  
  
  # Register your models here.
  class UserInfoConfig(admin.ModelAdmin):
  
      def showtest(obj):
          return mark_safe('<a href="'+str(obj.id)+'/delete">删除</a>')
  
      list_display = ('name', 'email', 'phone', showtest)
      list_display_links = ('email', )
      list_filter = ['name']
  
  
  admin.site.register(models.UserInfo, UserInfoConfig)
  ```

  ![](http://tuku.dcgamer.top/18-8-23/2647530.jpg)

  ```python
  from django.utils.translation import ugettext_lazy as _
   
  @admin.register(models.UserInfo)
  class UserAdmin(admin.ModelAdmin):
      list_display = ('user', 'pwd')
   
      class Ugg(admin.SimpleListFilter):
          title = _('decade born')
          parameter_name = 'xxxxxx'
   
          def lookups(self, request, model_admin):
              """
              显示筛选选项
              :param request:
              :param model_admin:
              :return:
              """
              return models.UserGroup.objects.values_list('id', 'title')
   
          def queryset(self, request, queryset):
              """
              点击查询时，进行筛选
              :param request:
              :param queryset:
              :return:
              """
              v = self.value()
              return queryset.filter(ug=v)
   
      list_filter = ('user',Ugg,)
  ```

- list_select_related，列表时，连表查询是否自动select_related。这个其实是一个有关于性能优化的一个设置项，一般查数据的时候如果没有联表，那么我们在跨表查数据的时候每一次跨表都要重新发起一次查询，list_select_related设置了以后会在一开始一并给你联表查询出来，避免后续跨表再频繁发送请求。

- 分页相关：

  ```python
  # 分页，每页显示条数
      list_per_page = 100
   
  # 分页，显示全部（真实数据<该值时，才会有显示全部）
      list_max_show_all = 200
   
  # 分页插件
      paginator = Paginator
  ```

- list_editable，列表时，可以编辑的列，设置哪些列是可以进行编辑的

  ```python
  @admin.register(models.UserInfo)
  class UserAdmin(admin.ModelAdmin):
      list_display = ('user', 'pwd','ug',)
      list_editable = ('ug',)
  ```

- search_fields，列表时，模糊搜索的功能，其实就会在数据列表上方显示一个搜索框允许你搜索，你可以搜user也可以搜pwd字段，只要你写了的字段你就可以在这里进行模糊搜索。

  ```python
  @admin.register(models.UserInfo)
  class UserAdmin(admin.ModelAdmin):
       
      search_fields = ('user', 'pwd')
  ```

- date_hierarchy，列表时，对Date和DateTime类型进行搜索

  ```python
  @admin.register(models.UserInfo)
  class UserAdmin(admin.ModelAdmin):
   
      date_hierarchy = 'ctime'
  ```

- preserve_filters，详细页面，删除、修改，更新后跳转回列表后，是否保留原搜索条件；这个比如你再分页的时候想要跳转到一个页面进行修改，跳转之前的url为xxxx?page=2，那么更新完成以后再跳转回来就是仍然还能保留最后面那个参数page=2。

- save_as = False，详细页面，按钮为“Sava as new” 或 “Sava and add another”

- save_as_continue = True，点击保存并继续编辑

  ```python
  save_as_continue = True
   
  # 如果 save_as=True，save_as_continue = True， 点击Sava as new 按钮后继续编辑。
  # 如果 save_as=True，save_as_continue = False，点击Sava as new 按钮后返回列表。
   
  New in Django 1.10.
  ```

- save_on_top = False，详细页面，在页面上方是否也显示保存删除等按钮；有的时候一页的内容太多，要保存要翻到最底下，加上这个参数以后在上面也可以进行保存删除了。也没啥屌用

- inlines，详细页面，如果有其他表和当前表做FK，那么详细页面可以进行动态增加和删除

  ```python
  class UserInfoInline(admin.StackedInline): # TabularInline
      extra = 0
      model = models.UserInfo
   
   
  class GroupAdminMode(admin.ModelAdmin):
      list_display = ('id', 'title',)
      inlines = [UserInfoInline, ]
  ```

- action，列表时，定制action中的操作

  ```python
  @admin.register(models.UserInfo)
  class UserAdmin(admin.ModelAdmin):
   
      # 定制Action行为具体方法，其中queryset就是我们选中的那些数据
      def func(self, request, queryset):
          print(self, request, queryset)
          print(request.POST.getlist('_selected_action'))
   
      func.short_description = "中文显示自定义Actions"
      actions = [func, ]
   
      # Action选项都是在页面上方显示
      actions_on_top = True
      # Action选项都是在页面下方显示
      actions_on_bottom = False
   
      # 是否显示选择个数
      actions_selection_counter = True
  ```

  



## Stark组件

简单的了解了admin的注册以及生成url的逻辑以后就可以按照上面的套路定制我们自己的组件了。

### 创建app

目的是为了方便以后在哪都能用

```python
django-admin startapp lamber
```

### 配置准备

最后我们写成的这个插件要也是允许用户注册用户的模型类，然后通过我们的插件去显示，在Django中，是在app下的admin.py注册的，那么这个名我们是否可以自己定义呢？

首先，项目启动以后并不是app里所有的组件都会执行，会执行的只有admin.py和app.py，并且app.py是要先执行的。

```python
# apps.py
from django.apps import AppConfig

class App01Config(AppConfig):
    name = 'app01'
```

settings中注册的django的admin组件：

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'app01',
]
```

我们可以看一下admin组件在导入的时候干了什么

```python
# 在site-packages/django/contrib/admin/__init__.py中最后有这样一个函数
# 这里其实就是找我们的admin.py，看到这里也就是说这个名字是允许我们自己定义的。
def autodiscover():
    autodiscover_modules('admin', register_to=site)
```

现在我们要自己写插件，不适用django的admin了，那么再installed_apps中，这一行其实就可以注释掉了，之后再导入我们自己开发的组件就可以了。注释内容如下：

```python
INSTALLED_APPS = [
    # 'django.contrib.admin',
    # 'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    # 'django.contrib.messages',
    'django.contrib.staticfiles',
    'app01',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    # 'django.contrib.auth.middleware.AuthenticationMiddleware',
    # 'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                # 'django.contrib.auth.context_processors.auth',
                # 'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

AUTH_PASSWORD_VALIDATORS = [
    # {
    #     'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    # },
]
```

记得把urls.py中的引用也给注掉，不然会报错；然后我们在执行makemigrations和migrate的时候其实就会干净很多，很多没用的表也不会生成。如果你觉得没用的表太多的话其实把用不到的app注销掉是比较好的做法。

既然admin注掉了，那么app重的admin.py其实也没什么用了，也就可以删掉了。

既然我们把admin干掉了，那么我们也要创建一个和admin类似的组件。

### 注册用户模型类

当程序刚运行的时候，django会去找每一个app中的app.py，就会执行app.py中的内容，其中一个就会执行ready方法；首先看一下app.py，以lamber中的app.py为例：

```python
# apps.py
from django.apps import AppConfig

class LamberConfig(AppConfig):
    name = 'lamber'
```

LamberConfig继承自Appconfig，在Appconfig这个类中的定义里有ready方法是这么写的：

```python
def ready(self):
    """
    当django启动的时候，在子类中的这个方法会重写这个方法来运行代码
    Override this method in subclasses to run code when Django starts.
    """
```

因此我们可以在app中的app.py中定义一个ready函数：

```python
from django.apps import AppConfig


class LamberConfig(AppConfig):
    name = 'lamber'
    
    def ready(self):
        super(LamberConfig, self).ready()

        from django.utils.module_loading import autodiscover_modules
        # 指定自动发现的内容为lamber.py，这里就是指定文件的过程。
        autodiscover_modules('lamber')
```

写好以后在settings中注册一下我们新创建的app：

```python
INSTALLED_APPS = [
    # 'django.contrib.admin',
    # 'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    # 'django.contrib.messages',
    'django.contrib.staticfiles',
    'app01',
    # 注意写的方式，这里要使用这种方式注册才能生效
    'lamber.apps.LamberConfig'
]
```

那么现在我们就可以在每一个app下创建一个lamber.py了；这样每一个app在加载的时候都会执行我们的lamber.py这个文件了。在这个加载文件的时候我们就可以完成用户模型类的注册。

### 针对用户的类生成url

其实我们知道了本质以后就让后面的内容返回一个元组就行了，元组就是有上面的三要素；那我们也仿照着admin去写一下，首先我们在新建的lamber项目下新建一个service的python package，然后service下新建一个v.py，接下来在路由的主入口函数中进行导入：

```python
from lamber.service import v1
urlpatterns = [
    # path('admin/', admin.site.register),
    path('lamber/', v1.site.urls),
]
```

我们想的是最后v1.site.urls要返回我们之前提到的三要素，一个元组，一个appname，一个namespace。

```python
class BaseLamberAdmin(object):

    list_display = '__all__'

    def __init__(self, model_class, site):
        self.model_class = model_class
        self.site = site

    @property
    def urls(self):

        info = self.model_class._meta.app_label, self.model_class._meta.model_name
        urlpatterns = [
            path('', self.changelist_view, name='%s_%s_changelist' % info),
            path('add/', self.add_view, name='%s_%s_add' % info),
            path('<path:object_id>/delete/', self.delete_view, name='%s_%s_delete' % info),
            path('<path:object_id>/change/', self.change_view, name='%s_%s_change' % info),
        ]
        return urlpatterns

    def changelist_view(self, request):
        # info = self.model_class._meta.app_label, self.model_class._meta.model_name
        # data = "%s_%s_changelist" % info
        # return HttpResponse(data)
        self.model_class.objects.all()

    def add_view(self, request):
        info = self.model_class._meta.app_label, self.model_class._meta.model_name
        data = "%s_%s_add" % info
        return HttpResponse(data)

    def delete_view(self, request, pk):
        info = self.model_class._meta.app_label, self.model_class._meta.model_name
        data = "%s_%s_del" % info
        return HttpResponse(data)

    def change_view(self, request, pk):
        info = self.model_class._meta.app_label, self.model_class._meta.model_name
        data = "%s_%s_change" % info
        return HttpResponse(data)

class LamberSite(object):
    def __init__(self):
        self._registry = {}
        self.namespace = 'lamber'
        self.appname = 'lamber'

    def register(self, model_class, xxx=BaseLamberAdmin):
        self._registry[model_class] = xxx(model_class, self)

    def login(self, request):
        # 在这里必须要加上namespace，我们这里的namespace就是lamber
        # 如果在分发的时候指定了namespace，那么在反向生成的时候就必须指定namespace
        print(reverse('lamber:login'))
        """
        NoReverseMatch at /lamber/login/
        Reverse for 'login' not found. 'login' is not a valid view function or pattern name.
        """
        # print(reverse('login'))
        return HttpResponse('login')

    def logout(self, request):
        return HttpResponse('logout')

    def get_urls(self):
        ret = [
            path('login/', self.login, name='login'),
            path('logout/', self.logout, name='logout')
        ]

        for model_cls, lamber_admin_obj in self._registry.items():
            appname = model_cls._meta.app_label
            model_name = model_cls._meta.model_name

            # ret.append(path('%s/%s/' % (appname, model_name), self.login,))
            ret.append(path('%s/%s/' % (appname, model_name), include(lamber_admin_obj.urls),))

        return ret

    @property
    def urls(self):
        return self.get_urls(), self.appname, self.namespace


site = LamberSite()
```

admin中site是AdminSite返回的对象，这里我们也照葫芦画瓢定义个LamberSite，在入口函数中，调用了v1.site.urls方法。