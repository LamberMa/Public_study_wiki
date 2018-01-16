# Mysql基础操作

## 1、库操作，DDL

### 1.1 创建（create）

create database 库名 [库选项]

![](http://omk1n04i8.bkt.clouddn.com/17-9-25/45809924.jpg)

注意的问题：

库选项，只有字符集，校对集的概念！每个库，会对应一个数据目录

![](http://omk1n04i8.bkt.clouddn.com/17-9-25/30978819.jpg)

![](http://omk1n04i8.bkt.clouddn.com/17-9-25/91773687.jpg)

默认的只有字符集，校对集的概念：

![](http://omk1n04i8.bkt.clouddn.com/17-9-25/9094061.jpg)

其他需要注意的问题：

- 关于创建名称大小写的问题，这个是跟着系统走的，看你操作是否大小写敏感，比如windows是大小写不敏感的，但是linux是敏感的，因此为了保持一致性，使用的时候要保持大小写敏感，从而保证系统的稳定运行

- 你创建的库或者是表不能是关键字敏感的，比如下面的：

  ```
  mysql> create database order;
  ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'order' at line 1
  ```

  但是这并不是绝对的，我们只要告诉数据库我要创建的这是一个表名称就可以了，需要将名称用反引号引起来，就是数组1左侧的那个按键：

  ```
  mysql> create database `order`;
  Query OK, 1 row affected (0.00 sec)
  ```

- 中文等都可以作为标识符（库名），需要同样反引号！（多字节字符，还需要注意字符集的问题），需要设置字符集为gbk，因为当前是在windows上。不然无法创建的。

  ```
  mysql> set names gbk;
  Query OK, 0 rows affected (0.00 sec)

  mysql> create database `小雨`;
  Query OK, 1 row affected (0.04 sec)

  mysql> show databases;
  +--------------------+
  | Database           |
  +--------------------+
  | information_schema |
  | 小雨               |
  | mysql              |
  | order              |
  | performance_schema |
  | sys                |
  | test               |
  +--------------------+
  7 rows in set (0.00 sec)
  ```

### 1.2 查询库

```mysql
show databases;
show databases likes '%_scheme';   # 使用like可以实现通配符匹配
=========================================
可以使用通配符（通用匹配符，可以匹配多个字符）
% 匹配任意字符的任意次数（包括0次）的组合！
_ 匹配任意字符的一次！
like ‘x_y’;
x1y xby xxy（可以）
xy(不可以)
通配符是与 like 关键字一起使用！
=========================================
```

注意如需要匹配特定的通配符，则需要对通配符转义，使用反斜杠\完成转义！

![](http://omk1n04i8.bkt.clouddn.com/17-9-25/55760220.jpg)

**查看某一个库的定义**

```mysql
mysql> show create database mysql\G;
*************************** 1. row ***************************
       Database: mysql
Create Database: CREATE DATABASE `mysql` /*!40100 DEFAULT CHARACTER SET latin1 */
1 row in set (0.00 sec)

ERROR:
No query specified
```

### 1.3 修改库

alter database 数据库名

```
mysql> alter database `小雨` charset gbk;
Query OK, 1 row affected (0.00 sec)
```

### 1.4 删除库

drop database 名字

### 1.5 if not exist,if exist

```mysql
在  create  与 drop 时，创建和删除时，有两个额外的操作：
 
create database if not exists
如果不存在则创建
 
drop database if exists
如果存在，则删除
```

### 1.6 查看警告状态

show warnings;   

此命令可以查看警告项

## 2、表操作

### 2.1 创建，create table

```mysql
create table 表名 (
字段的定义
) [表选项];

其中表名，一定先要确定数据库！因此一个典型的表名是由两部分组成：
所在库.表名（库与表之间用“.”连接）
test.itcast       test库内itcast表
itcast.stu         itcast库内的stu表
但是我们可以设置默认数据库，如果不指定则使用默认数据库（当前数据库）
use 数据库名。选择默认数据库！
在使用表名但是没有指明其所在数据库时，默认数据库才会起作用！

比如：
在itcast库内创建：
use itcast ; create table stu;
或者
create table itcast.stu
```

**关于字段**

字段才是最终的数据的载体（与变量的概念是类似的，都是基本保存数据的），mysql的是强类型，字段的类型是固定的，提前定义好的！因此，在定义字段时，至少要字段名和字段类型！两种最基本的mysql数据类型（int， varchar,varchar必须指定最大长度字符为单位）varchar单位为字符数，一般是255.比如大葱，这就是两个字符，在UTF-8中就是占用6个字节。具体多少字节和字符集有关系。

创建一个表的示例：

```mysql
mysql> create table test2 (
        id int auto_increment,
        name varchar(255),
        sex char(16)
        ) engine=innodb charset=utf8;
        
About auto_increment:
auto_increment指的是自增列，这个列可以实现数据id自增，常用与表的id列。
我们可以指定auto_increment的起始位置

alter table table_name AUTO_INCREMENT=20;
或者在创建的时候在engine后面跟一个auto_increment=xx也可以

当然现在自增是一个一个的，我们可以为它设置步长，可以跳着增加。
mysql自增步长是基于会话级别的，什么叫会话级别的，就是你当前打开一个mysql终端
这就是建立了一个会话，针对当前有一个设置有一个默认的步长：
mysql> show session variables like 'auto_increment%';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| auto_increment_increment | 1     |
| auto_increment_offset    | 1     |
+--------------------------+-------+
2 rows in set, 1 warning (0.00 sec)
大家默认的步长都是1，每个会话的步长可以不一样，我们可以通过set命令

mysql> set session auto_increment_increment=2;
Query OK, 0 rows affected (0.00 sec)
当然退出重新登录就相当于一个新的会话了，之前的设置就没了。

如果要设置所有人都一样的话也不是不可以，设置全局变量即可：
mysql> set global auto_increment_increment=200;
Query OK, 0 rows affected (0.00 sec)
当然服务器重启以后还是会重置，如果需要永久修改还是放到配置文件去吧。

当然还有基于表级别的设置步长，给一个表单独设置步长。这个和会话就没关系了。
```

- 当然字段可以创建的时候就指定好，也可以后续的添加：

```
alter table table_name add column 字段定义 [字段位置]

eg:
mysql> alter table test2 add column age int;
Query OK, 0 rows affected (0.91 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc test2;
+-------+--------------+------+-----+---------+-------+
| Field | Type         | Null | Key | Default | Extra |
+-------+--------------+------+-----+---------+-------+
| id    | int(11)      | YES  |     | NULL    |       |
| name  | varchar(255) | YES  |     | NULL    |       |
| sex   | char(16)     | YES  |     | NULL    |       |
| age   | int(11)      | YES  |     | NULL    |       |
+-------+--------------+------+-----+---------+-------+
4 rows in set (0.00 sec)

指定添加字段的位置，加在某一个字段后可以使用after，加在第一行可以使用first关键字：
mysql> alter table test2 add column comment varchar(255) after sex;
Query OK, 0 rows affected (0.68 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc test2;
+---------+--------------+------+-----+---------+-------+
| Field   | Type         | Null | Key | Default | Extra |
+---------+--------------+------+-----+---------+-------+
| id      | int(11)      | YES  |     | NULL    |       |
| name    | varchar(255) | YES  |     | NULL    |       |
| sex     | char(16)     | YES  |     | NULL    |       |
| comment | varchar(255) | YES  |     | NULL    |       |
| age     | int(11)      | YES  |     | NULL    |       |
+---------+--------------+------+-----+---------+-------+
5 rows in set (0.00 sec)
```

### 2.2 查

查看所有的表：

```mysql
mysql> show tables;
+----------------+
| Tables_in_test |
+----------------+
| test1          |
| test2          |
+----------------+
2 rows in set (0.00 sec)
```

使用like进行模糊匹配：

```mysql
mysql> show tables like '%es%';
+-----------------------+
| Tables_in_test (%es%) |
+-----------------------+
| test1                 |
| test2                 |
+-----------------------+
2 rows in set (0.02 sec)
```

查看建表的时候相关信息：

```python
mysql> show create table test1\G;
*************************** 1. row ***************************
       Table: test1
Create Table: CREATE TABLE `test1` (
  `id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `sex` char(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1
1 row in set (0.00 sec)
```

查询表结构

```mysql
mysql> desc test1;
+-------+--------------+------+-----+---------+-------+
| Field | Type         | Null | Key | Default | Extra |
+-------+--------------+------+-----+---------+-------+
| id    | int(11)      | YES  |     | NULL    |       |
| name  | varchar(255) | YES  |     | NULL    |       |
| sex   | char(16)     | YES  |     | NULL    |       |
+-------+--------------+------+-----+---------+-------+
3 rows in set (0.00 sec)
```

### 2.3 改

alter命令进行修改的操作，alter table table_name 设置对应的字段值：

```mysql
mysql> alter table test1 engine=myisam charset=gbk;
Query OK, 0 rows affected (0.64 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> show create table test1\G;
*************************** 1. row ***************************
       Table: test1
Create Table: CREATE TABLE `test1` (
  `id` int(11) DEFAULT NULL,
  `name` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `sex` char(16) CHARACTER SET latin1 DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=gbk
1 row in set (0.00 sec)
```

表名称的修改

```mysql
rename table test1 to hahahal

mysql> show tables;
+----------------+
| Tables_in_test |
+----------------+
| hahahal        |
| test2          |
+----------------+
2 rows in set (0.00 sec) 

注意，表名可以由库名.表名形式的！因此，可以跨库修改表名：只要在表名前增加库名即可
```

针对字段的定义的修改：

```mysql
alter table table_name modify column column_name 新的定义！

eg:
mysql> desc test2;
+---------+--------------+------+-----+---------+-------+
| Field   | Type         | Null | Key | Default | Extra |
+---------+--------------+------+-----+---------+-------+
| id      | int(11)      | YES  |     | NULL    |       |
| name    | varchar(255) | YES  |     | NULL    |       |
| sex     | char(16)     | YES  |     | NULL    |       |
| comment | varchar(255) | YES  |     | NULL    |       |
| age     | int(11)      | YES  |     | NULL    |       |
+---------+--------------+------+-----+---------+-------+
5 rows in set (0.00 sec)

mysql> alter table test2 modify column id char(4) after age;
Query OK, 0 rows affected (0.79 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc test2;
+---------+--------------+------+-----+---------+-------+
| Field   | Type         | Null | Key | Default | Extra |
+---------+--------------+------+-----+---------+-------+
| name    | varchar(255) | YES  |     | NULL    |       |
| sex     | char(16)     | YES  |     | NULL    |       |
| comment | varchar(255) | YES  |     | NULL    |       |
| age     | int(11)      | YES  |     | NULL    |       |
| id      | char(4)      | YES  |     | NULL    |       |
+---------+--------------+------+-----+---------+-------+
5 rows in set (0.00 sec)
```

修改字段名称：

```mysql
alter table table_name change column 原字段名 新字段名 新字段定义！【选项】
注意，不是纯粹的改名，而是需要在修改定义的同时改名！

mysql> desc test2;
+---------+--------------+------+-----+---------+-------+
| Field   | Type         | Null | Key | Default | Extra |
+---------+--------------+------+-----+---------+-------+
| name    | varchar(255) | YES  |     | NULL    |       |
| sex     | char(16)     | YES  |     | NULL    |       |
| comment | varchar(255) | YES  |     | NULL    |       |
| age     | int(11)      | YES  |     | NULL    |       |
| id      | char(4)      | YES  |     | NULL    |       |
+---------+--------------+------+-----+---------+-------+
5 rows in set (0.00 sec)

mysql> alter table test2 change column name username char(128) after sex;
Query OK, 0 rows affected (0.77 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> desc test2;
+----------+--------------+------+-----+---------+-------+
| Field    | Type         | Null | Key | Default | Extra |
+----------+--------------+------+-----+---------+-------+
| sex      | char(16)     | YES  |     | NULL    |       |
| username | char(128)    | YES  |     | NULL    |       |
| comment  | varchar(255) | YES  |     | NULL    |       |
| age      | int(11)      | YES  |     | NULL    |       |
| id       | char(4)      | YES  |     | NULL    |       |
+----------+--------------+------+-----+---------+-------+
5 rows in set (0.00 sec)
```

### 2.4 删

- 直接删除表

```mysql
drop table table_name;
```

- 删除字段

```mysql
alter table table_name drop column column_name;
```

## 3、数据操作

### 3.1 增

insert into 表名 (字段列表) values (与字段相对的值列表)。不一定要一次性插入所有字段，或者按照原始的字段顺序插入，但是字段要与值的数量匹配。

![](http://omk1n04i8.bkt.clouddn.com/17-9-26/38995012.jpg)

如果数量不匹配的话就会报错：

```mysql
mysql> insert into test2 (sex,username,comment) values('male');
ERROR 1136 (21S01): Column count doesn't match value count at row 1
```

当然如果要向所有的字段插入数据的话那么就可以省略字段直接添加values，同样的，要一一对应。

```mysql
mysql> insert into test2 values('male','lamber','test',26,2);
Query OK, 1 row affected (0.11 sec)

mysql> select * from test2;
+------+----------+---------+------+------+
| sex  | username | comment | age  | id   |
+------+----------+---------+------+------+
| male | lamber   | test    |   26 | 2    |
+------+----------+---------+------+------+
1 row in set (0.00 sec)

也可以一条命令添加多条数据：
insert into test2 values('male','lamber','test',26,2),('female','testuser1','test2',27,1)……;
多个数据之间都接在values后面用逗号隔开。
```

将A表里的数据插入到B表：

```mysql
insert into tableB(name,age) select name,age from tableA
```

也是支持上面这种写法的。

### 3.2 删

- 清空表数据

```mysql
delete from table_name;
truncate table table_name;

说下二者的区别，truncate是要比delete from清空数据快的多的，DELETE 语句每次删除一行，并在事务日志中为所删除的每行记录一项。TRUNCATE TABLE 通过释放存储表数据所用的数据页来删除数据，并且只在事务日志中记录页的释放。 简单来说delete比较慢的原因是它是一行一行删的。

TRUNCATE,DELETE,DROP放在一起比较：
TRUNCATE TABLE：删除内容、释放空间但不删除定义。
DELETE TABLE:删除内容不删除定义，不释放空间。
DROP TABLE：删除内容和定义，释放空间。
```

- 删除详细数据就要结合where条件语句

```mysql
delete from 表名 where 条件;
关于条件，可以省略。表示永远为真。注意，删除是不可逆的。要避免没有条件的删除！

delete from t_name where id > 2; [> < != = or and]
```

### 3.3 改

update操作

```mysql
update 表名 set 字段=新值, 字段n=新值n where 条件

eg:
mysql> update test2 set name='shiyue2' where name='shiyue';
Query OK, 1 row affected (0.30 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> select * from test2;
+----+---------+------+---------+
| id | name    | age  | comment |
+----+---------+------+---------+
|  1 | lamber  |   26 | test1   |
|  2 | shiyue2 |   23 | test2   |
+----+---------+------+---------+
2 rows in set (0.00 sec)
```

### 3.4 查

`select 字段列表 from 表名 [where 条件表达式]`

其中字段列表可以使用 * 表示所有字段！

```mysql
mysql> select * from test2;
+----+--------+------+---------+
| id | name   | age  | comment |
+----+--------+------+---------+
|  1 | lamber |   26 | test1   |
|  2 | shiyue |   23 | test2   |
+----+--------+------+---------+
2 rows in set (0.00 sec)
```

关于条件表达式，默认是没有，表示永远为真！但是，很少出现没有条件的情况！为了突出，应该所有的语句都有查询条件！即使没有条件，我也强制增加一个 where 1;（1表示true）

```mysql
mysql> select * from test2 where id=2;
+----+--------+------+---------+
| id | name   | age  | comment |
+----+--------+------+---------+
|  2 | shiyue |   23 | test2   |
+----+--------+------+---------+
1 row in set (0.00 sec)
```

## 4、数据类型

```mysql
bit[(M)]
二进制位（101001），m表示二进制位的长度（1-64），默认m＝1

tinyint[(m)] [unsigned] [zerofill]
小整数，数据类型用于保存一些范围的整数数值范围：
有符号：-128 ～ 127.
无符号：～ 255

特别的： MySQL中无布尔值，使用tinyint(1)构造。

int[(m)][unsigned][zerofill]
整数，数据类型用于保存一些范围的整数数值范围：
有符号：-2147483648 ～ 2147483647
无符号：～ 4294967295

特别的：整数类型中的m仅用于显示，对存储范围无限制。例如： int(5),当插入数据2时，select 时数据显示为： 00002

bigint[(m)][unsigned][zerofill]
大整数，数据类型用于保存一些范围的整数数值范围：
有符号：-9223372036854775808 ～ 9223372036854775807
无符号：～  18446744073709551615

decimal[(m[,d])] [unsigned] [zerofill]
准确的小数值，m是数字总个数，算上小数点前+小数点后面支持的总位数（负号不算），d是小数点后个数。 m最大值为65，d最大值为30。
用法：decimal(10,5)
特别的：对于精确数值计算时需要用此类型.decaimal能够存储精确值的原因在于其内部按照字符串存储。

FLOAT[(M,D)] [UNSIGNED] [ZEROFILL]
单精度浮点数（非准确小数值），m是数字总个数，d是小数点后个数。
无符号：
-3.402823466E+38 to -1.175494351E-38,
1.175494351E-38 to 3.402823466E+38
有符号：
1.175494351E-38 to 3.402823466E+38
**** 数值越大，越不准确 ****

DOUBLE[(M,D)] [UNSIGNED] [ZEROFILL]
双精度浮点数（非准确小数值），m是数字总个数，d是小数点后个数。
无符号：
-1.7976931348623157E+308 to -2.2250738585072014E-308
2.2250738585072014E-308 to 1.7976931348623157E+308
有符号：
2.2250738585072014E-308 to 1.7976931348623157E+308
**** 数值越大，越不准确 ****


char (m)
char数据类型用于表示固定长度的字符串，可以包含最多达255个字符。其中m代表字符串的长度。char一上来就会开辟你指定的空间的大小。如果没有占满会填充空
PS: 即使数据小于m长度，也会占用m长度
varchar(m)【节省空间，但是速度没有char快】
varchars数据类型用于变长的字符串，可以包含最多达255个字符。其中m代表该数据类型所允许保存的字符串的最大长度，只要长度小于该最大值的字符串都可以被保存在该数据类型中。

注：虽然varchar使用起来较为灵活，但是从整个系统的性能角度来说，char数据类型的处理速度更快，有时甚至可以超出varchar处理速度的50%。因此，用户在设计数据库时应当综合考虑各方面的因素，以求达到最佳的平衡。因此定长的往前放，变长的往后放。

text
text数据类型用于保存变长的大字符串，可以组多到65535 (2**16 − 1)个字符。

mediumtext
A TEXT column with a maximum length of 16,777,215 (2**24 − 1) characters.

longtext
A TEXT column with a maximum length of 4,294,967,295 or 4GB (2**32 − 1) characters.

enum，枚举类型：
An ENUM column can have a maximum of 65,535 distinct elements. (The practical limit is less than 3000.)
示例：
CREATE TABLE shirts (
    name VARCHAR(40),
    size ENUM('x-small', 'small', 'medium', 'large', 'x-large')
);
INSERT INTO shirts (name, size) VALUES ('dress shirt','large'), ('t-shirt','medium'),('polo shirt','small');

set
集合类型
A SET column can have a maximum of 64 distinct members.
示例：
    CREATE TABLE myset (col SET('a', 'b', 'c', 'd'));
    INSERT INTO myset (col) VALUES ('a,d'), ('d,a'), ('a,d,a'), ('a,d,d'), ('d,a,d');

DATE
    YYYY-MM-DD（1000-01-01/9999-12-31）

TIME
    HH:MM:SS（'-838:59:59'/'838:59:59'）

YEAR
    YYYY（1901/2155）

DATETIME

    YYYY-MM-DD HH:MM:SS（1000-01-01 00:00:00/9999-12-31 23:59:59    Y）

TIMESTAMP

    YYYYMMDD HHMMSS（1970-01-01 00:00:00/2037 年某时）
    
二进制数据类型：
二进制数据：TinyBlob、Blob、MediumBlob、LongBlob
```

### 4.1 针对枚举和set单独拿出来说一下

#### 枚举

需要在定义枚举类型时，列出哪些是可能的！意义在于：

![](http://omk1n04i8.bkt.clouddn.com/17-9-26/28981298.jpg)

1. 限制可以插入值的可能性，不让你随便插入值。
2. 速度快，比普通的字符串速度快！原因是枚举型是利用整数进行管理的，能够2个字节进行管理！每个值，都是一个整数标识，从第一个选项开始为1，逐一递增！

![](http://omk1n04i8.bkt.clouddn.com/17-9-26/91520219.jpg)

管理时整数的形式，速度比字符串快！2 个字节，0-65535，因此可以有 65535个选项可以使用！

![](http://omk1n04i8.bkt.clouddn.com/17-9-26/19664276.jpg)

Tip：注意enum('obj1','obj2')里面的条目要用单引号引起来。

#### 集合

类似于 enum枚举，在定义时，也需要指定其已有值！

![](http://omk1n04i8.bkt.clouddn.com/17-9-26/4899381.jpg)

与字符串相比，优势是：

1. 也是采用整数进行管理的！采用位运算，从第一位开始为1,逐一x2！
2. 每个集合类型8个字节，64位，因此可以表示64个元素！

![](http://omk1n04i8.bkt.clouddn.com/17-9-26/80926930.jpg)

```
注意：
站在 mysql的角度，尽量多用枚举和集合！
但是站在python操作mysql的角度，尽量少用！（兼容性差）
```

## 5、键和约束

### 5.1 主键

主键的用处：保持数据的唯一性。主键不能为空

一张表只能有一个主键，但是并不代表一个主键只能代表一列，我们可以指定多列联合为一个主键：

```mysql
create table test(
id int unsigned not null auto_increment,
name varchar(255) not null,
sex char(8),
content text,
primary key(id,name)
) engine=innodb default charset=utf8;
```

### 5.2 外键约束

约束的作用，是用于保证数据的完整性或者合理性的工具!

外键：foreign key，当前表内，指向其他表的主键的字段，称之为外键！

外键约束：用于限制相关联的记录在逻辑上保证合理性的约束称之为外键约束！

**约束，不是字段。**

![](http://omk1n04i8.bkt.clouddn.com/17-9-26/39334644.jpg)

这样每一次写所属班级的时候不用写班级的名字，直接写班级的id，一定的程度上节省了空间。同时约束可以保证数据的一致性，导致不会让你随便写个班级id导致实际的班级找不到。

首先创建两个表，添加约束。

```mysql
mysql> use test;
Database changed

create table userinfo(
uid int unsigned auto_increment primary key,
name varchar(32),
department_id int unsigned,
constraint fk_user_depart foreign key (`department_id`) references department(`id`)
# 添加约束   约束名称        外键    （约束可以添加多个，多个约束名字不一样即可）      
) engine=innodb default charset=utf8;


create table department(
id int unsigned auto_increment primary key,
title char(15)
) engine=innodb default charset=utf8;
Query OK, 0 rows affected (0.31 sec)

如果建表的时候没有加的话可以后续手动加上：
mysql> alter table userinfo add constraint fk_user_depart foreign key (`department_id`) references department(`id`);
Query OK, 0 rows affected (1.11 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> show create table userinfo\G;
*************************** 1. row ***************************
       Table: userinfo
Create Table: CREATE TABLE `userinfo` (
  `uid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) DEFAULT NULL,
  `department_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`uid`),
  KEY `fk_user_depart` (`department_id`),
  CONSTRAINT `fk_user_depart` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
1 row in set (0.00 sec)
```

Tip：字段，键（key）用反引号引起来。

被约束关联的表是无法直接删除的，比如上面图中的学生表里所属的班级表里的班级id，如果有一个外键在学生表里还有引用，那么这个班级就无法删除，必须把这个学生和这个班级id的关联取消才可以进行删除。

外键的名字是不允许重复的，如果约束引用的表的主键是联合的，那么在设置约束的时候也可以设置多列。如果约束引用的表的主键不是联合主键是单列的就不可以使用这种方式了。

```mysql
CONSTRAINT `test` FOREIGN KEY (`id1`,`id2`) REFERENCES `department`(`d_id`,`s_id`) 
```

## 6、索引

> 索引的目标就是加速查找，比如书的目录
>
> - 约束不能重复（但是可以为空，但是主键不能为空）
> - 加速查找

建立索引最直观的就是加快访问速度，但是建立索引是会占用空间的，因此索引虽然加快了查找的速度但不是完全没有代价的。如果对索引进行滥用的话，虽然大大提高了查询速度，但是会降低更新表的速度，如对表进行INSERT、UPDATE和DELETE。因为更新表时，MySQL不仅要保存数据，还要保存一下索引文件。建立索引会占用磁盘空间的索引文件。一般情况这个问题不太严重，但如果你在一个大表上创建了多种组合索引，索引文件的会膨胀很快。

### 6.1 普通索引

添加普通索引：

```mysql
# 修改表结构添加索引
mysql> alter table test add index idx_id (`id`);
Query OK, 0 rows affected (0.34 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> show create table test\G;
*************************** 1. row ***************************
       Table: test
Create Table: CREATE TABLE `test` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `sex` char(8) DEFAULT NULL,
  `content` text,
  PRIMARY KEY (`id`,`name`),
  KEY `idx_id` (`id`)   # 我们添加的索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8
1 row in set (0.00 sec)


# 添加索引
CREATE INDEX indexName ON table_name(column(前缀长度length)); 

# 建表的时候添加索引
index index_name (column(length))
```

删除索引

```mysql
drop index index_name on table_name;
```

### 6.2 唯一索引

唯一索引可以在创建的时候添加也可以在创建以后补加，唯一索引的索引列的值可以为空，但是必须唯一，如果是组合索引，那么组合索引的值必须唯一。

- 创建的时候添加

```mysql
unique 索引名称 (索引字段)
```

- 创建后补加

```mysql
ALTER TABLE `table_name` ADD UNIQUE index_name (`column`(length))  # length可以不写
CREATE UNIQUE INDEX indexName ON table_name(username(length)) 
```

***

上面说到的是单列索引，当然索引和是多列的，称为组合索引。如果where判定条件有一个的话那么单列索引就足够了。

>有四种方式来添加数据表的索引：
>
>- ALTER TABLE tbl_name ADD PRIMARY KEY (column_list):  该语句添加一个主键，这意味着索引值必须是唯一的，且不能为NULL。
>- **ALTER TABLE tbl_name ADD UNIQUE index_name (column_list):** 这条语句创建索引的值必须是唯一的（除了NULL外，NULL可能会出现多次）。
>- **ALTER TABLE tbl_name ADD INDEX index_name (column_list):** 添加普通索引，索引值可出现多次。
>- **ALTER TABLE tbl_name ADD FULLTEXT index_name (column_list):**该语句指定了索引为 FULLTEXT ，用于全文索引。

查看表索引信息：

```mysql
mysql> show index from test\G;
```

