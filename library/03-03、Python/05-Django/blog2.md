# Blog2

> 环境：
>
> - python3.6
> - Django：1.10.6

```
# 一些没整理的文章
http://www.pythonzh.cn/category/newbie-qa/
http://www.cnblogs.com/wupeiqi/articles/5812291.html
https://github.com/jhao104/django-blog
https://www.cnblogs.com/WeyneChen/p/6670592.html
https://www.zhihu.com/question/24368769
https://github.com/hinesboy/mavonEditor
https://www.jianshu.com/p/04376d0c9ff1
http://www.cnblogs.com/wupeiqi/articles/5703697.html
http://www.cnblogs.com/wupeiqi/articles/6144178.html
http://www.cnblogs.com/haiyan123/p/8387770.html#lable13
https://www.cluas.me/blog/10/
http://blog.csdn.net/secretx/article/details/73498148
```



### 创建虚拟环境

```shell
mkvirtualenv blog2 -p /usr/local/bin/python3.6
cdvirtualenv
```

安装对应版本的django

```shell
pip install django==1.10.6
```

安装好了可以验证一下：

```python
(blog2) ➜  blog2 > python
Python 3.6.4 (default, Dec 19 2017, 15:24:39) 
[GCC 4.2.1 Compatible Apple LLVM 8.0.0 (clang-800.0.42.1)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> import django
>>> django.VERSION
(1, 10, 6, 'final', 0)
```

创建Django项目：

```python
(blog2) ➜  blog2 > pwd 
/Users/lamber/python/blog2
(blog2) ➜  blog2 > django-admin startproject blog2
(blog2) ➜  blog2 > ll
total 8
drwxr-xr-x  24 lamber  staff   768B  3  1 17:22 bin
drwxr-xr-x   4 lamber  staff   128B  3  1 17:25 blog2
drwxr-xr-x   3 lamber  staff    96B  3  1 17:18 include
drwxr-xr-x   3 lamber  staff    96B  3  1 17:18 lib
-rw-r--r--   1 lamber  staff    60B  3  1 17:18 pip-selfcheck.json
```

项目目录内部文件结构介绍：

```shell
(blog2) ➜  blog2 > tree blog2 
blog2
├── blog2
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── manage.py

1 directory, 5 files
```

其实到这里我们就可以运行试试了。使用项目目录下的`manage.py`然后运行访问即可：

```python
python manage.py runserver
```

创建Django项目中的应用app：

```python
python manage.py startapp blog

(blog2) ➜  blog > ll
total 40
-rw-r--r--  1 lamber  staff     0B  3  2 11:06 __init__.py
-rw-r--r--  1 lamber  staff    63B  3  2 11:06 admin.py
-rw-r--r--  1 lamber  staff    83B  3  2 11:06 apps.py
drwxr-xr-x  3 lamber  staff    96B  3  2 11:06 migrations
-rw-r--r--  1 lamber  staff    57B  3  2 11:06 models.py
-rw-r--r--  1 lamber  staff    60B  3  2 11:06 tests.py
-rw-r--r--  1 lamber  staff    63B  3  2 11:06 views.py
```

生成如上的一堆文件，功能就不赘述了。接下来整配置文件

```python
# 注册app
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'blog'
]
```

## 设置数据库模型

```python
from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Category(models.Model):
    """文章分类"""
    name = models.CharField(max_length=100)


class Tag(models.Model):
    """标签分类"""
    name = models.CharField(max_length=100)


class Post(models.Model):
    """
    文章表：标题、正文、创建时间、修改时间、摘要（允许空值）
    标签是多对多的关系，允许空值
    """

    title = models.CharField(max_length=70)
    body = models.TextField()
    created_time = models.DateTimeField()
    modified_time = models.DateTimeField()
    excerpt = models.CharField(max_length=200, blank=True)
    category = models.ForeignKey(Category)
    tags = models.ManyToManyField(Tag, blank=True)
    # django.contrib.auth是django内置的应用，专门用于处理网站用户的注册登录等流程
    # User是Django为我们写好的用户模型，我们这里通过Foreign Key把文章和User关联起来
    # 因为我们规定一篇文章只能有一个作者，而一个作者可能会写多篇文章，因此这是一个一对多的关系联系。
    author = models.ForeignKey(User)
```

- [Django ForeignKey 简介](https://docs.djangoproject.com/en/1.10/topics/db/models/#relationships)
- [Django ForeignKey 详细示例](https://docs.djangoproject.com/en/1.10/topics/db/examples/many_to_one/)
- [Django ManyToManyField 简介](https://docs.djangoproject.com/en/1.10/topics/db/models/#many-to-many-relationships)
- [Django ManyToManyField 详细示例](https://docs.djangoproject.com/en/1.10/topics/db/examples/many_to_many/)

**关于Django.contrib**



## 生成数据表

```python
python manage.py makemigrations
python manage.py migrate
```

查看Django到底为我们做成了什么：

```mysql
(blog2) ➜  blog2 > python manage.py sqlmigrate blog 0001
BEGIN;
--
-- Create model Category
--
CREATE TABLE "blog_category" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "name" varchar(100) NOT NULL);
--
-- Create model Post
--
CREATE TABLE "blog_post" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "title" varchar(70) NOT NULL, "body" text NOT NULL, "created_time" datetime NOT NULL, "modified_time" datetime NOT NULL, "excerpt" varchar(200) NOT NULL, "author_id" integer NOT NULL REFERENCES "auth_user" ("id"), "category_id" integer NOT NULL REFERENCES "blog_category" ("id"));
--
-- Create model Tag
--
CREATE TABLE "blog_tag" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "name" varchar(100) NOT NULL);
--
-- Add field tags to post
--
CREATE TABLE "blog_post_tags" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "post_id" integer NOT NULL REFERENCES "blog_post" ("id"), "tag_id" integer NOT NULL REFERENCES "blog_tag" ("id"));
CREATE INDEX "blog_post_4f331e2f" ON "blog_post" ("author_id");
CREATE INDEX "blog_post_b583a629" ON "blog_post" ("category_id");
CREATE UNIQUE INDEX "blog_post_tags_post_id_4925ec37_uniq" ON "blog_post_tags" ("post_id", "tag_id");
CREATE INDEX "blog_post_tags_f3aa1999" ON "blog_post_tags" ("post_id");
CREATE INDEX "blog_post_tags_76f094bc" ON "blog_post_tags" ("tag_id");
COMMIT;
```

创建用户：

```shell
python manage.py createsuperuser
```

数据库取数据的时候几个注意的点：

- get方法：返回一条记录数据，如有多条记录或者没有记录，`get`方法均会抛出相应异常。

## 设置模板目录





关于静态文件配置的目录：

https://docs.djangoproject.com/en/1.10/howto/static-files/





## 使用Django Admin发布文章

首先使用Django Admin新建一个用户

```python
python manage.py createsuperuser
```

在Admin注册模型，找到app目录下的admin.py注册：

```python
from django.contrib import admin
from .models import Post, Category, Tag

# Register your models here.
admin.site.register(Post)
admin.site.register(Category)
admin.site.register(Tag)
```

然后访问http://127.0.0.1:8000/admin，登录成功以后显示如下主界面

![](http://omk1n04i8.bkt.clouddn.com/18-3-2/92412773.jpg)

```python
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_time', 'modified_time', 'category', 'author']

# 把新增的 PostAdmin 也注册进来
admin.site.register(Post, PostAdmin)
admin.site.register(Category)
admin.site.register(Tag)
```

## Blog文章详情页





## 支持Markdown和语法高亮

安装第三方库：

```python
pip install markdown
```

在页面视图中渲染markdown

```python
blog/views.py

import markdown
from django.shortcuts import render, get_object_or_404
from .models import Post

def detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    # 记得在顶部引入 markdown 模块
    post.body = markdown.markdown(post.body,
                                  extensions=[
                                     'markdown.extensions.extra',
                                     'markdown.extensions.codehilite',
                                     'markdown.extensions.toc',
                                  ])
    return render(request, 'blog/detail.html', context={'post': post})
```

这样我们在模板中展示 {{ post.body }} 的时候，就不再是原始的 Markdown 文本了，而是渲染过后的 HTML 文本。注意这里我们给 `markdown` 渲染函数传递了额外的参数 `extensions`，它是对 Markdown 语法的拓展，这里我们使用了三个拓展，分别是 extra、codehilite、toc。extra 本身包含很多拓展，而 codehilite 是语法高亮拓展，这为我们后面的实现代码高亮功能提供基础，而 toc 则允许我们自动生成目录（在以后会介绍）。

我们在发布的文章详情页没有看到预期的效果，而是类似于一堆乱码一样的 HTML 标签，这些标签本应该在浏览器显示它本身的格式，但是 Django 出于安全方面的考虑，任何的 HTML 代码在 Django 的模板中都会被转义（即显示原始的 HTML 代码，而不是经浏览器渲染后的格式）。为了解除转义，只需在模板标签使用 `safe` 过滤器即可，告诉 Django，这段文本是安全的，你什么也不用做。在模板中找到展示博客文章主体的 {{ post.body }} 部分，为其加上 safe 过滤器，{{ post.body|safe }}，大功告成，这下看到预期效果了。

safe 是 Django 模板系统中的过滤器（Filter），可以简单地把它看成是一种函数，其作用是作用于模板变量，将模板变量的值变为经过滤器处理过后的值。例如这里 {{ post.body|safe }}，本来 {{ post.body }} 经模板系统渲染后应该显示 body 本身的值，但是在后面加上 safe 过滤器后，渲染的值不再是body 本身的值，而是由 safe 函数处理后返回的值。过滤器的用法是在模板变量后加一个 | 管道符号，再加上过滤器的名称。可以连续使用多个过滤器，例如 {{ var|filter1|filter2 }}。

## 代码高亮

程序员写博客免不了要插入一些代码，Markdown 的语法使我们容易地书写代码块，但是目前来说，显示的代码块里的代码没有任何颜色，很不美观，也难以阅读，要是能够像我们的编辑器里一样让代码高亮就好了。虽然我们在渲染时使用了 codehilite 拓展，但这只是实现代码高亮的第一步，还需要简单的几步才能达到我们的最终目的。

安装pygments

```python
pip install Pygments
```

搞定了，虽然我们除了安装了一下 Pygments 什么也没做，但 Markdown 使用 Pygments 在后台为我们做了很多事。如果你打开博客详情页，找到一段代码段，在浏览器查看这段代码段的 HTML 源代码，可以发现 Pygments 的工作原理是把代码切分成一个个单词，然后为这些单词添加 css 样式，不同的词应用不同的样式，这样就实现了代码颜色的区分，即高亮了语法。为此，还差最后一步，引入一个样式文件来给这些被添加了样式的单词定义颜色。

```python
# 在base.html中添加一行
<link rel="stylesheet" href="/static/css/highlights/github.css">
```

记住修改完了以后重启一下应用，否则高亮是不会生效的。务必要安装pygments模块，

```
评论也是支持markdown的，不过这次是用户输入的，不能保证安全，所以还要使用 bleach 清理不允许的标签，像我刚提交的<script></body>如果不清理直接前端 body|safe 的话，页面会乱掉。博主这个是处理的了。
```

### Django自定义标签

> 遵循Django的规范使用自定义标签

新建一个名为templatetags的Python Package，然后在目录下新建一个blog_tags.py。这个文件存放自定义的模板标签代码：

```shell
(blog2) ➜  blog2 > tree . -L 2
.
├── blog
│   ├── __init__.py
│   ├── __pycache__
│   ├── admin.py
│   ├── apps.py
│   ├── migrations
│   ├── models.py
│   ├── templatetags
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── blog2
│   ├── __init__.py
│   ├── __pycache__
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── db.sqlite3
├── manage.py
├── static
│   ├── css
│   └── js
└── template
    ├── __init__.py
    ├── base.html
    └── blog
```

遇到一个错误，因为没有注册新添加的文件夹：

```python
TemplateSyntaxError at /
'blog_tags' is not a registered tag library. Must be one of:

在配置文件中的INSTALLED_APP中注册一下这个就行了。
```



根据日期进行分类的部分：

```python
这里 {% url %} 这个模板标签的作用是解析视图函数 blog:archives 对应的 URL 模式，并把 URL 模式中的年和月替换成 date.year，date.month 的值。例如 blog:archives 表示 blog 应用下的 archives 函数，这个函数对应的 URL 模式为 ^archives/(?P<year>[0-9]{4})/(?P<month>[0-9]{1,2})/$，假设 date.year=2017，date.month=5，那么 {% url 'blog:archives' date.year date.month %} 模板标签返回的值为/archives/2017/5/。

为什么要使用 {% url %} 模板标签呢？事实上，我们把超链接的 href 属性设置为 /archives/{{ date.year }}/{{ date.month }}/ 同样可以达到目的，但是这种写法是硬编码的。虽然现在 blog:archives 视图函数对应的 URL 模式是这种形式，但是如果哪天这个模式改变了呢？如果使用了硬编码的写法，那你需要把每一处 /archives/{{ date.year }}/{{ date.month }}/ 修改为新的模式。但如果使用了 {% url %} 模板标签，则不用做任何修改。
    
需要安装pytz模块
pip install pytz
```

## 评论模块

