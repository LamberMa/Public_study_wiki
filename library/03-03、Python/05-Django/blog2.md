# Blog2

> 环境：
>
> - python3.6
> - Django：1.10.6

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



