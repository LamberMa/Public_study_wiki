# Django中的模板

> 为什么会有模板技术，即使没有模板我们也可以以字符串的形式将html代码嵌入到Python代码中去，但是考虑一下，这个明显是一个很麻烦的操作
>
> - 当改动的时候需要对Python代码进行改动
> - Python和HTML前端是两种技术领域，应该有专业的技术去完成。耦合在一起明显加大了维护的难度。各司其职才是效率更高的体现。
>
> 也是因为如此，存在Django模版的技术，如下讲对Django的模板做简单的使用说明。

## 1、特殊标记语言

假如说我们在后台给前台render一段模板内容，第一个参数是request，第二个参数就是模板文件，第三个就是一个字典它可以结合模板语言去替换模板中的特殊标记的字符串。

```python
render(request, 'login.html', {
    'name': 'lamber',
    # 在模板中取的时候用{{ users.1 }}这种形式，1表示索引值
    'users': ['user1','user2'],
    # 取的时候直接{{ user_dict.k1 }}
    'user_dict': {'k1':'v1','k2':'v2'},
    'user_list_dict': [
        {'id':1, 'name':'alex', 'email':'22222@q.com'},
        {'id':2, 'name':'alex2', 'email':'22222@q.com'},
    ]
})
```

那么现在我想要在前端把users这个key中的内容取出来应该使用什么方式去获取呢？

```python
# 在模板中使用for循环去取用users这个key的数据
{% for item in users %}
	<h3>{{ item }}</h3>
{% endfor %}
这样的话在前段模板中就会显示两个html标签，分别为：
<h3>user1</h3>
<h3>user2</h3>

# 或者嵌套进别的html标签中去写也是可以的。
<ul>
	{% for item in users %}
    <li>{{ item }}</li>
    {% endfor %}
</ul>

# 针对这个列表形式的我们还可以使用索引去取数据，只不过取的时候形式和python的不太一样
# 索引也是从0开始的
<h1>{{ users.0 }}</h1>
<h2>{{ users.1 }}</h2>

# 直接调用字典里的内容。
{% for i in userinfo.items %} # userinfo.keys,userinfo.values
print something
{% endfor %}
```

上文中的这个item是一个变量，通过for循环去users中取出来的一个临时变量，想要使用变量的话可以使用双花括号的形式去调用，比如`{{ item }}`。值得注意的这个特殊标记有开始有结束，比如for循环，那么最后要有一个endfor标签作为结束，如果是if标签，要有一个endif作为结束。

```python
# 循环user_list_dict，直接使用"."去取嵌套字典中的每一个数据，这个也python也不一样。
<table>
	{% for row in user_list_dict %}
    <tr>
    	<td>{{ row.id }}</td>
        <td>{{ row.name }}</td>
        <td>{{ row.email }}</td>
    </tr>
    {% endfor %}
</table>
```

我们在模板中还可以进行if判断

```python
{% if status %}
    <h1>{{ users.0 }}</h1>
{% else %}
    <h1>{{ users.1 }}</h1>
{% endif %}
```

**关于Request**

其实我们在render一个界面的时候，会隐式的去传递一个request供我们去调用部分信息。比如我有一个界面我要登录，那么登录以后显示“您好，xxx”，这个xxx其实是保存在session中的一个字段，我们就可以这样去取用。

```python
def login(request):
    if request.method == 'GET':
        return render(request, 'login.html')
    else:
        username = request.POST.get('username')
        password = request.POST.get('password')
        if username == 'lamber' and password == '12345':
            # 走到这里代表认证成功
            request.session['username'] = username
            request.session['password'] = password
            return redirect('/admin/main/')
        else:
            return render(request, 'login.html', {
                'msg': '账号或者密码错误',
            })
```

模板对应的部分：

```html
<div id="header">
    欢迎您：{{ request.session.username }}
</div>
```

## 2、母版

其实就是把通用的部分写一遍就够了，其他地方在调用的时候直接继承一下就行了。比如我们说的后台里面有顶部导航栏，侧边栏，底部栏，但是内容区域的内容可能是不同的页面经常变化的，我们并不用每一次都把侧边栏，导航栏，底部栏重写一遍。

**注意：一个子板只能有一个母版**

```django
# 我们设置一个通用页面，然后把变化的部分以一个block来封闭起来。
{% block xx %}
	……………………各种变化的内容
{% endblock %}
```

需要调用的时候直接使用

```django
# 先继承，在渲染的时候会先把公共部分extends过来，然后直接放到一起进行渲染
{% extends 'layout.html' %}

{% block xx %}
# 自己写模块，然后这个叫xx的block会集成到你的模板指定的位置。这个block也可以多加几个
{% endblock %}
```

一般来讲会写三个block

```html
# 在head部分
写一个block叫css

# 内容部分
写一个content是用来替换变化的内容的。

# JS部分
写一个block叫js模块，用来独立的调用某个页面的JS
```

目的是为了针对不同的部分做不同的css和js的区分，因为并不是一个css适用于所有的页面。母版里面应该放的内容是所有页面都要用的东西。

## 3、模板中的函数

在模板里面写上一个函数名是自动执行的，但是这个函数不能加参数，要加参数需要其他的操作去执行的。

```jinja2
# 这个upper实质上是一个带装饰器的函数，这个是由模板提供的函数
{{ name|upper }}
```

这个当然是可以由我们自己来定义的，其中一种就叫simple_filter，另外一种叫做simple_tag。

**自定义simple_filter**

1. 在app中创建一个叫templatetags的模块（Python Package），名字必须是这个。

2. 随便创建一个py文件，名字叫xx.py，自定义函数就放在这里。

3. 写自定义函数

   ```python
   from django import template
   register = template.Library()  # 这个是Django固定好的格式，必须这么写

   @register.filter      # 只有加上这个装饰器才能在模板中使用
   def my_upper(value):
       return value.upper()
   ```

4. 在模板中使用

   ```html
   # 在页面顶部导入咱们自定义的内容
   {% load xx %}
   ```

   模板中调用

   ```python
   {{ name|my_upper }}
   ```

5. settings中需要注册这个app才能够使用，不然无法使用。

**如何给模板函数传递参数？**

如果要给函数给传递多个参数的话要在函数后面用冒号接参数：

```python
{{ name|my_upper:"666" }}
最多只支持两个参数，函数前面一个，后面一个，而且冒号不能有空格。不然会报错。
```

如果装饰器是simple_tag的话使用方法还不一样：

```python
@register.simple_tag      
def my_upper(value):
    return value.upper()

# 调用，这个是没有参数限制的。
{% my_upper "ALEX" "x" "SB" "V" %}
```

filter可以作为if的条件，但是simple_tag是无法作为if的条件语句

```python
{% if name|my_bool %}
   <h3>hahah</h3>
{% else %}
   <h3>hehehehehe</h3>
{% endif %}
```

反向生成URL就是使用的simple_tag的方法，因为参数无限制。一般情况下，filter用不到，所以作为了解就可以了。

## 4、模板之Include

> 模板之include，include单独的小组件。

```python
{% include 'pub.html' %}
```

小组件和母版功能类似，但是又不一致。母版是用来继承的，而include是用来导入小组件的。同时小组件也是支持书写模板语言的。

include会找到小组件把小组件的内容读取过来然后替换掉。因此这些模板语言也是支持的。比如我写了一个小模块，我在很多页面都用到了，那么我就可以直接把这个小页面或者说小模块单独拿过来在页面中引用。

## 5、模板的简单实现原理：

1. 创建一个 Template 对象，将模板代码放入一个 string 中作为参数。
2. 调用模板(template)对象的 render() 方法，把一组变量作为上下文(context)传入。这么做将会把模板(template)展开，将所有变量(variables)和标签(tags)都赋予相应的值，并作为 string 返回。

```python
# 终端切换到项目目录下，在终端运行如下命令：
python3 manage.py shell
# 这个不要在终端直接引入，要通过manage.py，不然配置文件等相关内容不会被加载直接报错。
# 或者直接在.bash_profile中手动添加 DJANGO_SETTINGS_MODULE这个环境变量，设为mysite.settings，前提是这个mysite的路径在环境变量里。
>>> from django import template
# 通过实例化创建一个Template的对象，构造函数接收一个参数，初始化模板代码
>>> t = template.Template('My name is {{name}}')
>>> c = template.Context({'name':'lamber'})
>>> print(t.render(c))
My name is lamber
```