## 3、Django数据操作

## 模型之间的关系

> 先来简单说明模型之间的关系，大致可以分为三种，一对一，一对多，多对多。

### 一对一



### 一对多



### 多对多

> 比如一个老师可以任教多个班级，一个班级可以被多个老师任教，这就是一个多对多的关系

```python
class Class(models.Model):
    name = models.CharField(max_length=32, verbose_name="班级名")
    course = models.CharField(verbose_name="课程", max_length=32)

    def __str__(self):
        return self.name


class Teacher(models.Model):
    name = models.CharField(max_length=23, verbose_name="姓名")
    classes = models.ManyToManyField(verbose_name="所属班级", to="Class")

    def __str__(self):
        return self.name
```

针对多对多的关系就可以直接使用ManyToManyField进行声明。Django会为我们分别生成appname_class和appname_teacher这两个表，其中appname指的是你的app的名称。但是并不会在你的teacher的表中生成classes这么一个字段，而是单独的为你创建一个class和teacher的关系表。

不过这个m2m的表只会为你创建三个字段，一个id，还有两个字段分别关联到class的主键字段和teacher的主键字段，如果我们还有其他的需求的话，这个Django默认是无法为我们完成的。因此这个表我们也可以自己进行定义的。

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
models.UserGroup.objects.filter(id=2).update(**dict)
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
models.UserInfo.objects.filter(name__isnull=True)  # 判断是否为空
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

## 5、Extra

> 在使用mysql的时候经常会出现使用临时表的语句，比如：
>
> ```mysql
> select id,name,(select count(1) from app_usertype where id>1) as count) from app_userinfo;
> ```
>
> 这种临时表在ORM的操作中也是可以实现的，就是使用extra。
>
> 额外查询条件及相关表操作

使用extra添加额外的查询，其中字典中的key n可以充当我们取出来的内容

```python
# select_params中的是按位置一个一个占位的。
ret = models.UserInfo.objects.all().extra(
    select={
        'n': "select count(1) from app_usertype where id>%s and id < %s",
        'm': "select count(1) from app_usertype where id>%s and id < %s",
    },
    select_params=[1,3,4,6],
)

for obj in ret:
    print(obj.id, obj.name, obj.n)
```

extra中还可以使用where：

```python
# where后面接一个列表，列表中的元素以and连接
models.UserInfo.objects.extra(
    where=["id=1","name='alex'"]
)

# 列表中的每个元素内部可以用or
models.UserInfo.objects.extra(
    where=["id=1 or id=%s","name=%s"],
    params=[1,'alex']
)
```

tables的应用

```python
# 相当于笛卡尔积:select * from app_userinfo,app_usertype
models.UserInfo.objects.extra(
    tables=['app_usertype'],
)

# 使用where条件:select * from app_userinfo,app_usertype where app_usertype.id=app_userinfo.ut_id
models.UserInfo.objects.extra(
    tables=['app_usertype'],
    where=['app_usertype.id = app_userinfo.ut_id']
)
```

排序的使用：

```python
# 按照nid倒序排
models.UserInfo.objects.extra(select={'new_id': "select id from tb where id > %s"}, select_params=(1,), order_by=['-nid'])
```

当然上面四中条件还是可以混在一起写的：

```python
models.UserInfo.objects.extra(
    select={'newid':select count(1) from tb1 where id>%s},
    select_params=[1,],
    where=['age>%s'],
    params=[18,],
    order_by=['-age',],
    tables=['app_usertype']
)
转换为sql以后就是如下的内容：
"""
select 
	app_userinfo.id,  # 隐含的会取到
	(select count(1) from tb1 where id>1) as newid
from app_userinfo,app_usertype
	where 
		app_userinfo.age>18
	order_by
		app_userinfo.age desc
	
"""
```

## 6、执行原生SQL

针对非常复杂的sql，django orm也是支持使用原生sql的。

```python
from django.db import connection, connections

cursor = connection.cursor()
cursor.execute('sql语句，和pymysql一样')
row = cursor.fetchall()   # fetchall也有
connection.close()

# 我们还可以使用connections去创建cursor
cursor = connections['db_setting_name'].cursor()

# 在connections中可以填一个db设置的名称，这个设置的名称就是在配置文件中DATABASE部分设置的字典的key，如果存在多个数据库的话，那么我们可以配置连接不同的数据库。只要填上不同的db的配置文件的key就可以了。默认的就是default的数据。
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'django_test',
        'USER': 'lamber',
        'PASSWORD': '13082171785',
        'HOST': '47.94.132.15',
        'PORT': '3306',
    }
    'db2': {
		……………………
    }
}

比如：cursor = connections['db2'].cursor()
```

## 7、Django ORM细节梳理

```python
##################################################################
# PUBLIC METHODS THAT ALTER ATTRIBUTES AND RETURN A NEW QUERYSET #
##################################################################

def all(self)
    # 获取所有的数据对象

def filter(self, *args, **kwargs)
    # 条件查询
    # 条件可以是：参数，字典，Q

def exclude(self, *args, **kwargs)
    # 条件查询
    # 条件可以是：参数，字典，Q

def select_related(self, *fields)
     # 性能相关：表之间进行join连表操作，一次性获取关联的数据。
     model.tb.objects.all().select_related()
     # 会把外键字段关联的表连起来去取，相当于两个表inner join，相当于一次性查询到
     # 如果外键存在多个的话用逗号分隔，比如select_related('fk1','fk2')
     # 避免发起多次查询请求。
     # select * from tb1 inner join tb2 on ……
     # 有Foreign Key数据较少的时候，联表性能下降也不是很大，就可以使用这个
     model.tb.objects.all().select_related('外键字段')
     model.tb.objects.all().select_related('外键字段__外键字段')

def prefetch_related(self, *lookups)
    性能相关：多表连表操作时速度会慢，使用其执行多次SQL查询在Python代码中实现连表操作。
    # 不做联表，多次查询
    # 获取所有用户表
    # 获取用户类型表where id in (用户表中的查到的所有用户ID)
    # select * from UserInfo;
    # Django内部：把这张表的所有"外键字段_id"去重，然后取到
    # 第二次查询：select * from user_type where id in 上面取到的外键字段的id。
    # Django会将这两个结果集整合到一起
    # 有外键，数据很多，查询次数频繁就可以用这个。进行单表查询提高性能。
    models.UserInfo.objects.prefetch_related('外键字段')



    from django.db.models import Count, Case, When, IntegerField
    Article.objects.annotate(
        numviews=Count(Case(
            When(readership__what_time__lt=treshold, then=1),
            output_field=CharField(),
        ))
    )

    students = Student.objects.all().annotate(num_excused_absences=models.Sum(
                models.Case(
                    models.When(absence__type='Excused', then=1),
                default=0,
                output_field=models.IntegerField()
            )))

def annotate(self, *args, **kwargs)
    # 用于实现聚合group by查询

    from django.db.models import Count, Avg, Max, Min, Sum

    v = models.UserInfo.objects.values('u_id').annotate(uid=Count('u_id'))
    # SELECT u_id, COUNT(ui) AS `uid` FROM UserInfo GROUP BY u_id

    v = models.UserInfo.objects.values('u_id').annotate(uid=Count('u_id')).filter(uid__gt=1)
    # SELECT u_id, COUNT(ui_id) AS `uid` FROM UserInfo GROUP BY u_id having count(u_id) > 1

    v = models.UserInfo.objects.values('u_id').annotate(uid=Count('u_id',distinct=True)).filter(uid__gt=1)
    # SELECT u_id, COUNT( DISTINCT ui_id) AS `uid` FROM UserInfo GROUP BY u_id having count(u_id) > 1

def distinct(self, *field_names)
    # 用于distinct去重，在不同的数据源上用法不一样
    # 比如mysql或者sqlite是不能传递参数的。
    # 如果使用的是PG(PostGreSQL)就要这么写：
    # models.UserInfo.objects.distinct('nid')
    
    models.UserInfo.objects.values('nid').distinct()
    # select distinct nid from userinfo

    注：只有在PostgreSQL中才能使用distinct进行去重

def order_by(self, *field_names)
    # 用于排序
    models.UserInfo.objects.all().order_by('-id','age')

def extra(self, select=None, where=None, params=None, tables=None, order_by=None, select_params=None)
    # 构造额外的查询条件或者映射，如：子查询

    Entry.objects.extra(select={'new_id': "select col from sometable where othercol > %s"}, select_params=(1,))
    Entry.objects.extra(where=['headline=%s'], params=['Lennon'])
    Entry.objects.extra(where=["foo='a' OR bar = 'a'", "baz = 'a'"])
    Entry.objects.extra(select={'new_id': "select id from tb where id > %s"}, select_params=(1,), order_by=['-nid'])

 def reverse(self):
    # 倒序，只有前面有order_by的时候，reverse才有用。reverse会反转order_by的所有条件
    # 比如order_by('-col1','col2')，反转以后就是order_by('col1','-col2')
    models.UserInfo.objects.all().order_by('-nid').reverse()
    # 注：如果存在order_by，reverse则是倒序，如果多个排序则一一倒序


 def defer(self, *fields):
    models.UserInfo.objects.defer('username','id')
    或
    models.UserInfo.objects.filter(...).defer('username','id')
    #映射中排除某列数据，如上即取除了username和id以外的数据。主键一定会取的。所以写不写无所谓

 def only(self, *fields):
    #仅取某个表中的数据
     models.UserInfo.objects.only('username','id')
     或
     models.UserInfo.objects.filter(...).only('username','id')
     等价于：
	 models.UserInfo.objects.filter(...).values('username','id')
     # 只不过返回的依然是一个对象而不是一个元组，这个是和values不一样的地方
     # 当然返回的obj依然可以用“.”去访问我们取的之外的字段，但是会引发新的sql查询
     # 因此当使用only的时候你取谁了，就用谁，不要多余的去访问其他的字段属性，会造成额外查询降低sql的性能。不要多拿，要是多拿还不如不写，或者你干脆多取就的了。
       
 def using(self, alias):
     # 指定使用的数据库，参数为别名（setting中的设置，事先得有这个表。
     models.UserInfo.objects().all.using('db2')


##################################################
# PUBLIC METHODS THAT RETURN A QUERYSET SUBCLASS #
##################################################

def raw(self, raw_query, params=None, translations=None, using=None):
    # 执行原生SQL，返回的内容是userinfo的对象
    models.UserInfo.objects.raw('select * from userinfo')

    # 如果SQL是其他表时，必须将列名字设置为当前UserInfo对象的主键列名
    models.UserInfo.objects.raw('select id as nid from 其他表')

    # 为原生SQL设置参数
    models.UserInfo.objects.raw('select id as nid from userinfo where nid>%s', params=[12,])

    # 将获取的到列名转换为指定列名
    name_map = {'first': 'first_name', 'last': 'last_name', 'bd': 'birth_date', 'pk': 'id'}
    # 相当于first as first_name;last as last_name
    Person.objects.raw('SELECT * FROM some_other_table', translations=name_map)

    # 指定数据库
    models.UserInfo.objects.raw('select * from userinfo', using="default")

    ################### 原生SQL ###################
    from django.db import connection, connections
    cursor = connection.cursor()  # cursor = connections['default'].cursor()
    cursor.execute("""SELECT * from auth_user where id = %s""", [1])
    row = cursor.fetchone() # fetchall()/fetchmany(..)


def values(self, *fields):
    # 获取每行数据为字典格式

def values_list(self, *fields, **kwargs):
    # 获取每行数据为元祖

def dates(self, field_name, kind, order='ASC'):
    # 根据时间进行某一部分进行去重查找并截取指定内容
    # kind只能是："year"（年）, "month"（年-月）, "day"（年-月-日）
    # order只能是："ASC"  "DESC"
    # 并获取转换后的时间
        - year : 年-01-01
        - month: 年-月-01
        - day  : 年-月-日
	# ctime字段名，day上面的格式（只能写上面三个），desc倒序。
    models.DatePlus.objects.dates('ctime','day','DESC')

def datetimes(self, field_name, kind, order='ASC', tzinfo=None):
    # field name就是时间字段
    # 根据时间进行某一部分进行去重查找并截取指定内容，将时间转换为指定时区时间
    # kind只能是 "year", "month", "day", "hour", "minute", "second"
    # order只能是："ASC"  "DESC"
    # tzinfo时区对象
    models.DDD.objects.datetimes('ctime','hour',tzinfo=pytz.UTC)
    models.DDD.objects.datetimes('ctime','hour',tzinfo=pytz.timezone('Asia/Shanghai'))

    """
    # 时区的转换需要安装这个模块
    pip3 install pytz
    import pytz
    pytz.all_timezones
    pytz.timezone(‘Asia/Shanghai’)
    """

def none(self):
    # 空QuerySet对象，什么都不取。


####################################
# METHODS THAT DO DATABASE QUERIES #
####################################

def aggregate(self, *args, **kwargs):
   # 聚合函数，获取字典类型聚合结果
   # 计算整个表的聚合结果(分组)
   from django.db.models import Count, Avg, Max, Min, Sum
   # 如果包含distinct的话会先进行去重，然后再进行聚合
   result = models.UserInfo.objects.aggregate(k=Count('ut_id', distinct=True), n=Count('nid'))
   ===> {'k': 3, 'n': 4}

def count(self):
   # 获取个数

def get(self, *args, **kwargs):
   # 获取单个对象
   models.UserInfo.objects.get(id=1)

def create(self, **kwargs):
   # 创建对象，会有一个返回值，这个返回值就是增加的这条数据
   obj = models.UsetType.objects.create(title='xxx')
   obj = models.UsetType.objects.create(**dict_data)
  
   # 使用save提交
   obj = models.UserType(title='xxx')
   obj.save()

def bulk_create(self, objs, batch_size=None):
    # 批量插入
    # batch_size表示一次插入的个数
    objs = [
        models.DDD(name='r11'),
        models.DDD(name='r22')
    ]
    # 这里的10指的是一次最多提交10个对象，最多不要超过999
    models.DDD.objects.bulk_create(objs, 10)

def get_or_create(self, defaults=None, **kwargs):
    # 如果存在，则获取，否则，创建
    # defaults 指定创建时，其他字段的值
    # 如果能找到username=root1的，那么就直接返回对象，忽略后面的参数。
    # 否则就创建，并按照defaults中的内容填充其他字段数据。
    # obj返回查询的对象，created返回创建的结果，返回true或者false
    obj, created = models.UserInfo.objects.get_or_create(username='root1', defaults={'email': '1111111','u_id': 2, 't_id': 2})

def update_or_create(self, defaults=None, **kwargs):
    # 如果存在，则更新，否则，创建
    # defaults 指定创建时或更新时的其他字段
    obj, created = models.UserInfo.objects.update_or_create(username='root1', defaults={'email': '1111111','u_id': 2, 't_id': 1})

def first(self):
   # 获取第一个

def last(self):
   # 获取最后一个

def in_bulk(self, id_list=None):
   # 根据主键ID进行查找，相当于in操作。不同于__in的就是是根据主键查找
   id_list = [11,21,31]
   models.DDD.objects.in_bulk(id_list)

def delete(self):
   # 删除

def update(self, **kwargs):
    # 更新

def exists(self):
   # 是否有结果
```

## 8、多对多关系

Django自动生成多对多关联表：

```python
class Boy(models.Model):
    name = models.CharField(max_length=32)
    # 为你生成一张多对多的关联表，表名app_boy_m
    m = models.ManyToManyField('Girl')
    
# 但是这张表是django为我们生成的，models里没有模型的定义，那么该如何操作呢？
# 答案是无法直接对第三张表操作，但是可以通过这个m进行间接的操作。

obj = models.Boy.objects.filter(name='user1').first()
obj.m.add(xxx)
obj.m.add(xxx,xxx)
obj.m.add(*list)
# 删数据
obj.m.remove(xxx)
obj.m.remove(xxx,xxx)
obj.m.remove(*list)
# 修改，传值传入一个列表，set会进行重置。
obj.m.set([1,])
# 获取，因为没有第三张表的类定义，因为返回的内容并不是关系表的对象，而是关联表的对象
# 比如A表和B关联，C表示A和B的关系表，通过A.m.all()这个取出来的不是c的对象而是B的对象
obj.m.all()
# 还可以进行二次筛选 obj.m.filter(xxx=xxx)
# 删除
obj.m.clear()
# 逆向查找，关系表在Boy表中定义的，那么如何在Girl的对象中拿到呢？
obj = models.Girl.objects.filter(nick='小鱼').first
# 可以使用_set进行逆向查找，这个下划线set同样有all，filter，add等操作
obj.boy_set.all()

# ManyToMany自动生成的关系表只能有三列，如果要有其他的列的时候，就得自己写了。
# 比如男女相亲，还要记录相亲时间等等其他的字段这个就超出了Django默认能做的范畴了。
# 所以到底选用什么方法要根据自己的需要进行选择，推荐自己去写，相对来讲更灵活。
```

如果说manytomany也用了，也自己定义了关系表了，那么按照原则来讲，Django会替我们创建一张关系表。我们可以通过配置让着两种用法同事存在并且不创建新表，让Django默认我们创建的就是那张关系表。

```python
# 这样可以用之前提到的manytomany的obj.m.clear()属性和obj.m.all()属性，其他的不能用
class Boy(models.Model):
    name = models.CharField(max_length=32)
    m = models.ManyToManyField("Girl", through="Love", through_fields=('b','g'))
```

总结

Django执行原生sql的三种方法：

1、原生sql

2、extra

3、raw