# Django

## 1、初识Django

### 1.1、安装

```shell
pip3 install django
```

在终端新建一个django项目(记得跳转到指定的目录中去创建)：

```bash
django-admin startproject myfirstsite
```

目录结构：

```bash
➜  myfirstsite git:(master) ✗ > tree ./
./
├── manage.py        # 管理网站的使用，对当前Django程序的所有操作都可以基于 python manage.py runserver……等等来进行操作
└── myfirstsite
    ├── __init__.py
    ├── settings.py  # 配置文件
    ├── urls.py      # 路由系统，写的是url和函数的对应关系
    └── wsgi.py      # web socket模块，用于定义Django用什么socket来实现。
```

启动django：

```bash
# 切换到项目目录，不加地址的话，默认监听的是本地的8000端口
python3 manage.py runserver 
```

**附：Pycharm创建Django项目**

点击File→New Project→找到django→起名字→选择对应的Interrupter→点击确定：结束~

### 1.2、第一个Django请求

```python
from django.contrib import admin
from django.urls import path
from django.shortcuts import HttpResponse

def login(request):
    """
    处理用户请求，并返回内容，在这里return的内容需要按照django的规则，
    直接返回字符串的login或者是字节串都是不行的，如果想要原原本本的返回写的内容
    需要from django.shortcuts import HttpResponse才可以
    这里的参数request是一个对象。
    :param request:
    :return:
    """
    # HttpResponse只加字符串
    return HttpResponse('login')


urlpatterns = [
    """
    做路由内容的匹配，要按照人家django的规则，注意后面调用的是函数的名字，记住不要加小括号
    """
    # path('admin/', admin.site.urls),
    path('login/', login),
]
```

### 1.3、Django静态文件以及模板配置

1.2小节是直接使用HttpResponse返回一个字符串，那么如果想要返回一个模板内容该怎么办呢？首先在template文件夹下新建一个html文件，然后要想django可以访问到这个模板文件的话还需要引入render模块：

```python
from django.contrib import admin
from django.urls import path
from django.shortcuts import HttpResponse, render

def login(request):
    """
    处理用户请求，并返回内容
    :param request:
    :return:
    """
    return render(request, 'login.html')


urlpatterns = [
    # path('admin/', admin.site.urls),
    path('login/', login),
]
```

render需要两个参数，一个是request，另外一个就是模板文件，你在打的时候都可以给你提示，因为系统默认配置的会去templates文件夹下去找这个模板，如果想要换其他的模板的话可以在django的配置文件settings.py中进行配置：

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')]
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

其实render的本质还是调用了HTTPResponse：

```python
def render(request, template_name, context=None, content_type=None, status=None, using=None):
    """
    Return a HttpResponse whose content is filled with the result of calling
    django.template.loader.render_to_string() with the passed arguments.
    """
    content = loader.render_to_string(template_name, context, request, using=using)
    return HttpResponse(content, content_type, status)
```

那么静态文件应该放在那里呢？比如我们在项目的根目录下新建一个static文件夹。静态文件无外乎css，js和img图片文件夹：

![](http://omk1n04i8.bkt.clouddn.com/18-1-8/70769756.jpg)

新建一个样式文件，然后渲染刚才的那个login.html

```html
<link rel="stylesheet" href="/static/css/style.css">
```

结果就会发现html并没有发生更改，其实主要原因是这个时候，样式的调用也是通过django去调用的。因此这个静态文件的目录也是需要配置的，找到settings.py文件，找到最后一行：

```python
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)
```

我们要添加的内容是`STATICFILES_DIRS`，注意，这里是一个元组，因此一个元素后面必须要跟逗号，不然会被默认为一个元素，肯定会报错的。

其实这里`STATIC_URL`只不过是一个前缀而已，当调用static下的css的时候那么它会去找`STATICFILES_DIRS`中的路径，你这个路径是啥都行，只要添加到对应的路径下，每当访问static前缀的时候就会去找这个路径。

### 1.4、Django创建程序步骤

- 创建project，pycharm还是terminal都可以。

- 配置：

  - 模板路径：给render用
  - 静态文件路径：css，js，img

- 额外配置：

  ```python
  # 暂时先将MIDDLEWARE中的csrf注释掉。
  MIDDLEWARE = [
      'django.middleware.security.SecurityMiddleware',
      'django.contrib.sessions.middleware.SessionMiddleware',
      'django.middleware.common.CommonMiddleware',
      # 'django.middleware.csrf.CsrfViewMiddleware',
      'django.contrib.auth.middleware.AuthenticationMiddleware',
      'django.contrib.messages.middleware.MessageMiddleware',
      'django.middleware.clickjacking.XFrameOptionsMiddleware',
  ]
  ```

### 1.5、用户登录示例

模板界面：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="/static/css/style.css">
    <title>login_test</title>
</head>
<body>
    <form method="POST" action="">
        <h1>登录测试</h1>
        <!--这里我们用name进行pist提交，那么在服务端其实会收到一个QueryDict字典
			这里的username和password就是key值，我们输入的内容就是value值-->
        <input type="text" name="username">
        <input type="password" name="password">
        <input type="submit">
      	{{ msg }}
    </form>
</body>
</html>
```

url路由配置：

```python
from django.contrib import admin
from django.urls import path
# 引入redirect用户重定向使用，其中redirect跳转第三方网站域名要写全，但是如果要跳转自己地的网站的话我们可以直接写后缀比如 "redirect('/index/')"，它会自动去找urlpatterns进行匹配，Django会为你自动拼接.
from django.shortcuts import HttpResponse, render, redirect


def login(request):
    """
    处理用户请求，并返回内容
    :param request:
    :return:
    """
    # 通过request.method来获取用户请求的方式
    if request.method == 'GET':
        return render(request, 'login.html')
    else:
        # 用户post提交的数据（请求体的内容），那么request.GET就是get请求的数据。获取到的
        # 是一个字典内容，比如xx/?p=123，结果就为{'p': '123'}
        # 这里其实可以使用request.POST['username']这样去取数据，但是如果说name不是这个
        # 那么就会报错，因此我们可以使用get方法，如果name不是这个的话不会报错，会返回空
        user = request.POST.get('username')
        password = request.POST.get('password')
        if user == 'root' and password == '123123':
            print('登录成功')
            return redirect('http://bbs.dcgamer.top')
        else:
            print('====验证失败====')
            # render可以接受的第三个参数是一个字典，Django的模板引擎会根据你传递的
            # 内容替换对应的特殊字符，比如下面的字典的key是msg，它就会替换模板中的
            # {{ msg }}字段的值。
            return render(request, 'login.html', {'msg': '用户名或密码错误'})


urlpatterns = [
    # path('admin/', admin.site.urls),
    path('login/', login),
]
```

### 1.6、小结

- 发get请求的时候，只有request.GET有值

- 发post请求的时候，request.GET和request.POST是都可能有值的，因为你在发POST请求的时候，你请求的内容是可以带参数的。比如：

  ```html
  <form method='POST' action="/login/?p=123"></form>
  ```

