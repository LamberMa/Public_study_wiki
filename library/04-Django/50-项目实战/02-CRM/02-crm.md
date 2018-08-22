#

## Django ModelForm

> - Model：操作数据库
> - Form：对用户请求过来的数据进行验证+生成html标签
>
> 那么modelform就是操作数据+用户请求验证+生成html标签。如果是写的大型的应用程序，那么不推荐使用modelform，比如数据库操作，不同的业务部门通过api或者rpc去访问。对于这些业务部门来说，他们是接触不到数据库这些表的，这些人只需要做form数据验证，然后转发给基础平台，让基础平台进行数据的插入就行了，这个时候model和form就应该分开了，互相没有依赖关系；对于中小型的应用，比如数据库表就在这个app里，通过modelform可以让你省一些事。
>
> 参考：www.cnblogs.com/wupeiqi/articles/6229414.html





## 定制插件

### 创建app

目的是为了方便以后在哪都能用

```shell
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

### 生成url

在原来我们书写url的时候可以直接在urlpatterns那写url，比如：

```python
urlpatterns = [
    path('login/', views.login)
]
```

还有一种方式就是使用include的方式引入：

```python
from django.urls import path, include
urlpatterns = [
    path('frontend', include('app01.urls'))
]
```

那么这个是如何做的呢？来看一下include的源码:

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
urlpattenrs = [
    path('admin/', admin.site.urls)
]
```

其实我们知道了本质以后就让后面的内容返回一个元组就行了，元组就是有上面的三要素







反向生成url

include('app01.urls',namespace='aaa')

app01.urls中的这一大堆对应关系是和aaa这个namespace对应的。

我在调用v1.site.urls的时候返回的是

[],appname,namespace

其实就相当于include('v1.site.urls', namespace='namespace')

因此以后再反向生成的时候就需要加上这个namespace了。

namespace在分发的时候做进一级别的划分，比如url的name都是n1，有两条，那么n1对应的到底是哪一个。

这个时候如果再加上namespace就可以进行区分了。

只要反向生成url就必须指定namespace

```python

```

反向url的作用：增加成功，跳转回哪个列表？这几个执行函数其实是不知道的。它只能根据反向生成url，根据当前url，根据你的app再加上你的名称去做。可以反向生成的这个列表连接，这样就能跳转回去了？

## CRM项目组件之处理用户请求

在lamber下创建一个template模板，那么他们会优先来自己的template下找。

inclusion_tag表示要导入一个html模板



