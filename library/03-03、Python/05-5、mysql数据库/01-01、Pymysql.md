# Pymsql

```python
#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# author:maxiaoyu
import pymysql

# 连接数据库成功
conn = pymysql.connect(host='localhost',user='root',password='',database='exe')
## 创建一个取数据的工具(把手)
cursor = conn.cursor()
sql = 'select * from student'
cursor.execute(sql)
# 取一条，取出来就是一条记录，这是一个元组。
ret = cursor.fetchone()
print(ret)

# 关闭数据库链接
cursor.close()
conn.close()

"""
一定不要自己去拼凑sql语句，防止sql注入（uuu' or 1=1 --）

占位符可以采用多种形式，支持字典，列表。
cursor.execute(sql,user,pwd)
cursor.execute(sql,[user,pwd])
cursor.execute(sql,{'user':user,'pass':pwd})

pymysql会自己做参数
"""
```

**使用pymysql进行<u>*增删改*</u>的时候要提交，不然不会更新到数据库：**

```mysql
conn.commit()    # 放在excute之后
```

当然在插入的时候我们可以选择多条插入，一般executemany只适用于insert：

```mysql
cursor.executemany(sql,[('egon','11'),('lamber','22'),])
```

不管是execute还是executemany都会有一个返回值，这个返回值表示的是受影响的行数。这个受影响的行数增删改查都有的。

关于查询操作，数据库的fetchone操作其实也是很类似文件的读取，也是存在一个指针点的，我们可以“seek”到某一个位置，不过在pymysql里他不叫seek它叫做scroll

```python
cursor.scroll(1,mode='relative')  # 根据当前的位置相对位移
cursor.scroll(1,mode='absolute')  # 根据绝对位置定位
```

fetchone一次取一个，那么肯定就有对应的一次取多个的。

```python
cursor.fetchmany(n)   # n是一次取几条，一般不用这中办法
```

一般要不就是取一条，要不就是取所有的，一般看场景，比如用户认证的时候肯定就是单用户认证，这个时候fetchone就足够了。这个fetchall是取所有的查到的数据。fetchall拿到的是一个元组，元组里面套小元组。

```python
cursor.fetchall()
```

但是元组对应的只是各个字段的值，假如不看字段定义我们并不知道取出来的值对应的是什么关系，当然这个是可以修改的

```python
cursor = conn.cursor(cursor=pymysql.cursors.DictCursor)
```

返回的结果就是列表里面套字典了。

如果获取最后查入数据的那条自增id呢？当然不关你是插入多条还是插入一条，只返回最后那条的id

```mysql
cursor.lastrowid    # 不带括号哦，就是一个属性值。
```

练习：



