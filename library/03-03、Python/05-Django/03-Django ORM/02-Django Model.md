# Django Model

## 常用Model

### 数字类型

- AutoField(Field)

  ```python
  int自增列，必须填入参数 primary_key = True
  ```

- BigAutoField(AutoField)

  ```python
  这是bigint的自增列，必须填入参数primary_key=True
  注：当model中如果没有自增列，则自动会创建一个列名为id的列

  from django.db import models

  class UserInfo(models.Model):
      # 自动创建一个列名为id的且为自增的整数列
      username = models.CharField(max_length=32)

  class Group(models.Model):
      # 当然我们可以自定义自增列
      nid = models.AutoField(primary_key=True)
      name = models.CharField(max_length=32)
  ```

- SmallIntegerField(IntegerField)

  ```python
  - 小整数 -32768 ～ 32767
  ```

- PositiveSmallIntegerField(PositiveIntegerRelDbTypeMixin, IntegerField)

  ```python
  - 正小整数 0 ～ 32767
  ```

- IntegerField(Field)

  ```python
  - 整数列(有符号的) -2147483648 ～ 2147483647
  ```

- PositiveIntegerField(PositiveIntegerRelDbTypeMixin, IntegerField)

  ```python
  - 正整数 0 ～ 2147483647
  ```

- BigIntegerField(IntegerField):

  ```python
  - 长整型(有符号的) -9223372036854775808 ～ 9223372036854775807

  自定义无符号整数字段

  class UnsignedIntegerField(models.IntegerField):
      def db_type(self, connection):
          return 'integer UNSIGNED'
  ```

- FloatField(Field)

  ```python
  浮点型
  ```

- DecimalField(Field)

  ```python
  - 10进制小数,精确浮点
  - 参数：
     max_digits，总长度
     decimal_places，小数位长度
  ```

### 字符串类型

- CharField(max_length=255)

  ```python
  字符类型，必须提供max_length参数，max_length表示字符长度
  ```

- EmailField(CharField)

  ```python
  也是字符串类型，在Django Admin以及Model Form中可以提供邮箱格式的验证，但是直接create增加数据这样是并不能够提供验证功能的
  ```

- IPAddressField(CharField)

  ```python
  字符串类型，Django Admin以及ModelForm中提供验证 IPV4 机制
  ```

- URLField(CharField)

  ```python
  字符串类型，Django Admin以及ModelForm中提供验证 URL
  ```

- SlugField(CharField)

  ```python
  字符串类型，Django Admin以及ModelForm中提供验证支持 字母、数字、下划线、连接符（减号）

  Slug这个Field是用在文章的URL的，比如一个文章标题是i love django，那么可以把slug设置成i-love-django，然后这样这篇文章的url可以是www.example.com/article/i-love-django，每一篇文章都是唯一的，所以slug也要唯一，unique要设置为True。当然你可以不这么用，单纯的用文章的id也行。
  ```

- UUIDField(Field)

  ```python
  字符串类型，Django Admin以及ModelForm中提供对UUID格式的验证
  ```

- GenericIPAddressField(Field)

  ```python
  字符串类型，Django Admin以及ModelForm中提供验证 Ipv4和Ipv6；参数1：protocol，用于指定Ipv4或Ipv6， 'both',"ipv4","ipv6"；参数2：unpack_ipv4， 如果指定为True，则输入::ffff:192.0.2.1时候，可解析为192.0.2.1，开启此功能，需要protocol="both"
  ```

- FilePathField(Field)

  ```python
  字符串，Django Admin以及ModelForm中提供读取文件夹下文件的功能。
  参数如下：path（文件夹路径）,match=None（正则匹配）,recursive=False（是否递归下面的文件夹）,allow_files=True（允许文件）,allow_folders=False（允许文件夹）
  ```

- FileField(Field)

  ```python
  字符串，路径保存在数据库，文件上传到指定目录，可以在Django Admin中，直接进行使用。
  参数1：upload_to = ""表示上传文件的保存路径；
  参数2：storage = None表示存储组件，默认：django.core.files.storage.FileSystemStorage
  ```

- ImageField(FileField)

  ```python
  字符串，路径保存在数据库，文件上传到指定的目录；
  参数如下：
  - upload_to=""（表示上传文件的保存路径）；
  - storage=None(表示存储组件，默认的是django.core.files.storage.FileSystemStorage)；
  - width_field=None（上传图片的高度保存的数据库字段名，字符串形式）；
  - height_field=None（ 上传图片的宽度保存的数据库字段名，字符串形式）；

  这个字段依赖于PIL库，因此确保你使用的时候安装了这个库，如果没有安装的话可以使用pip安装一下：pip install PIL否则是会报错的哦~
  ```

- CommaSeparatedIntegerField(CharField)

  ```python
  字符串类型，格式必须为逗号分割的数字
  ```

- TextField(Field)

  ```python
  - 文本类型
  ```

### 时间类型

- DateTimeField(DateField)

  ```python
  - 日期+时间格式 YYYY-MM-DD HH:MM[:ss[.uuuuuu]][TZ]
  ```

- DateField(DateTimeCheckMixin, Field)

  ```python
  - 日期格式      YYYY-MM-DD
  ```

- TimeField(DateTimeCheckMixin, Field)

  ```python
  - 时间格式      HH:MM[:ss[.uuuuuu]]
  ```

- DurationField(Field)

  ```python
  - 长整数，时间间隔，数据库中按照bigint存储，ORM中获取的值为datetime.timedelta类型
  ```

关于时间类型，Django提供的model有DateTimeField，DateField，TimeField三种类型。分别对应的datetime()，date()，time()三种对象。这三个field有相同的参数，一个事auto_now，一个是auto_now_add。

1. auto_now：这个字段属性值默认是false的，在保存数据对象的时候，将其设置为当前时间，然后当你修改的时候这个时间会随着你修改的时间变化而变化。简单来说，这个对象的时间会一直是最新的时间，你没办法为这个字段进行手动的赋值。
2. auto_now_add：这个字段默认也是false的，如果设置为True以后其实和auto_now差不多，只不过这个时间不会因为你后续的修改而进行改变，而是只保存第一次创建的时间。比如说用户创建时间，这个不应该随着用户信息变化而发生改变，但是论坛发的帖子，可以有一个最后的修改时间可以随着修改而改变。

auto_now和auto_now_add被设置为True后，这样做会导致字段成为editable=False和blank=True的状态。editable=False将导致字段不会被呈现在admin中，blank=True表示允许在表单中不输入值。此时，如果在admin的fields或fieldset中强行加入该日期时间字段，那么程序会报错，admin无法打开；如果在admin中修改对象时，想要看到日期和时间，可以将日期时间字段添加到admin类的readonly_fields中：

```python
class YourAdmin(admin.ModelAdmin):
    readonly_fields = ('save_date', 'mod_date',)
admin.site.register(Tag, YourAdmin)
```

实际场景中，往往既希望在对象的创建时间默认被设置为当前值，又希望能在日后修改它。怎么实现这种需求呢？

django中所有的model字段都拥有一个default参数，用来给字段设置默认值。可以用default=timezone.now来替换auto_now=True或auto_now_add=True。timezone.now对应着django.utils.timezone.now()，因此需要写成类似下面的形式：

```python
from django.db import models
import django.utils.timezone as timezone
class Doc(models.Model):
    add_date = models.DateTimeField('保存日期',default = timezone.now)
    mod_date = models.DateTimeField('最后修改日期', auto_now = True)
```

html页面从数据库中读出DateTimeField字段时，显示的时间格式和数据库中存放的格式不一致，比如数据库字段内容为2016-06-03 13:00:00，但是页面显示的却是Apr. 03, 2016, 1 p.m.

为了页面和数据库中显示一致，需要在页面格式化时间，需要添加如下类似的过滤器。刷新页面，即可正常显示。

```python
<td>{{ **infor.updatetime|date:"Y-m-d H:i:s" **}}</td>
```

### 布尔类型

- BooleanField(Field)：布尔值类型
- NullBooleanField(Field)：可以为空的布尔值类型

### 枚举类型

```python
choice=(
        (1,'male'),
        (2,'female'),
        (3,'other')
    )
lover=models.IntegerField(choices=choice) #枚举类型

# 在数据库存储枚举类型，比外键有什么优势？
1、无需连表查询性能高一些，省硬盘空间(选项不固定时用外键)
2、在model文件里不能动态增加（选项一成不变用Django的choice），选项固定的时候可以使用枚举，如果需要动态增加的时候建议使用外键。
3、在Django Admin中可以直接结合枚举生效，生成下拉框。
```

### 二进制类型

- BinaryField(Field)：二进制类型

## Model中的其他参数

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
```

### 元数据中可以填些啥？

> 官方参考：https://docs.djangoproject.com/en/1.10/ref/models/options/

```python
class UserInfo(models.Model):
    nid = models.AutoField(primary_key=True)
    username = models.CharField(max_length=32)
    class Meta:
        # 数据库中生成的表名称 默认 app名称 + 下划线 + 类名
        db_table = "table_name"

        # 联合索引
        index_together = [
            ("pub_date", "deadline"),
        ]

        # 联合唯一索引
        unique_together = (("driver", "restaurant"),)

        # admin中显示的表名称
        verbose_name

        # verbose_name加s
        verbose_name_plural
```

## 模型类在数据库中的对照参考

```python
# 以下为Django模型创建的字段值，在数据库中的属性体现

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
```