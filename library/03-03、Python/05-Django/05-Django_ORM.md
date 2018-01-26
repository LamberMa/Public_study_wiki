# Django ORM

> - 数据库操作：事先创建好数据库
> - 数据表操作：创建表，修改表，删除表
> - 操作数据行：增、删、改、查
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

### 2.4、谈谈建表数据类型

上面过了一遍建表的过程，Django其实内置了很多建表的数据类型

#### 2.4.1、字符串类型

```python
CharField(max_length=255)  # 对应的mysql的类型就是varchar类型
EmailField(CharField)：
IPAddressField(Field)
URLField(CharField)
SlugField(CharField)
UUIDField(Field)
FilePathField(Field)
FileField(Field)
ImageField(FileField)
CommaSeparatedIntegerField(CharField)
```

#### 2.4.2、时间类型

```python
models.DateTimeField(null=True)
date=models.DateField()
```

#### 2.4.3、数字字段

```python
(max_digits=30,decimal_places=10)总长度30小数位 10位）
num = models.IntegerField()
num = models.FloatField() 浮点
price=models.DecimalField(max_digits=8,decimal_places=3) 精确浮点
```

#### 2.4.4、枚举

```python
 choice=(
        (1,'male'),
        (2,'female'),
        (3,'other')
    )
lover=models.IntegerField(choices=choice) #枚举类型

# 在数据库存储枚举类型，比外键有什么优势？
1、无需连表查询性能低，省硬盘空间(选项不固定时用外键)
2、在modle文件里不能动态增加（选项一成不变用Django的choice）
```

#### 2.4.5、其他

```python
db_index = True 表示设置索引
unique(唯一的意思) = True 设置唯一索引

联合唯一索引
class Meta:
unique_together = (
 ('email','ctime'),
)
联合索引（不做限制）
index_together = (
('email','ctime'),
)
ManyToManyField(RelatedField)  #多对多操作
```

#### 2.4.6、数据库级别生效

```python
AutoField(Field)
        - int自增列，必须填入参数 primary_key=True

BigAutoField(AutoField)
        - bigint自增列，必须填入参数 primary_key=True

        注：当model中如果没有自增列，则自动会创建一个列名为id的列
        from django.db import models

        class UserInfo(models.Model):
            # 自动创建一个列名为id的且为自增的整数列
            username = models.CharField(max_length=32)

        class Group(models.Model):
            # 自定义自增列
            nid = models.AutoField(primary_key=True)
            name = models.CharField(max_length=32)

SmallIntegerField(IntegerField):
        - 小整数 -32768 ～ 32767

PositiveSmallIntegerField(PositiveIntegerRelDbTypeMixin, IntegerField)
        - 正小整数 0 ～ 32767
IntegerField(Field)
        - 整数列(有符号的) -2147483648 ～ 2147483647
PositiveIntegerField(PositiveIntegerRelDbTypeMixin, IntegerField)
        - 正整数 0 ～ 2147483647
BigIntegerField(IntegerField):
        - 长整型(有符号的) -9223372036854775808 ～ 9223372036854775807

自定义无符号整数字段

class UnsignedIntegerField(models.IntegerField):
    def db_type(self, connection):
        return 'integer UNSIGNED'

PS: 返回值为字段在数据库中的属性，Django字段默认的值为：
    'AutoField': 'integer AUTO_INCREMENT',
    'BigAutoField': 'bigint AUTO_INCREMENT',
     # 只能存储字节数据，无法作为过滤选项
    'BinaryField': 'longblob',
    'BooleanField': 'bool',
    'CharField': 'varchar(%(max_length)s)',
     # 存储由逗号分隔的数字，实质为字符串
    'CommaSeparatedIntegerField': 'varchar(%(max_length)s)',
    'DateField': 'date',
    'DateTimeField': 'datetime',
    'DecimalField': 'numeric(%(max_digits)s, %(decimal_places)s)',
    'DurationField': 'bigint',
    'FileField': 'varchar(%(max_length)s)',
    'FilePathField': 'varchar(%(max_length)s)',
    'FloatField': 'double precision',
    'IntegerField': 'integer',
    'BigIntegerField': 'bigint',
    'IPAddressField': 'char(15)',
    'GenericIPAddressField': 'char(39)',
    'NullBooleanField': 'bool',
    'OneToOneField': 'integer',
    'PositiveIntegerField': 'integer UNSIGNED',
    'PositiveSmallIntegerField': 'smallint UNSIGNED',
    'SlugField': 'varchar(%(max_length)s)',
    'SmallIntegerField': 'smallint',
    'TextField': 'longtext',
    'TimeField': 'time',
    'UUIDField': 'char(32)',

    BooleanField(Field)
        - 布尔值类型

    NullBooleanField(Field):
        - 可以为空的布尔值

    CharField(Field)
        - 字符类型
        - 必须提供max_length参数， max_length表示字符长度

    TextField(Field)
        - 文本类型

    EmailField(CharField)：
        - 字符串类型，Django Admin以及ModelForm中提供验证机制

    IPAddressField(Field)
        - 字符串类型，Django Admin以及ModelForm中提供验证 IPV4 机制

    GenericIPAddressField(Field)
        - 字符串类型，Django Admin以及ModelForm中提供验证 Ipv4和Ipv6
        - 参数：
            protocol，用于指定Ipv4或Ipv6， 'both',"ipv4","ipv6"
            unpack_ipv4， 如果指定为True，则输入::ffff:192.0.2.1时候，可解析为192.0.2.1，开启刺功能，需要protocol="both"

    URLField(CharField)
        - 字符串类型，Django Admin以及ModelForm中提供验证 URL

    SlugField(CharField)
        - 字符串类型，Django Admin以及ModelForm中提供验证支持 字母、数字、下划线、连接符（减号）

    CommaSeparatedIntegerField(CharField)
        - 字符串类型，格式必须为逗号分割的数字

    UUIDField(Field)
        - 字符串类型，Django Admin以及ModelForm中提供对UUID格式的验证

    FilePathField(Field)
        - 字符串，Django Admin以及ModelForm中提供读取文件夹下文件的功能
        - 参数：
                path,                      文件夹路径
                match=None,                正则匹配
                recursive=False,           递归下面的文件夹
                allow_files=True,          允许文件
                allow_folders=False,       允许文件夹

    FileField(Field)
        - 字符串，路径保存在数据库，文件上传到指定目录
        - 参数：
            upload_to = ""      上传文件的保存路径
            storage = None      存储组件，默认django.core.files.storage.FileSystemStorage

    ImageField(FileField)
        - 字符串，路径保存在数据库，文件上传到指定目录
        - 参数：
            upload_to = ""      上传文件的保存路径
            storage = None      存储组件，默认django.core.files.storage.FileSystemStorage
            width_field=None,   上传图片的高度保存的数据库字段名（字符串）
            height_field=None   上传图片的宽度保存的数据库字段名（字符串）

    DateTimeField(DateField)
        - 日期+时间格式 YYYY-MM-DD HH:MM[:ss[.uuuuuu]][TZ]

    DateField(DateTimeCheckMixin, Field)
        - 日期格式      YYYY-MM-DD

    TimeField(DateTimeCheckMixin, Field)
        - 时间格式      HH:MM[:ss[.uuuuuu]]

    DurationField(Field)
        - 长整数，时间间隔，数据库中按照bigint存储，ORM中获取的值为datetime.timedelta类型

    FloatField(Field)
        - 浮点型

    DecimalField(Field)
        - 10进制小数
        - 参数：
            max_digits，小数总长度
            decimal_places，小数位长度

    BinaryField(Field)
        - 二进制类型
```

#### 2.4.7、Django Admin级别生效

```python
# 针对 dango_admin生效的参数（正则匹配）（使用Django admin就需要关心以下参数！！））
blanke (是否为空)
editable=False 是否允许编辑

help_text="提示信息"提示信息
choices=choice 提供下拉框
error_messages="错误信息" 错误信息

validators  自定义错误验证（列表类型），从而定制想要的验证规则
	from django.core.validators import RegexValidator
    from django.core.validators import EmailValidator,URLValidator,DecimalValidator,\
                 MaxLengthValidator,MinLengthValidator,MaxValueValidator,MinValueValidator
如：
    test = models.CharField(
        max_length=32,
        error_messages={
            'c1': '优先错信息1',
            'c2': '优先错信息2',
            'c3': '优先错信息3',
        },
        validators=[
        	RegexValidator(regex='root_\d+', message='错误了', code='c1'),
            RegexValidator(regex='root_112233\d+', message='又错误了', code='c2'),
            EmailValidator(message='又错误了', code='c3'), 
        ]
```

## 3、Django数据操作

### 3.1、增&删&改

针对于增删改来讲，相对来说是很简单的，

```python
from app01 import models

# 增加数据
models.UserGroup.objects.create(title='销售部')
models.UserInfo.objects.create(x,x,x,ut_id=1) # 虽然外键是ut，但是在数据表中生成的是ut_id

# 使用字典形式添加数据
user_dict = {"name": "chenchao", "age": "18", "user_type_id": 1}
models.UserInfo.objects.create(**user_dict)

# 通过传递对象的方式添加数据，这里的ut就是我们添加的外键而不是表中实际的字段，实际字段为ut_id
user_type_obj = models.UserType.objects.get(id=1)   #先获取外键表中的数据对象
user_dict = {"username": "chenchao", "age": "18", "ut": user_type_obj} # 对象传入字典
user_type_obj.save() 或者 models.UserType.objects.create(**user_dict)
或者
obj = models.UserInfo(name='lamber',age=15,ut_id='2')
obj.save()

models.UserInfo.objects.create(**user_dict)

# 删除
models.UserGroup.objects.filter(id=2).delete()

# 更新
models.UserGroup.objects.filter(id=2).update(title='new_str')
```

### 3.2、查

查表的其实也是数据库里比较麻烦的，对应到orm操作内容也就相对来讲多一些。在查询的时候需要铭记于心的就是下面的两条：

- **在联表操作过滤查找数据时用双下划线 "__"**
- **在取数据时用点 "."**

#### 3.2.1、简单的查询

```python
# 简单的查
ret = models.UserGroup.objects.all().first()
ret = models.UserGroup.objects.all()
- 返回的也是一个结果集（QuerySet），结果集我们可以看做是一个列表。列表中的每一个数据数一个数据对象。可以使用对应的对象.属性的方法去调用属性值。形如：
<QuerySet [<Class: Class object (1)>, <Class: Class object (2)>, <Class: Class object (3)>, <Class: Class object (4)>, <Class: Class object (5)>]>

QuerySet特点：
<1>  可迭代的 
<2>  可切片
- books=models.Book.objects.all()[:10]  #切片 应用分页
- books = models.Book.objects.all()[::2]
- book= models.Book.objects.all()[6]    #索引
<3>  惰性计算和缓存机制
- 所谓惰性计算，就是查询返回的QuerySet（查询结果集对象），它并不会马上执行sql，而是当调用QuerySet的时候才执行。相当于一个生成器，不应用返回的Query_Set不会执行任何SQL操作。
- query_set缓存机制：1次数据库查询结果query_set都会对应一块缓存，再次使用该query_set时，不会发生新的SQL操作；这样减小了频繁操作数据库给数据库带来的压力;

# 取个数
ret = models.UserGroup.objects.all().count()

# 根据查询方式的不同，返回的数据类型也是不一样的
返回对象对象 UserInfo.objects.all()
返回字典 UserInfo.objects.values("name","age").all()
返回元组 User.objects.values_list("name","age").all()

# 如果取出来的数据太大的话有可能会撑爆内存，这个时候只要迭代器就可以优雅的解决这个问题
ret = models.UserInfo.objects.all().iterator()
```

#### 3.2.2、带条件的查询：

```python
# where条件，条件之间默认是and关系，下面这个就是相当于where id=1 and title='xx'
ret = models.UserGroup.objects.filter(id=1,title=xx)

# where条件大于和小于1，我们可以使用带双下划线的操作来获取(__gt&__lt)
ret = models.UserGroup.objects.filter(id__gt=1)
ret = models.UserGroup.objects.filter(id__lt=1)

# 根据字典去过滤
condition = {
    'id': 1,
    'name': lamber
}
models.UserInfo.objects.filter(**condition)
```

#### 3.3.3、联表

多表连接操作涉及到多种对应关系，比如一对多，多对多等。首先看一个简单的例子：

![](http://omk1n04i8.bkt.clouddn.com/18-1-26/80257083.jpg)

```python
# Create your models here.
class UserType(models.Model):
    """用户类型"""
    title = models.CharField(max_length=32)


class Userinfo(models.Model):
    """用户表"""
    name = models.CharField(max_length=16)
    age = models.IntegerField()
    ut = models.ForeignKey('UserType', on_delete=models.CASCADE)
```

##### 3.3.3.1、通过外键正向联表查找

```python
# foreign key 就代指对应关联表的一行数据，如下是在取数据的时候才跨表查询数据   
result = models.Userinfo.objects.all()
for user in result:
    print(user.id, user.name, user.age, user.ut_id, user.ut.title)
    
# 在取数据的时候跨表查询数据，记住这种双下划线的使用方法。不同于在查的时候跨表
models.Userinfo.objects.all.values('id','name', 'ut__title')
    
# userinfo表里有一个外键叫ut，虽然生成的字段叫ut_id，但是可以直接调用ut，ut代表的是usertype里的一行数据，因此可以直接通过“.”把属性获取到，借由这个特性，我们可以横跨多张表。这个跨表操作是django帮我们做的。假如说我们这里的usertyle还有一个和其他表的外键关联，那么我们还可以继续多张表关联。比如

现在有三张表A，B，C
A有一个外键b指向B表的id
b = models.ForeignKey('B', on_delete=models.CASCADE)
B有一个外键c指向C表的id
c = models.ForeignKey('C', on_delete=models.CASCADE)
那么按照说的，A表实际生成的是一个叫b_id的字段，B表实际生成的是一个c_id的字段

外键分别为b何c，根据上面的结论，我们创建的外键其实指代的就是指向表的一行数据，那么我们可以通过A表跨到C表去查数据：
ret = models.A.objects.all().first()
那么我就可以这样取到C表的数据，假设C表有一个字段叫column_c
ret2 = ret.b.c.column_c   # 这样就可以获取到我们想要的数据了。

# 在filter中也是可以进行跨表的，正向跨表实例：
models.UserInfo.objects.filter('ut__title='超级用户').values('id', 'name', 'ut__title')
```

**Tip**

```python
# 这里有一个需要注意的点，在 Django 2.0 后，models.ForeignKey() 函数 和 models.OneToOneField() 中的 on_delete 参数不再默认为 CASCADE ，而是必须参数，因此在用：

ut = models.ForeignJey('UserType')

# 这样写的时候是会直接报错的，会报错说少一个参数，但是在django2.0之前是没有问题的。
```

##### 3.3.3.2、逆向查找

```python
# 如果有人和我做了外键，纵使我这边看不见，但是仍然是有一个隐含的字段。比如我userinfo和我usertype字段做了外键，我usertype是看不到的，但是会有一个隐含的字段，如下：
obj = models.UserType.objects.all().first()  # 获取一个usertype的对象
print(obj.id, obj.title)
for row in obj.userinfo_set.all():  # 通过usertype的对象去逆向的查userinfo的数据
  # 每一个row是一个userinfo对象，这里其实就是把type=obj.title的所有用户取出来了
  print(row.name, row.age)
  
# 含表名小写_set.all()，反向操作。针对反向操作，我们还可以进行过滤等其他的操作
obj.userinfo_set.all().filter(age__gt=20)

# 在取的时候逆向查找。相当于UserType left join Userinfo谁在前面以谁为准，这就和left join让谁在前面一样，根据自己的需求去选择。跨表字段是小写的表名进行跨表。重要！！！
# 如果要取表的字段可以使用双下划线，比如：userinfo__name
ret = models.UserType.objects.values('id', 'title', 'userinfo')
- 我们可以打开django的sql执行日志，看看sql内部执行了什么：
SELECT `app_usertype`.`id`, `app_usertype`.`title`, `app_userinfo`.`name` FROM `app_usertype` LEFT OUTER JOIN `app_userinfo` ON (`app_usertype`.`id` = `app_userinfo`.`ut_id`);

# 使用filter实现反向跨表
# 在filter中也是可以进行跨表的，正向跨表实例：
models.UserType.objects.filter('userinfo__name='lamber').values('id', 'title', 'userinfo__name')
```

#### 3.3.4、其他查询操作

首先来讲我们查询到的如果返回的是一个query_set的话里面的内容其实是一个一个的对象，但是我们并不知道这些里面是什么内容，因此我们可以改写一下models模型类，比如：

```python
class Class(models.Model):

    title = models.CharField(max_length=255)
    
    def __str__(self):
        return self.title
# 这个时候我们再去排查的时候，比如print一下返回的return值就可以大概了解都是什么内容了，其实这个还可以根据我们的需求进行深度的定制，显示更加全面的信息，比如查询班级表中的所有内容：
<QuerySet [<Class: 全栈4期>, <Class: 全栈5期>, <Class: php培训班>, <Class: java培训班>, <Class: mysql实战班>]>
```

##### 3.3.4.1、order by

```python
# 按照id排序，从小到达
models.UserInfo.objects.all().order_by('id')
# 按照id逆向排序
models.UserInfo.objects.all().order_by('-id')
# 多个条件判定排序，先按照id从大到小，再按照name从小到大
models.UserInfo.objects.all().order_by('-id', 'name')
```

##### 3.3.4.2、分组

```python
from django.db.models import Count, Sum, Max, Min
ret = models.UserInfo.objects.values('ut_id').annotate(xxx=Count('id'))
print(ret.query)   # 查看生成的sql语句
# select “app_userinfo”."ut_id",COUNT("app_userinfo"."id") as xxx FROM "app_userinfo" GROUP BY "app_userinfo"."ut_id"
简单来说就是不加annotate的话前面的语句就是直接select ut_id from userinfo，如果加上了annotate的话，n那么values的内容即使group by的条件，后面的xxx是select count(app_userinfo.id)的别名。

# having的使用，filter在annotate之前就是where，在annotate之后就是having
ret = models.UserInfo.objects.values('ut_id').annotate(xxx=Count('id')).filter(xxx__gt=2)
```

##### 3.3.4.3、其他

```python
models.UserInfo.objects.filter(id__gt=1) # 大于1
models.UserInfo.objects.filter(id__lt=1) # 小于1
models.UserInfo.objects.filter(id__gte=1) # 大于等于1
models.UserInfo.objects.filter(id__lte=1) # 小于等于1
models.UserInfo.objects.exclude(id=1)   # id不等于1
models.UserInfo.objects.filter(id__in=[1,2,3]) # where in
models.UserInfo.objects.filter(id__range=[1,2]) # 范围
models.UserInfo.objects.filter(name__startswith='xxx') # startwith
models.UserInfo.objects.filter(name__endswith='xxx')  # endwith
models.UserInfo.objects.filter(name__contains='xxx')  # 包含
```

## 4、Django中神奇的F和Q

### 4.1、神奇的F

```python
from django.db.models import F

# 比如我要把用户表的age字段的所有年龄自加一，F可以让你获取基础值
models.UserInfo.objects.all().update(age=F('age')+1)
```

### 4.2、神奇的Q

Q可以用于构造复杂的查询条件

```python
from django.db.models import Q
# 一个Q对象就是一个条件
models.Userinfo.objects.filter(Q(id=1))
# 多个Q对象实现或(or)的关系
models.Userinfo.objects.filter(Q(id=1) | Q(id=2))
# 多个Q对象实现与(and)的关系
models.Userinfo.objects.filter(Q(id=1) & Q(id=2))

# 第二种q的用法
con = Q()
q1 = Q()
q1.connector = 'OR'  # q1的内部条件是什么，OR就是用或来连接，AND就是与
q1.children.append(('id', 1)) # 通过append来添加不同的条件按照如上的条件进行or
q1.children.append(('id', 10))
q1.children.append(('id', 9))
q2 = Q()
q2.connector = 'OR'
q2.children.append(('c1', 1))
q2.children.append(('c1', 10))
q2.children.append(('c1', 9))
con.add(q1, 'AND')   # 将q1和q2通过AND将两个大条件连接起来
con.add(q2, 'AND')
# 相当于
(id=1 or id=10 or id=9) and (c1=1 or c1=10 or c1=9)
# 按照上面的条件进行筛选
models.Table_class.objects.filter(con)
```

这个可以应对来自前端页面传递过来的复杂查询：

```python
# 比如前端有很多条件要进行匹配查询，我们可以在前端把对应的数据拼成一个字典格式的json传递过来
# 每一个大的过滤条件是一个key+value
condition_dict = {
    'k1': [1,2,3,4],
    'k2':[1,],
}
con = Q()
for k, v in condition_dict.items():
    q = Q()
    # 每一个大条件之间的条件用or来匹配
    q.connector = 'OR'
    for i in v:
        q.children.appeend(('id', i))
    # 大条件之前用AND来匹配，根据自己的需要。
    con.add(q, 'AND')
models.UserInfo.objects.filter(con)
```

