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

## 2、学员管理系统初步

### 2.1、单表操作（增删改查）

表结构设计

```mysql
# 班级表
id   title
1    全栈4期
2    全栈5期

# 学生表
id   name    班级id(FK)
1    user1   1

# 老师表(老师和班级是多对多的关系)
id   name
1    林海峰
2    林狗
3    袁日天

# 老师和班级关系表
id   老师id   班级id
1       1       1
2       1       2
3       2       2

########表结构设计##########
create database django1;

create table class(
  id int unsigned not null primary key auto_increment,
  title varchar(255) not null
) engine=innodb charset=utf8;

create table student(
  id int unsigned not null primary key auto_increment,
  name varchar(255) not null,
  class_id int unsigned not null,
  constraint `fk_class_id` foreign key (`class_id`) references class(`id`)
) engine=innodb charset=utf8;

create table teacher(
  id int unsigned not null primary key auto_increment,
  name varchar(255) not null
) engine=innodb charset=utf8;

create table teacher2class(
  id int unsigned not null primary key auto_increment,
  teacher_id int unsigned not null,
  class_id int unsigned not null,
  constraint `fk_teacher_id` foreign key (`teacher_id`) references teacher(`id`),
  constraint `fk_cls_id` foreign key (`class_id`) references class(`id`)
) engine=innodb charset=utf8;
```

### 2.2、一对多操作（增删改查）





#### 基于ajax创建班级

**模态对话框**（一般和ajax进行绑定）

主要用于以下（比如登录）：

> - 少量的输入框
> - 数据少
>
> 相比较新URL的方式，新URL可以承载更多的操作已经更大的数据量。

默认submit提交的时候会导致页面的刷新，这个属于form表单提交时的一个特性。这个是不受后台返回内容所限制的，不管你后台是return一个render重新渲染还是return一个httpresponse亦或是return一个redirect都不会影响。



```javascript
引入jquery：
$.ajax({
  url: '要提交的地址'，
  type: 'POST', // post或者是get这里指的是提交的方式
  data: {'k1':'v1', 'k2':'v2' ……}, // 这里指的是要提交的数据
  success: function(data){
      //当服务器处理完成并返回数据后会自动调用的一个函数。
      //data表示返回的数据
}
 
})
```

使用Ajax删除班级，使用Ajax编辑班级。





```javascript
# 当页面框架加载完成后执行
$(function(){
  balabala……
})

# jquery阻止默认事件的发生
jquery绑定事件直接在函数中返回一个false就可以阻止事件的默认发生了，比如：
$(function(){
  $('#testmodel').click(function(){
    alert(123);
    return false;
  });
});

```

模板的额外使用：

```django
{% if item.id in class_id %}

{% else %}

{% endif %}
```



### 2.3、多对多操作（增删改查）

多对多的设计：







=============

响应头中如果有location的话，浏览器会直接再次发起请求。

当a标签有默认跳转功能和其他事件比如click事件的时候会优先发生其他的附加事件，最后再执行跳转事件，如果想让默认事件不执行，可以让附加事件return一个函数，函数再renturn一个false默认事件就不会执行了，如果想让这个事件执行的话return true就可以了。



placeholder属性

select标签里的multiple属性，可以实现select标签的多选，size设置显示的范围大小。

pymysql中的lastrowid，在提交的时候还要把自增id拿到，lastrow_id要在commit以后才能拿到。

取前端返回的多个数据可以使用

```django
request.POST.getlist('select标签的name')
```



数据库类操作：

```python
class DB():
    
    
    def __init__(self):
        # 从配置文件把配置读取出来
        self.connect()
    
    def connect(self):
        self.conn = pymysql.connect(xxxx)
        self.cursor = self.conn.cursor(XXX)
        
    def get_list(self, sql, args):
        self.cusor.excude(sql,args)
        result = self.cursor.fethall()
        return result
    
    def get_one(self, sql, args):
        self.cursor.excute(sql, args)
        result = self.cursor.fetchone()
        return result
    
    def modify(self, sql, args):
        # 这是链接一次提交多次，如果多次操作的每一次提交也是耗时
        self.cursor.excute(sql, args)
        self.conn.commit()
        
    def create(self, sql, args):
        self.cursor.excute(sql, args)
        self.conn.commit()
        return self.cursor.lastrowid
    
    def multuple_modify(self, sql, args):
        # 链接一次，提交一次，args是多个元组，我们要去构造。
        self.cursor.excutemany(sql, args)
        self.conn.commit()
        
    def close(self):
        self.conn.close()
        self.cursor.close()
        
        

```



表格的左右移动



新URL方式



通过ajax获取select列表的option所有的选项，在点击弹出框的时候通过ajax去服务器去取值。

```javascript
# 加载框显示的时机：用户一点弹出框增加的时候，先把透明底层和这个加载层显示出来，最后等数据加载完成了，也就是加载数据的这一块代码结束了，然后再把这个loading遮罩层给干掉，加上hide的class

$.each(arg, function(i, row){
  var tag = document.createElement('option')
  tag.innerHTML = row.title;
  tag.setAttribute('value', row.id);
  $('#classIds').append(tag);
})
// 加载框，加载完了以后先把loading的显示层隐藏掉，添加的框显示出来
$('#loading').addClass('hide');
$('#addModel').removeClass('hide');
```

注意：

```javascript
# 如果ajax里面传递的json有列表，如果要服务端显示为列表要加上traditional:true
# 因为ajax会给你做特殊处理，如果加上traditional就不会做特殊处理，返回的就是列表，只支持列表，并不支持字典。
$.ajax({
  url: '要提交的地址'，
  type: 'POST', // post或者是get这里指的是提交的方式
  data: {'k1':'v1', 'k2':'v2' ……}, // 这里指的是要提交的数据
  traditional: true,
  success: function(data){
      //当服务器处理完成并返回数据后会自动调用的一个函数。
      //data表示返回的数据
}
```

如何判断某个元素是不是在js的某个列表中

```javascript
v = [11,22,33]
v.indexOf(22)
# 如果有的话返回索引，如果没有的话返回-1
```



HTTP请求的生命周期

请求头→提取URL→路由关系匹配→函数（模板+数据渲染）→返回用户（响应头+响应体）

模版的渲染工作发生在哪一端？

在服务端，浏览器拿到的一定是渲染完毕后的结果。

默认从a标签跳转过去的都是get请求。



## 初识BootStrap & fontawesome(图标库)

使用bootstrap3

下载用于生产环境的

一个bootstrap.css，另外一个就是bootstrap.min.css，第二个是第一个的压缩版，但是功能是一模一样的。这样在调试的时候可以看，但是生产的时候要用压缩版。

fonts是字体文件，特殊的图标文件也在里面。

在static下新建一个plugin目录把这个放到里面去

如何引用：

```html
<link ref='stylesheet' href='/static/plugins/bootstrap……'>
```

组件里有图标

BootStrap：一个包含CSS和JS的样式库

- 样式
- 响应式：会根据用户的访问环境显示出不同的结构，比如手机端和pc端访问

```css
/*当小于等于700px的宽度的时候会执行@media里面的内容*/
@media (max-width:700px){
  .pg_header{
   	style1;
    style2;
  }
}

这样的可以添加多个形成一个多层改变的过程
```

组件：导航条

响应式的代表一类是导航条，

bootstrap总共给你把页面分成了12格子（bootstrap的栅格系统）

col-md col-lg col-xs col-sm



全局样式里有一个：目的是是否允许移动设备进行缩放

在 Bootstrap 2 中，我们对框架中的某些关键部分增加了对移动设备友好的样式。而在 Bootstrap 3 中，我们重写了整个框架，使其一开始就是对移动设备友好的。这次不是简单的增加一些可选的针对移动设备的样式，而是直接融合进了框架的内核中。也就是说，**Bootstrap 是移动设备优先的**。针对移动设备的样式融合进了框架的每个角落，而不是增加一个额外的文件。

为了确保适当的绘制和触屏缩放，需要在 `<head>` 之中**添加 viewport 元数据标签**。

```
<meta name="viewport" content="width=device-width, initial-scale=1">
```

在移动设备浏览器上，通过为视口（viewport）设置 meta 属性为 `user-scalable=no` 可以禁用其缩放（zooming）功能。这样禁用缩放功能后，用户只能滚动屏幕，就能让你的网站看上去更像原生应用的感觉。注意，这种方式我们并不推荐所有网站使用，还是要看你自己的情况而定！

```
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```





关于后台管理的布局，一般标准的就是那种布局，一般不去做响应式，不过也可以做响应式。但是使用bootstrap做响应式定制性不高。

创建用户表，使用用户登录

i标签

hover是可以实现级联的：

```css
.pg-header .avatar:hover .user-infor{
  xxxxx
}
```



position:absolute一会出现高度塌陷



路径导航：



Django的程序目录介绍

```python
# 在对应的项目目录通过manage.py直接创建小的小项目，简单来说一个平台需要很多功能，但是功能之间又没有太大的联系。
python manage.py startapp app01


# 通过pycharm也是可以创建的
在创建project的时候，在more settings下直接写一个application name就可以在创建project的同时会创建一个app，但是我们也可以在pycharm的terminal终端通过命令去创建，创建的目录里面其实会自带已给view

一般业务代码放在对应的app文件夹里；

app中的migrations是和数据库相关的。
admin是内部存在的后台管理，xxxx/admin，默认的账号和密码是：
apps是当前app的配置文件
models是django的orm的类，和数据库进行沟通的
tests是进行单元测试的。
views就是和之前一样的页面的，views不一定就是一个单文件，有时候逻辑特别多的时候写到一个py文件不是很好，我们可以把这个views.py删掉换成一个views文件夹，然后里面针对业务分成多个py文件。
```

## 路由系统

### 动态路由

url->函数

- 一一对应：/login/ → def login
- /add-user/(+d)



SEO会把get传参的内容页面的权重变低，因为爬虫会认为get传参的是经常变的，因此不经常变动的优先级会较高一些。

```python
# 正则表达式
http://127.0.0.1/edit/ffff
url(r'^edit/(\w+)', view.edit),
url(r'^edit/(\w+)/(\w+)', view.edit), ## 函数要接收两个参数，按照顺序接收
# 这个并不是什么html文件，只是一个正则模版，这个叫伪静态
url(r'^edit/(\w+).html$', view.edit),
def edit(requst, a1):
    print(a1)
    return xxxx

url(r'^edit/(?P<a1>\w+)/(?P<a2>\w+)/')
这样就可以按照对应的标签去匹配了，a1就是第一个，a2就是第二个。这个可以不按照顺序去接收。这个就是按照参数名称进行存放的方式。

如果加名字的和不加名字的共存那是如何接收的？
答：这样就会直接报错，这个函数她会不知道如何接收，因此用法要统一，要不就关键字要不就位置的。

函数在接收参数的时候可以使用*args和**kwargs

推荐使用终止符号
url(r'^edit$'， view.edit)
```

什么是伪静态

```

```

路由分发

```python
from django.conf.urls import include

# 先从主的转到对应的app下的url路由关系，然后根据引入的urls再进行路由匹配
url(r'^app01', include('app01.urls'))
# 对应的访问结果应该就是这样的，路由分发只匹配到app01，后面的内容不会进行匹配
http://128.0.0.1/app01/xxx/xxx.html

转到具体的urls就不会看从app01开始往前的内容了。

经过如上的操作，路由被分成了两级，project的入口成为了路由分发器

啥没写可以跳转到一个默认的页面，比如跳转到主页
url(r'^', views.index)
```

路由系统之别名反向生成URL

```python
from django.urls import reverse
url(r'^edit/', view.edit, name='n1'),  # 起一个别名
# 可用于日后根据别名反生成url
v = reverse('n1')   # '/edit/'

# 指定反向生成的内容
url(r'^edit/(\d+)', view.edit, name='n1')
v = reverse('n1', args=(1,))  # '/edit/1/'

# 指定反向生成的内容(dict)
url(r'^edit/(?P<a1>\d+)', view.edit, name='n1')
v = reverse('n1', kwargs={'a1':'111'}  # '/edit/111/'
            
# 有了这个别名以后，form表单的action以后就可以这样写了，也可以根据名称反生成url
<form method='POST' action='{% url "m1" %}'></form>
            
# 对应的跳转链接也可以通过反向链接实现，这是不使用python而是使用html模版循环的方法
{% for i in list %}
# 可以按照对应的值生成URL<a href="{% url 'n1' i.1,i.2,i.3…… %}">
# 结果： <a href='/edit/aaa/bbb/ccc/ddd'>
<a href="{% url 'n2' i %}">xxxx
{% endfor %}
            

# 在web中分全权限显示页面
每个人的权限不一样，保存的权限跳转链接也不一样。
            
假如说可以访问的url很长，那么在数据库也要存储很长，如果说有一个别名的话就可以使用别名存储到数据库就可以了。通过别名就可以找到相对的url了。这个别名只在django里面有，在其他的系统里并不存在。当然不使用别名，完全使用url也是可以的。在crm权限管理中会用到，稍后说。
```

## CBV & FBV（之前用的）

 CBV：

在视图函数匹配的时候，一个url可以对应一个函数，但是同时也可以对应一个类。

```python
# Login是一个类，其中as_view()是特殊的写法
url(r'^login.html$', views.Login.as_view())

# 这个类需要继承这个Views
# 看的是类里是不是getattr GET POST利用反射获取对应的方法
from django.views import View
class Login(View):
    
    def get(self, request):
        pass
    
    def post(self, request):
        pass
    
    def dispath(self, request, *args, **kwargs):
        # 可以对dispatch进行重写，先把父类的功能拿过来，先执行dispatch方法，然后dispatch去执行GET或者post方法，然后拿到返回值return才行
        # 我们可以在执行dispatch的时候对一些方法进行统一的调用，或者循环操作等等，类似一个装饰器。
        print('before')
        obj = super(Login, self).dispatch(self, request, *args, **kwargs)
        print('after')
        return obj
    
GET和POST方法执行之前还执行了一个dispatch方法，这个即使利用反射获取GET还是POST，可以在父类Views里查看
```

## Django的分页

### Django内置分页

```python
models.Userinfo.objects.all()[0:10]
models.Userinfo.objects.all()[11:20]

from django,core paginator import Paginator, Page
user_list = model.UserInfor.object.all()
paginator = Paginator(user_list, 10)
# 这个对象可以找到以下属性
# - per_page: 每页显示条目数量
# - count： 数据总个数
# - num_pages: 总页数
# - page_range： 总页数的索引范围，比如(1,10),(1,200)
# - page： page对象，可以指定当前显示第几页
posts = paginator.page(2)
这个posts有以下方法：

posts = paginator.page(current_page)
        # has_next              是否有下一页
        # next_page_number      下一页页码
        # has_previous          是否有上一页
        # previous_page_number  上一页页码
        # object_list           分页之后的数据列表
        # number                当前页
        # paginator             paginator对象
        
就把posts.object_list传递给前端的模板就可以了

上下页：
{% if posts.has_next %}
	<a href='index.html?page={{ posts.next_page_number}}'>下一页</a>
{% endif %}

如果传递的不是整形的花那么就默认让你访问第一页

from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

L = []
for i in range(999):
    L.append(i)

def index(request):
    current_page = request.GET.get('p')

    paginator = Paginator(L, 10)
    # per_page: 每页显示条目数量
    # count:    数据总个数
    # num_pages:总页数
    # page_range:总页数的索引范围，如: (1,10),(1,200)
    # page:     page对象
    try:
        posts = paginator.page(current_page)
        # has_next              是否有下一页
        # next_page_number      下一页页码
        # has_previous          是否有上一页
        # previous_page_number  上一页页码
        # object_list           分页之后的数据列表
        # number                当前页
        # paginator             paginator对象
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)
    return render(request, 'index.html', {'posts': posts})
```

### 自定义分页

```python
def custom(request):
    # 获取当前页面，表示用户当前想要访问的页码
    current_page = request.GET.get('page')
    # 设置一下每一页显示的数目
    per_page = 10
    current_page = int(current_page)
   
	# 设置起始位置
    start = (current_page-1) * per_page
    stop = current * per_page
   
	# 需要起始位置和结束位置
    user_list = models.UserInfo.objects.all()[start, stop]
    
    return render(request, 'custom.html', {'user_list': user_list})
```

把上面的逻辑封装到一个类

```python
class PageInfor(object):
    
    def __init__(self, current_page, all_count, per_page, show_page=11)
    	try:
    		self.current_page = int(current_page)
        except Exception as e:
            self.current_page = 1
        # 数据库总行数
        self.all_count = self.all_count
        self.per_page = per_page
        # divmod(101, 10) 箭头 (10, 1)
        pages, spare = divmod(self.all_count, self.per_page)
        if spare:
            pages += 1
        self.all_pager = pages
        self.show_page = show_page
        
    def start(self):
        return  (self.current_page-1) * self.per_page
    
    def stop(self):
        return self.current_page * self.per_page

	def pager(self):
        page_list = []
        # 当前页的每一边有几个
        half = int((self.show_page-1)/2)
        
        # 关于极限值做一下判断，如果说当前页已经小于等于两边的分页了 
        if self.current_page <= half:
            # 那么就把左侧的极限值抠出来，也即是begin
            begin = 1
            # 如果说我想要显示n页面，实际要大于n页，stop就是我要显示的。
            if self.all_pager > self.show_page:
            	stop = self.show_page + 1
            # 如果说实际不够我要显示的页数，那么就是有几页就显示几页了
            else:
                stop = self.all_pager +1
        # 没到极值的时候就按照之前的逻辑
        else:
        	begin = self.current_page - half
        	stop = self.current_page + half + 1
            
        for i in range(begin, stop):
            if i == self.page:
            	temp = "<a style='display=inline-block;padding:5px;background:red;' href='/custom.html?page=%s'>%s</a>" % (i, i)
            else:
                temp = "<a style='display=inline-block;padding:5px;' href='/custom.html?page=%s'>%s</a>" % (i, i)
            page_list.append(temp)
        return ''.join(page_list)
        
    

# 再次调用
def custom(request):
	# 获取一下总条目数
    all_count = models.UserInfo.objects.all().count()
    page_info = PageInfor(request.GET.get('page'), all_count, 10)
	# 需要起始位置和结束位置
    user_list = models.UserInfo.objects.all()[page_info.start, page_info.stop]
    
    return render(request, 'custom.html', {'user_list': user_list, 'page_info': page_info})

# 如果模板端需要使用的话需要，加上safe表示是安全的，而不是xss跨站脚本攻击。如果是安全的话就会渲染成标签，而不是字符串。
{{ page_info.pager|safe }}
```

上面写的还有一些啰嗦，针对这个问题再做一下优化：

```python
class PageInfor(object):
    
    def __init__(self, current_page, all_count, per_page, show_page=11)
    	try:
    		self.current_page = int(current_page)
        except Exception as e:
            self.current_page = 1
        # 数据库总行数
        self.all_count = self.all_count
        self.per_page = per_page
        # divmod(101, 10) 箭头 (10, 1)
        pages, spare = divmod(self.all_count, self.per_page)
        if spare:
            pages += 1
        self.all_pager = pages
        self.show_page = show_page
        
    def start(self):
        return  (self.current_page-1) * self.per_page
    
    def stop(self):
        return self.current_page * self.per_page

	def pager(self):
        page_list = []
        # 当前页的每一边有几个
        half = int((self.show_page-1)/2)
		# 如果数据库的总页数小于咱们设置的显示的页数那就看这点吧
        if self.all_pager < self.show_page:
            begin = 1
            stop =  self.all_pager + 1
        # 如果总页数大于11
        else:
            # 如果当前页小于等于5，那么就永远显示1~11页
            if current_page < half:
            	begin = 1
            	stop = self.show_pager + 1
            else:
                # 当前页大于5
                if (self.current_page + half) > self.all_pager: 
                    begin = self.all_pager - self.show_page + 1
                    stop = self.current_page + 1
                else:
        			begin = self.current_page - half
        			stop = self.current_page + half + 1
        
        if self.current_page < = 1 :
        	prev = "<a style='display=inline-block;padding:5px;' href='#'>上一页</a>"
        else:
        	prev = "<a style='display=inline-block;padding:5px;' href='/custom.html?page=%s'>上一页</a>" % self.current_page - 1
        
        page_list.append(prev)
        
        for i in range(begin, stop):
            if i == self.page:
            	temp = "<a style='display=inline-block;padding:5px;background:red;' href='/custom.html?page=%s'>%s</a>" % (i, i)
            else:
                temp = "<a style='display=inline-block;padding:5px;' href='/custom.html?page=%s'>%s</a>" % (i, i)
            page_list.append(temp)
        return ''.join(page_list)
    
    	if self.current_page >= self.all_pager:
            nxt = "<a style='display=inline-block;padding:5px;' href='#'>下一页</a>"
        else:
        	nxt = "<a style='display=inline-block;padding:5px;' href='/custom.html?page=%s'>下一页</a>" % self.current_page + 1
        page_list.append(nxt)
    

# 再次调用
def custom(request):
	# 获取一下总条目数
    all_count = models.UserInfo.objects.all().count()
    page_info = PageInfor(request.GET.get('page'), all_count, 10)
	# 需要起始位置和结束位置
    user_list = models.UserInfo.objects.all()[page_info.start, page_info.stop]
    
    return render(request, 'custom.html', {'user_list': user_list, 'page_info': page_info})

# 如果模板端需要使用的话需要，加上safe表示是安全的，而不是xss跨站脚本攻击。如果是安全的话就会渲染成标签，而不是字符串。
{{ page_info.pager|safe }}
```

针对如上的内容再次进行优化：

```python
def custom(request):
	# 获取一下总条目数
    all_count = models.UserInfo.objects.all().count()
    # 加一个html的前缀
    page_info = PageInfor(request.GET.get('page'), all_count, 10, '/custom.html' )
	# 需要起始位置和结束位置
    user_list = models.UserInfo.objects.all()[page_info.start, page_info.stop]
    
    return render(request, 'custom.html', {'user_list': user_list, 'page_info': page_info})

class PageInfor(object):
    # 接收位置参数调整一下
    def __init__(self, current_page, all_count, per_page, base_url, show_page=11)
    	try:
    		self.current_page = int(current_page)
        except Exception as e:
            self.current_page = 1
        # 数据库总行数
        self.all_count = self.all_count
        self.per_page = per_page
        # divmod(101, 10) 箭头 (10, 1)
        pages, spare = divmod(self.all_count, self.per_page)
        if spare:
            pages += 1
        self.all_pager = pages
        self.show_page = show_page
        # 要跳转的连接前缀
        self.base_url = base_url
        
    def start(self):
        return  (self.current_page-1) * self.per_page
    
    def stop(self):
        return self.current_page * self.per_page

	def pager(self):
        page_list = []
        # 当前页的每一边有几个
        half = int((self.show_page-1)/2)
		# 如果数据库的总页数小于咱们设置的显示的页数那就看这点吧
        if self.all_pager < self.show_page:
            begin = 1
            stop =  self.all_pager + 1
        # 如果总页数大于11
        else:
            # 如果当前页小于等于5，那么就永远显示1~11页
            if current_page < half:
            	begin = 1
            	stop = self.show_pager + 1
            else:
                # 当前页大于5
                if (self.current_page + half) > self.all_pager: 
                    begin = self.all_pager - self.show_page + 1
                    stop = self.current_page + 1
                else:
        			begin = self.current_page - half
        			stop = self.current_page + half + 1
        
        if self.current_page < = 1 :
        	prev = "<li><a href='#'>上一页</a></li>"
        else:
        	prev = "<li><a href='%s?page=%s'>上一页</a></li>" % (self.base_url, self.current_page - 1)
        
        page_list.append(prev)
        
        for i in range(begin, stop):
            if i == self.page:
            	temp = "<li class='active'><a href='%s?page=%s'>%s</a></li>" % (self.base_url, i, i)
            else:
                temp = "<li><a href='%s?page=%s'>%s</a></li>" % (self.base_url, i, i)
            page_list.append(temp)
        return ''.join(page_list)
    
    	if self.current_page >= self.all_pager:
            nxt = "<li><a href='#'>下一页</a></li>"
        else:
        	nxt = "<li><a href='%s?page=%s'>下一页</a></li>" % (self.base_url, self.current_page + 1)
        page_list.append(nxt)
```

结合bootstrap进行样式优化，然后就可以把类单独拿出来了

```python
创建一个目录叫utils，用来存放工具类。把这个类拿过来，放到这个模块里就行了。
```





## Django Admin

> Django Admin是由Django自身提供的一个管理后台

创建用户名密码：

```python
python manage.py createsuperuser
```



```python
# admin.py
from django.crontrib import admin
from app01 import models
admin.site.register(models.UserInfo)
```

这样操作就可以把我们自己创建的Userinfo注册到Django

就可以在Django admin中操作数据表了。

