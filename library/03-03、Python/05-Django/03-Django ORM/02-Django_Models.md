# Django Models

>Django Models内置了很多建表的类型，灵活的使用Django提供的数据类型可以让我们的工作事半功倍。

## 字符串类型

下面这些其实都是字符串的类型（对应的mysql的类型就是varchar类型）：

| 字段名称                                  | 相关属性                                     |
| ------------------------------------- | ---------------------------------------- |
| CharField(max_length=255)             | 字符类型，必须提供max_length参数，max_length表示字符长度   |
| EmailField(CharField)                 | 字符串类型，Django Admin以及ModelForm中提供验证机制，直接models.xx.objects.create(xx)是不提供验证机制的 |
| IPAddressField(Field)                 | 字符串类型，Django Admin以及ModelForm中提供验证 IPV4 机制 |
| URLField(CharField)                   | 字符串类型，Django Admin以及ModelForm中提供验证 URL   |
| SlugField(CharField)                  | 字符串类型，Django Admin以及ModelForm中提供验证支持 字母、数字、下划线、连接符（减号） |
| UUIDField(Field)                      | 字符串类型，Django Admin以及ModelForm中提供对UUID格式的验证 |
| GenericIPAddressField(Field)          | 字符串类型，Django Admin以及ModelForm中提供验证 Ipv4和Ipv6；参数1：protocol，用于指定Ipv4或Ipv6， 'both',"ipv4","ipv6"；参数2：unpack_ipv4， 如果指定为True，则输入::ffff:192.0.2.1时候，可解析为192.0.2.1，开启此功能，需要protocol="both" |
| FilePathField(Field)                  | 字符串，Django Admin以及ModelForm中提供读取文件夹下文件的功能。参数如下：path（文件夹路径）,match=None（正则匹配）,recursive=False（是否递归下面的文件夹）,allow_files=True（允许文件）,allow_folders=False（允许文件夹） |
| FileField(Field)                      | 字符串，路径保存在数据库，文件上传到指定目录，可以在Django Admin中，直接进行使用。参数1：upload_to = ""表示上传文件的保存路径；参数2：storage = None表示存储组件，默认：django.core.files.storage.FileSystemStorage |
| ImageField(FileField)                 | 字符串，路径保存在数据库，文件上传到指定的目录；参数如下：upload_to=""（表示上传文件的保存路径）；storage=None(表示存储组件，默认的是django.core.files.storage.FileSystemStorage)；width_field=None（上传图片的高度保存的数据库字段名，字符串形式）；height_field=None（ 上传图片的宽度保存的数据库字段名，字符串形式）； |
| CommaSeparatedIntegerField(CharField) | 字符串类型，格式必须为逗号分割的数字                       |

## 时间类型

```python
models.DateTimeField(null=True)
date=models.DateField()
```

## 数字类型

```python
(max_digits=30,decimal_places=10)总长度30小数位 10位）
num = models.IntegerField()
num = models.FloatField() 浮点
price=models.DecimalField(max_digits=8,decimal_places=3) 精确浮点
```

## 枚举

```python
 choice=(
        (1,'male'),
        (2,'female'),
        (3,'other')
    )
lover=models.IntegerField(choices=choice) #枚举类型

# 在数据库存储枚举类型，比外键有什么优势？
1、无需连表查询性能低，省硬盘空间(选项不固定时用外键)
2、在modle文件里不能动态增加（选项一成不变用Django的choice），选项固定的时候可以使用枚举，如果需要动态增加的时候建议使用外键。
3、在Django Admin中可以直接结合枚举生效，生成下拉框。
```

## 其他参数

```python
# 字段参数
null                数据库中字段是否可以为空
db_column           数据库中字段的列名
default             数据库中字段的默认值
primary_key         数据库中字段是否为主键
db_index            数据库中字段是否可以建立索引
unique              数据库中字段是否可以建立唯一索引
unique_for_date     数据库中字段【日期】部分是否可以建立唯一索引
unique_for_month    数据库中字段【月】部分是否可以建立唯一索引
unique_for_year     数据库中字段【年】部分是否可以建立唯一索引

# 设置是否为空，设置默认值
xxx = models.CharField.(max_length=32, null=True, default='111')
xxx = models.CharField.(max_length=32, db_index=True, unique=True)
# unique_for_month,unique_for_day,unique_for_year，指定日期类型中的哪一端为索引，在数据库中我们添加索引的时候可以指定prefix长度为多少，这里可以指定年月日。
xxx = models.DateTimeField(null=True, unique_for_data=True)

# 联合唯一索引
class Meta:
	unique_together = (
 		('email','ctime'),
	)
# 联合索引，不唯一（不做限制）
	index_together = (
		('email','ctime'),
	)
    
# 联合唯一约束
class Love(models.Model):
    b = models.ForeignKey('Boy')
    g = models.ForeignKey('Girl')
    
    class Meta:
        unique_together = [
            ('b','g'),
        ]
        

ManyToManyField(RelatedField)  #多对多操作
```

## 针对Django Admin生效的参数

有一些Django提供的字段模型比如EmailField或者IPAddressField等都可以在Django Admin中提供字段验证的功能（Module Form也可以生效），但是这些功能对于直接create创建添加并不会起到验证的效果。

如何在Django Admin中注册我们自己的模型类：

```python
# 在我们自己创建的app下的admin.py中进行注册
from django.contrib import admin
from backend import models
admin.site.register(models.DjangoAdmin_test)
```

再次查看后台主界面的时候就会发现我们注册的表已经添加进去了：

![](http://omk1n04i8.bkt.clouddn.com/18-1-31/33506367.jpg)

点击Django admin_tests，进入到内部，点击右上方的ADD Django ADMIN_TEST我们其实就可以向绑定的这个表内添加数据了。在这里我们就可以看到Django提供的那些特殊字段的验证效果了，比如EmailField会验证是不是邮箱。

- FileFeild()：在Django Admin中会变成上传的组件

- DateTimeField()：时间类型，可以传入2017-10-11类似的。

- 枚举类型，Admin中显示选择框的内容，用不变动的数据放在内存中从而避免跨表操作，体现出来就是一个下拉菜单。如果不在Django Admin中使用的话，我们自己通过for循环取也是完全没有问题的。

  ```python
  # example1：
  color_list = (
      (1, 'black'),
      (2, 'white'),
      (3, 'blue')
  )
  color = models.IntegerField(choices=color_list)

  # example2：
  gf = models.IntegerField(choices=[(0, '何穗'),(1, '大表姐'),],default=1)
  ```

- verbose_name：Admin中显示的字段名称

- blank：Admin中是否允许用户输入为空。

- editable：Admin中是否可以编辑，如果为false你在页面上就直接看不到了。

- help_text：Admin中显示该字段的提示信息

- error_messages：自定义错误信息（字典类型），从而定制想要显示的错误信息；结合validators使用。

  ```python
  # 这个error_messages优先级是比较低的。错误信息会在Module Form中找的。
  字典健：null, blank, invalid, invalid_choice, unique, and unique_for_date                        如：{'null': "不能为空.", 'invalid': '格式错误'}
  ```

- validators：自定义错误验证（列表类型），从而定制想要的验证规则

  ```python
  from django.core.validators import RegexValidator
  from django.core.validators import EmailValidator,URLValidator,DecimalValidator,\                      MaxLengthValidator,MinLengthValidator,MaxValueValidator,MinValueValidator
  # 如：
  test = models.CharField(
  	max_length=32,
      error_messages={
          # 这里的错误信息会优先于下面的validators中的错误进行显示。
      	'c1': '优先错信息1',
          'c2': '优先错信息2',
          'c3': '优先错信息3',
      },
      validators=[
           RegexValidator(regex='root_\d+', message='错误了', code='c1'),
           RegexValidator(regex='root_112233\d+', message='又错误了', code='c2'),
           EmailValidator(message='又错误了', code='c3'), ]
  )
  ```



## 数据库级别生效参数汇总

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

    TextField(Field)
        - 文本类型



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

#### 

小结：

- Django Admin定制型太强，一般不会用很多，或者根本不用