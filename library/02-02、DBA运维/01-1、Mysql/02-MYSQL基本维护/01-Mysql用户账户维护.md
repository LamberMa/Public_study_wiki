# Mysql用户维护

账户管理的重要性

- 在mysql中可以通过账户控制允许或者不允许用户执行操作
- 可以精细分配不同的权限给不同职能的账户
- 避免使用root账户
  - 应用不能直接使用root
  - 防止维护期间出错
- 限定特定权限账户确保数据的完整性
  - 允许特定授权账户完成期工作
  - 阻止未经授权的用户访问超出其特权的数据

在root上可以做一些限制的操作：

```mysql
update mysql.user set user='xroot' where user='root';
flush privileges;
```

## 账户管理

查看mysql账户

```mysql
# mysql 5.6及以前版本
select user,host,password from mysql.user;
# 在初始化数据库以后要删除掉匿名账户(在5.7中会自动执行这条命令)
delete from mysql.user where user!='root' or localhost!='localhost';

# mysql 5.7及以后
mysql root@localhost:(none)> select user,host,authentication_string from mysql.user;
```

mysql的账户验证现在大多验证使用mysql_native_password这个plugin，在mysql验证的时候使用以下三个要素：

- 用户名
- 主机所属范围（主机来源）
- 用户密码

查看用户授权有两个函数，一个是user()另外一个是current_user()

```mysql
mysql maxiaoyu@localhost:(none)> select user(),current_user();
+--------------------+----------------+
| user()             | current_user() |
+--------------------+----------------+
| maxiaoyu@localhost | maxiaoyu@%     |
+--------------------+----------------+
1 row in set
Time: 0.006s
```

从上面的结果可以看到user函数是指的当前登录进来的用户和它的主机范围，current_user这个函数指的是授权的信息。

用户连接和查询流程

![](http://omk1n04i8.bkt.clouddn.com/17-10-17/7497028.jpg)

和用户权限把控相关的主要是mysql库中的四张表，user表，db表以及columns_priv表，table_priv表。

创建用户

```mysql
create user 用户名@主机 identified by '密码'
# 这样创建的账号的只有链接权限，其他的啥都做不了
# %通配，_表示匹配一个。
```

用户名建议8~16个字符，密码一般是16-32个字符，mysql域名最好在60个字符以内。我们可以使用mkpasswd去生成随机密码，也可以使用其他的方式。linux可以生成随机密码的方式有很多，可以选择自己喜欢的方式做为常用方式去升级。

创建用户要注意的几个风险：

- 不要创建没有用户名的账号
- 不要创建没有密码的账号
- 在可能的情况下主机限制那里不要使用通配符，尽量缩小范围。

关于主机名的匹配是走最精确的，比如‘root’@'192.168.%'和‘root’@‘192.168.1.%’，它会去优先匹配后面这个，不看排序只看精确程度，或者这里我们可以通过通配符结合/etc/hosts来进行域名的解析数据库的登录。

那么如何针对一个大范围内的部分主机IP进行限制呢？

```mysql
# 比如授权一个
create user 'lamber'@'192.168.1.%' identified by 'password'

# 我现在唯独想把192.168.1.100这个ip的不让他进行访问，那么我们就可以单独处理
create user 'lamber'@'192.168.1.100' identified by 'otherpasswd'

# 由于最精确匹配的原则，这个1.100ip的人的密码就是这个otherpasswd而不是password因此就会限制这个ip的用户的登录
```

使用password函数查看加密处理的authentication_string是什么：

```mysql
mysql maxiaoyu@localhost:mysql> select password('maxiaoyuhahaha');
+-------------------------------------------+
| password('maxiaoyuhahaha')                |
+-------------------------------------------+
| *92A2BE17BB2A1064C25BAE92A1AAFCF8B961B8C2 |
+-------------------------------------------+
1 row in set
Time: 0.006s
```

有时候忘了密码还能猜猜，当然你如果是随机密码那就别这么玩了。。不过密码忘了有一种暴力修改的方式就是：

```mysql
update mysql.user set authentication_string=password('new_pass') where user='current_user';
flush privileges;
```

在使用这个暴力方法的时候务必要加where的条件，要不然不这个系统上的所有mysql账户全部gg，而且修改完以后要刷一下缓存。上面这一种方法并不是官方推荐的方法，当然你也尽可能的不要去使用，手抖一下问题还是挺多的。除了使用上面的暴力方法还可以使用下面这种方法为用户修改密码：

```mysql
set password for 'maxiaoyu'@'%'=password('new_pass');
```

更好地修改方法：

```mysql
set password for 'maxiaoyu'@'%'='hahahaha'

# 因为使用password函数的方法将会在后期的版本被移除，这个信息可以通过show warnings查看
mysql maxiaoyu@localhost:mysql> show warnings\G;
***************************[ 1. row ]***************************
Level   | Warning
Code    | 1287
Message | 'SET PASSWORD FOR <user> = PASSWORD('<plaintext_password>')' is deprecated and will be removed in a future release. Please use SET PASSWORD FOR <user> = '<plaintext_password>' instead
```

使用alter的方法去修改用户的密码：

```mysql
mysql maxiaoyu@localhost:mysql> alter user 'maxiaoyu'@'%' identified by 'new_pass';
Query OK, 0 rows affected
Time: 0.001s
```

确认没有密码的用户（把没有密码的用户干掉）：

```mysql
select user,host from mysql.user where password='';
select user,host from mysql.user where authentication_string='';
```

让用户口令失效，登录后必须修改密码（5.7使用，如果是5.5或者以前的话登录直接会报错）：

```mysql
alter user 'maxiaoyu'@'%' passwird expire;
```

删除用户：

```mysql
# 直接删除该用户，从授权表中删除该用户的记录
drop user 'maxiaoyu'@'%'

# 如果不加主机名的话默认会删除主机名为%的记录
drop user 'maxiaoyu'(drop user 'maxiaoyu'@'%')
```

重命名用户：

```mysql
# 更改账号的名称，保留权限，可以更改：用户名和主机名部分
rename user 'maxiaoyu'@'%' to 'lamber'@'%'
```

如果忘记了语法的使用可以使用help

```mysql
help create user
```

## 权限管理

使用create创建的用户其实是什么权限都没有的，只能看到一个information_schema这么一个库，如果你要创建一个和root一样的权限的账号，可以参考root的权限，很重要的一点就是`with grant option`。

合理的控制授权也是dba的重要责任之一，权限可以划分的很细致，主要从以下几个方面：

- 全局级别
- 数据库级别
- 表级别
- 列级别
- 存储过程级别

**只读用户**

全局，数据库或者表级别权限，只用select

**开发用户**

业务库权限：insert、update、delete、select，call

**管理用户**

全局级别，权限：insert、update、delete、create、alter、drop、file(现在基本不用给这个权限了)、process、shutdown、super

### 以下权限需要注意

FILE：允许用户指示mysql服务器在服务器主机文件系统中读写文件，在mysql5.7中需要打开配置文件中的一个参数来配合：

```mysql
# file
# @secure-file-priv=/tmp
```

如果需要文件权限就需要打开这个注释，不过5.7还是默认把这个给干掉了，因为漏洞还是挺多的。

PROCESS：允许用户使用show processlist语句，这个是管理中常用的语句（如果show processlist显示内容过多的话可以使用[pager more](http://wubx.net/mysql-client-tips/)这个功能）

SUPER：运行用户终止其他客户机的链接，或者更改服务器的运行时的配置，执行kill set shutdown

ALL：授予所有权限（但是不能向其他用户授予权限）

GRANT ALL … WITH GRANT OPTION：授予所有特权，相当于root

### 权限的授予与去除（grant and revoke）

GRANT命令可以给现有的用户添加权限，如果用户不存在的话还可以创建用户

```mysql
grant select,insert,update,delete on *.* to 'maxiaoyu'@'%' identified by 'password'
```

Tips:

- 多个权限使用逗号隔开，不区分大小写
- 授权的对象
  - 全局级别：\*.\*
  - 数据库级别：dbname.\*
  - 表级别：db_name.table_name
- 要创建或是授权的用户：'username'@'hostname(IP/network)'
- 密码：可选

查看账户的权限：

```mysql
show grants;
show grants for current_user();
show grants for 'root'@'localhost';
```

我们可以通过`show privileges`来查看mysql支持的权限：

![](http://omk1n04i8.bkt.clouddn.com/17-10-19/55799788.jpg)

### 权限控制表

|     表（MyISAM）     |       用处       |
| :---------------: | :------------: |
|    mysql.user     | 每个创建的用户在这里都有记录 |
|     mysql.db      |  限制用户做用户特定的db  |
| mysql.tables_priv |   用于表级别的权限控制   |
| mysql.procs_priv  | 用户存储过程和函数权限控制  |

Mysql启动的时候从mysql库中把权限读取加载到内存中，如果通过DML更新权限表需要借助于flush privilegesl才能生效。*<u>特别需要注意的是：不要对权限表进行DML操作</u>*。

#### 权限的revoke

使用revoke语句撤销对用户的授权：

```mysql
revoke delete,insert,update on world_innodb.* from 'maxiaoyu'@'%'
revoke all privileges,grant option from 'maxiaoyu'@'%';

# revoke语法：
# revoke关键字：指定要撤掉的特权列表。
# on子句：只是要撤销特权的级别（全局级别的时候可以不用带）。
# from子句：指定账户名称。
```

批量对部分表进行授权：

```mysql
mysql root@localhost:(none)> use information_schema
You are now connected to database "information_schema" as user "root"
Time: 0.001s
mysql root@localhost:information_schema> select concat('grant select on ',table_schema,'.',table_name," to 'testuser2'@'%';") from tables where table_schema='wordpress' and table_name like "mxy%";
+-------------------------------------------------------------------------------+
| concat('grant select on ',table_schema,'.',table_name," to 'testuser2'@'%';") |
+-------------------------------------------------------------------------------+
| grant select on wordpress.mxyblog_commentmeta to 'testuser2'@'%';             |
| grant select on wordpress.mxyblog_comments to 'testuser2'@'%';                |
| grant select on wordpress.mxyblog_hermit to 'testuser2'@'%';                  |
| grant select on wordpress.mxyblog_hermit_cat to 'testuser2'@'%';              |
| grant select on wordpress.mxyblog_links to 'testuser2'@'%';                   |
| grant select on wordpress.mxyblog_ngg_album to 'testuser2'@'%';               |
| grant select on wordpress.mxyblog_ngg_gallery to 'testuser2'@'%';             |
| grant select on wordpress.mxyblog_ngg_pictures to 'testuser2'@'%';            |
| grant select on wordpress.mxyblog_options to 'testuser2'@'%';                 |
| grant select on wordpress.mxyblog_postmeta to 'testuser2'@'%';                |
| grant select on wordpress.mxyblog_posts to 'testuser2'@'%';                   |
| grant select on wordpress.mxyblog_term_relationships to 'testuser2'@'%';      |
| grant select on wordpress.mxyblog_term_taxonomy to 'testuser2'@'%';           |
| grant select on wordpress.mxyblog_termmeta to 'testuser2'@'%';                |
| grant select on wordpress.mxyblog_terms to 'testuser2'@'%';                   |
| grant select on wordpress.mxyblog_usermeta to 'testuser2'@'%';                |
| grant select on wordpress.mxyblog_users to 'testuser2'@'%';                   |
+-------------------------------------------------------------------------------+
17 rows in set
Time: 0.008s
```

## 禁用验证控制

视频点：第四课：1小时23分









