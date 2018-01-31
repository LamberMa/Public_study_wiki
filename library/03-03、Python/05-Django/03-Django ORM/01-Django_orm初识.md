# Django ORM

> - 数据库操作：事先创建好数据库
> - 数据表操作：创建表，修改表，删除表
> - Django Query_set的链式操作
>
> django的orm没办法直接连接数据库，需要pymysql等第三方工具去连接数据库。默认连接mysql的时候用的是 MysqlDB模块，py3中没有。因此需要修改默认连接mysql的方式。

## 1、配置Django连接数据库

Django里面默认连接sqlite，那么修改的花其实就是修改settings的配置啦

```python
# http://www.cnblogs.com/wupeiqi/articles/5237704.html
# 由sqlite变为mysql
DATABASES = {
    'default': {
    	'ENGINE': 'django.db.backends.mysql',
    	'NAME':'dbname',  # 数据库的名称，要先创建好数据库
    	'USER': 'root',
    	'PASSWORD': 'xxx',
    	'HOST': 'localhost',
    	'PORT': '3306',
    }
}

# 在project同名的__init__.py中引入一下pymysql
# 由于Django内部连接MySQL时使用的是MySQLdb模块，而python3中还无此模块，所以需要使用pymysql来代替
  
# 如下设置放置的与project同名的配置的 __init__.py文件中
  
import pymysql
pymysql.install_as_MySQLdb()
```

**踩坑记录~**

```python
# 因为我学习的时候django2.0刚发布没多久，因此默认安装的就是2.0的django。在使用过程中遇到如下报错，报我的mysql版本太低：
django.core.exceptions.ImproperlyConfigured: mysqlclient 1.3.3 or newer is required; you have 0.7.11.None

找到对应使用的python版本的site-packages下django下db下banckends下mysql下的base.py
我的位置是在如下的位置，win，mac，或者其他的linux版本位置可能不一样自己确定好位置再改。
/usr/local/lib/python3.6/site-packages/django/db/backends/mysql

在base.py中有这么一句，给注释掉就可以了，否者都不能创建django app
if version < (1, 3, 3):
    raise ImproperlyConfigured("mysqlclient 1.3.3 or newer is required; you have %s" % Database.__version__)
```

**扩展：查看Django ORM执行的原生SQL**

```python
# 在settings中添加这些语句，这样重启项目以后我们就可以在终端查看到执行的所有语句了，调试的时候可以打开查看进行调试学习使用。
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console':{
            'level':'DEBUG',
            'class':'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'propagate': True,
            'level':'DEBUG',
        },
    }
}
```

## 2、Django数据表的创建

> Django的ORMD是data_first类型的ORM，使用前必须先创建数据库

### 2.1、建表流程

django orm之创建数据表，在app的models类，创建一个类，这个类就是表（对应文件为小的项目下的models.py文件），表中的一行就是一个对象。

```python
# 表类创建示例
class Userinfo(models.Model):
    # AutoField()就是自增的，在内部生成的是Int类型，还有一个BigAutoField，就是bigint
    # 在django里，这一列可以不写，在内部会默认生成一列叫id，是int类型的，并且自增的
    nid = models.AutoField(primary_key = True)
    # CharField就是字符串类型
    username = models.CharField(max_length=32)
    password = models.CharField(max_length=64)
    
    
# 表与表之间的关系：外键
group_id = models.ForeignKey("UserGroup", null=False)
会自动生成一个group_id_id的这么一列，生成外键的关系。也就是说我们创建的外键在实际的表中会生成一个我们创建的名字_id形式的名字字段，因此如果说向这个表中添加数据的时候，指定的字段名应该是，外键_id的形式。

示例：
class Userinfo(models.Model):
    """用户表"""
    name = models.CharField(max_length=16)
    age = models.IntegerField()
    ut = models.ForeignKey('UserType', on_delete=models.CASCADE)
    
    那么结果会有id，name，age，ut_id字段，共4个字段
    
# 表的修改
直接修改models中的class数据模型类就行了。在已经有数据的表里添加字段的时候要添加默认值
age = models.IntergerField(null=True)
或者
age = models.IntergerField(default=1)
```

### 2.2、注册你的项目

```python
# 在settings中注册app
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'app01',  # 把你自己的小项目给加上
]
```

### 2.3、创建数据表：

```python
# 最后创建数据库表
python manage.py makemigrations  # 生成配置文件
# 通过配置文件进行操作数据库，每一次都有一个配置文件，保存在app中的migrations文件夹中，修改的依据也是这个文件夹的操作配置的记录的配置文件。
python manage.py migrate         

# django自己会创建很多表
mysql> show tables;
+----------------------------+
| Tables_in_study            |
+----------------------------+
| auth_group                 |
| auth_group_permissions     |
| auth_permission            |
| auth_user                  |
| auth_user_groups           |
| auth_user_user_permissions |
| backend_userinfo           |
| django_admin_log           |
| django_content_type        |
| django_migrations          |
| django_session             |
+----------------------------+
11 rows in set (0.00 sec)

只有这个backend_userinfo才是我们自己的表，其他的都是django默认创建的。
```

## 3、Django Admin

> Django为我们提供了一个内置的后台，我们可以使用

登录后台是需要账号密码的，不过我们一开始也不知道，因此要重新设置一下密码

```python
python3 manage.py createsuperuser
```

按照命令行的提示输入账号和密码就可以啦~

![](http://omk1n04i8.bkt.clouddn.com/18-1-31/1250519.jpg)

主界面：

![](http://omk1n04i8.bkt.clouddn.com/18-1-31/37524661.jpg)

