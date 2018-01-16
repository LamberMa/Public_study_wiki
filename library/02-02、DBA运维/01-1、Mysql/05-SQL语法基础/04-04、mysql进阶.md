#  

## 1、实体之间的关系

多个是体表应该如何设计！

### 实体之间存在哪些关系？

```
班级，学生两类实体！(一个班级对应多个学生实体，多个学生实体对应一个班级实体)
一对多，多对一，1:N, N:1
 
班级，讲师两类实体！（一个讲师可以在多个班级任教，反过来也是一样的。）
多对多，M：N
 
学生常用信息，学生不常用信息（学生与自己个人信息的肯定是一一对应的）
一对一，1：1
```

### 如何设计？

#### 多对一，一对多

在多的那端（那个表内），增加一个字段，用于保存于当前记录相关联的一端记录的主键！

![](http://omk1n04i8.bkt.clouddn.com/17-9-27/92928316.jpg)

#### 多对多

![](http://omk1n04i8.bkt.clouddn.com/17-9-27/74244288.jpg)

增加一个专门管理关联的表，使班级与讲师都与关连表存在联系。从而是两个实体间有多对多的关系！

![](http://omk1n04i8.bkt.clouddn.com/17-9-27/81487.jpg)

因此，一个多对多，会拆分成两个多对一！这里的班级id和讲师id都应该是foreign key，同时应该还应该做一个联合唯一，因为这种关系对应有一个就够了。

### 一对一

![](http://omk1n04i8.bkt.clouddn.com/17-9-27/54806190.jpg)

可见，两个表之间存在相同的主键ID即可！也可以做外键+唯一约束。外键保证这个用户真实存在，唯一约束保证不为空且不重复。

## 2、mysql语句扩展

- 在查询的时候给字段起别名：

```mysql
mysql> desc test;
+---------+------------------+------+-----+---------+----------------+
| Field   | Type             | Null | Key | Default | Extra          |
+---------+------------------+------+-----+---------+----------------+
| id      | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
| name    | varchar(255)     | NO   | PRI | NULL    |                |
| sex     | char(8)          | YES  |     | NULL    |                |
| content | text             | YES  |     | NULL    |                |
+---------+------------------+------+-----+---------+----------------+
4 rows in set (0.00 sec)


mysql> select name as testname,sex from test;
+----------+--------+
| testname | sex    |
+----------+--------+
| user1    | male   |
| user2    | female |
+----------+--------+
2 rows in set (0.00 sec)
```

也可以在查询后加额外的一列，比如：

```mysql
mysql> select name,sex,123 from test;
+-------+--------+-----+
| name  | sex    | 123 |
+-------+--------+-----+
| user1 | male   | 123 |
| user2 | female | 123 |
+-------+--------+-----+
2 rows in set (0.00 sec)

那么这玩意有什么用呢？
```

### 2.1 查询深入

```mysql
select * from table where id > 2
select * from table where id < 2
select * from table where id = 2
select * from table where id != 2
select * from table where id <> 2
select * from table where id > 2 and name='xxx'
select * from table where id > 100 or id=30 or id=20 or id=40;
select * from table where id in (20,30,40)
select * from table where id in (select nid from table_name) # 子查询
select * from table where id not in (20,30,40)
select * from table where id between 6 and 12; # 这个锁定的范围是闭区间
select * from table limit 10; # 查看前10条
select * from table limit 0,2; # 从第一条开始取（位置），往后取两条（数量）
select * from table limit 20 offset 10; # 取20条，从第11个位置开始

如何取到后10条？那么就先顺序倒过来，然后再limit 10就可以了。
```

### 2.2 排序（order by）

```mysql
select * from table order by id desc; # 倒序
select * from table order by id asc;  # 正序

# 当按照一列的规则进行排序的时候有可能有重复的，针对相同的这一些按照列2的规则排
select * from 表 order by 列1 desc,列2 asc
```

### 2.3 分组

```mysql
首先说说分组能干啥，比如有很多学生，他们都有自己所属的班级id，那么我只要：
select class_id,max(stu_id) from stu group by class_id='xxx'
就可以以班级id为标准把id一样的人分组给分出来,返回的结果重复的去掉。取出来的id去重复内容条目中的最大的。

- max:取最大值
- min：去最小值
- count：取总数
- sum：求和
- avg：取平均值

select num from 表 group by num
select num,nid from 表 group by num,nid
select num,nid from 表  where nid > 10 group by num,nid order nid desc
select num,nid,count(*),sum(score),max(score),min(score) from 表 group by num,nid
 
select num from 表 group by num having max(id) > 10

特别的：group by 必须在where之后，order by之前
```

### 2.4 表链接

```mysql
无对应关系则不显示
select A.num, A.name, B.name
from A,B
Where A.nid = B.nid

无对应关系则不显示
select A.num, A.name, B.name
from A inner join B
on A.nid = B.nid

A表所有显示，如果B中无对应关系，则值为null
select A.num, A.name, B.name
from A left join B
on A.nid = B.nid

B表所有显示，如果B中无对应关系，则值为null
select A.num, A.name, B.name
from A right join B
on A.nid = B.nid
```

#### 2.4.1 简单连接

```mysql
mysql> select * from student;
+----+--------+
| id | name   |
+----+--------+
|  1 | 张三   |
|  2 | 李四   |
|  3 | 王二   |
+----+--------+
3 rows in set (0.00 sec)

mysql> select * from course;
+----+--------+
| id | cname  |
+----+--------+
|  1 | 足球   |
|  2 | 音乐   |
|  3 | 美术   |
+----+--------+
3 rows in set (0.00 sec)
```

简单的表连接

```mysql
mysql> select * from student,course;
+----+--------+----+--------+
| id | name   | id | cname  |
+----+--------+----+--------+
|  1 | 张三   |  1 | 足球   |
|  2 | 李四   |  1 | 足球   |
|  3 | 王二   |  1 | 足球   |
|  1 | 张三   |  2 | 音乐   |
|  2 | 李四   |  2 | 音乐   |
|  3 | 王二   |  2 | 音乐   |
|  1 | 张三   |  3 | 美术   |
|  2 | 李四   |  3 | 美术   |
|  3 | 王二   |  3 | 美术   |
+----+--------+----+--------+
9 rows in set (0.00 sec)
```

可以看到简单的表连接是对两个表做了笛卡尔积。

> 笛卡尔积：
>
> ![](http://omk1n04i8.bkt.clouddn.com/17-9-28/87001516.jpg)
>
> 依次做匹配，比如樱木给一个前锋位置给一个后卫位置，其他人同理。

不过当然平常的情况下我们并不会这样去做，而是建立在某种条件的约束下进行表连接

```mysql
mysql> select * from student,course where student.id=course.id;
+----+--------+----+--------+
| id | name   | id | cname  |
+----+--------+----+--------+
|  1 | 张三   |  1 | 足球   |
|  2 | 李四   |  2 | 音乐   |
|  3 | 王二   |  3 | 美术   |
+----+--------+----+--------+
3 rows in set (0.00 sec)
```

当然上面这个例子很不合适，但是代表了是建立在某种约束下查询出来的。

#### 2.4.2 Join连接

>http://www.blogjava.net/GavinMiao/archive/2011/10/20/361640.html
>
>http://blog.163.com/xueling1231989@126/blog/static/102640807201231493651609/
>
>http://www.cnblogs.com/stone-d/p/7258340.html
>
>http://www.cnblogs.com/qiuqiuqiu/p/6442791.html
>
>http://blog.163.com/li_hx/blog/static/18399141320141127102622383/
>
>



Join连接类型，可分为三种：

- 内连接（inner）
- 外连接（outer）
- 交叉连接（cross）

##### 内连接





内连接(INNER JOIN)使用比

较运算符进行表间某(些)列数据的比较操作，并列出这些表中与连接条件相匹配的数据行。根据所使用

的比较方式不同，内连接又分为等值连接、自然连接和不等连接三种。

外连接分为左外连接(LEFT OUTER JOIN或LEFT JOIN)、右外连接(RIGHT OUTER JOIN或RIGHT JOIN)

和全外连接(FULL OUTER JOIN或FULL JOIN)三种。与内连接不同的是，外连接不只列出与连接条件相匹

配的行，而是列出左表(左外连接时)、右表(右外连接时)或两个表(全外连接时)中所有符合搜索条件的

数据行。

交叉连接(CROSS JOIN)没有WHERE 子句，它返回连接表中所有数据行的笛卡尔积，其结果集合中的

数据行数等于第一个表中符合查询条件的数据行数乘以第二个表中符合查询条件的数据行数。

连接操作中的ON (join_condition) 子句指出连接条件，它由被连接表中的列和比较运算符、逻辑

运算符等构成。

无论哪种连接都不能对text、ntext和image数据类型列进行直接连接，但可以对这三种列进行间接

连接。

