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

