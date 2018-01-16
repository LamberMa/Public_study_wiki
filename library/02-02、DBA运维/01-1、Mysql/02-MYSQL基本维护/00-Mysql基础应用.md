# MySQL基础

[TOC]

## 日志

- 日志可能会占用大量的磁盘空间
- 现在部分日志可以存储在表里（现在不提倡使用）
- 以文本格式写入日志（二进制日志除外）

### **日志类型**

- 错误日志
- 慢查询日志
- 常规日志
- 二进制日志
- 审计日志

### **日志文件**

| 日志文件 | 选项                                   | 文件名或表名称                     | 程序                            |
| ---- | ------------------------------------ | --------------------------- | ----------------------------- |
| 错误   | --log-error                          | host_name.err               | N/A                           |
| 常规   | --general_log                        | host_name.log/general.log   | N/A                           |
| 慢查询  | --slow_query_log & --long_query_time | host_name-slow.log/slow_log | mysqldumpslow/pt-query-digest |
| 二进制  | --log-bin & --expire-logs-days       | host_name-bin.000001        | mysqlbinlog & binlog2sql      |
| 审计   | --audit_log等                         | audit.log                   | N/A                           |
| 中继   |                                      | host_name-relay.log         |                               |

- 常规日志既会记录正确日志也会记录错误日志
- long_query_time默认是10s，建议改成1s或者以下。慢日志分析推荐pt-query-digest
- 一定要设置二进制日志的expire-logs-days，否则会被日志占满
- relay-log的日志名字是和hostname有关的，不止relaylog，假如说更改了主机名，而且relay-log未定义，按照默认的走，改了主机名以后可能找不到对应命名的relay-log。

查看mysql中和日志有关的变量：

```mysql
mysql> show global variables like '%log%';
```

其中的`log_queries_not_using_indexes`是可以不用开启的，因为小于1s的你用没用其实我也不用关心，你大于1s的即使你用了我毕业要想办法优化。

还有就是log是可以定义到syslog中的，比如说用elk进行收集等等：

```mysql
log_syslog                              | OFF   
log_syslog_facility                     | daemon
log_syslog_include_pid                  | ON    
log_syslog_tag                          |       
```

- relay_log_purge：relay-log被sql thread消耗完毕以后清除掉
- relay_log_space_limit：这个参数默认是开启的，允许我们设置接受的relay-log的最大的大小，当relay-log超过设置的大小了以后就不再从master那边取了。因此这个参数不建议去使用。一般可用于磁盘紧张而且主从复制出现了大量延迟的时候避免被relay-log撑满磁盘空间可以使用这个参数。
- general_log：默认是不开启的，如果想要开启可以`set global general_log = 1`不过这个参数一般也不会进行开启。可以用来排查问题或者在比较严格的环境做审计使用。

**修改日志记录的时间：**

```mysql
time_zone                       | SYSTEM 
system_time_zone                | CST 
```

### 二进制日志

![](http://omk1n04i8.bkt.clouddn.com/17-11-18/17887452.jpg)

**二进制日志什么时间会刷新（切换）？**

- 达到了系统定义的max_binlog_size
- 运行了flush logs
- 服务器重启

在重启这里有一个要进行说明的，重启过程中mysql会去读取这些bin-log的文件名，只是读取文件名，然后根据文件名进行排序，获取最大的，然后在这个最大的序号基础上+1生成一个新的文件（不是根据mysqlbin.index文件产生的，单纯的是根据排序后的序号最大的+1产生的新文件），加入说binlog过多的话，比如上万个，这种情况下不管是开启还是关闭相对来说就会很慢，因此binlog的size要合理的进行设置，太小的话就会造成binlog文件过多的问题。默认的是1个G。用这个默认的设置其实就可以，不要太大也不要太小。

那么mysqlbin.index是干什么用的？

```mysql
mysql> show binary logs;
+----------------------+-----------+
| Log_name             | File_size |
+----------------------+-----------+
| ecs-mysql-bin.000001 |    814133 |
| ecs-mysql-bin.000002 |      1909 |
| ecs-mysql-bin.000003 |       177 |
| ecs-mysql-bin.000004 |       205 |
| ecs-mysql-bin.000005 |       650 |
+----------------------+-----------+
13 rows in set (0.01 sec)
```

上面这一条命令是从index文件中读取的。

![](http://omk1n04i8.bkt.clouddn.com/17-11-18/80515399.jpg)

关于binlog_format：推荐使用row格式。

**查询二进制日志文件**

```mysql
show binary logs;
# 列出当前的日志文件以及大小

show master status;
# 显示mysql当前的日志以及状态（需要super，replication，client权限）

show binlog events in 'mysql-bin.000010';
# mysql的二进制日志是以‘事件（event）’为单位存储到日志中的。一个insert，update……由多个事件组成，比如：
- GTID event
- query event
- table_map event
- write_rows event
- xid event
可以截取事件日志的其中一部分看一下：

| ecs-mysql-bin.000013 | 1009189 | Query     | 1 | 1009263 | BEGIN                          |
| ecs-mysql-bin.000013 | 1009263 | Table_map | 1 | 1009321 | table_id: 461 (zabbix.sessions)|
| ecs-mysql-bin.000013 | 1009321 | Write_rows| 1 | 1009406 | table_id: 461 flags: STMT_END_F|
| ecs-mysql-bin.000013 | 1009406 | Xid       | 1 | 1009437 | COMMIT /* xid=620202 */        |
针对DDL语句，没有query（begin），xid（commit），table_map这样得event。

# 专业名称：日志文件：mysqlbin.000010，字节偏移量（位置），position，单位是字节。
mysql> show master status;
+----------------------+----------+--------------+------------------+-------------------+
| File                 | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+----------------------+----------+--------------+------------------+-------------------+
| ecs-mysql-bin.000013 |  1012070 |              |                  |                   |
+----------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)

[root@maxiaoyu 21:09:53 /data/mysql]
#ll /data/mysql/ecs-mysql-bin.000013
-rw-r----- 1 mysql mysql 1012070 Nov 18 20:18 /data/mysql/ecs-mysql-bin.000013

# 可以看到和上面的master status中的position是一致的。
```

**查看二进制日志：**

二进制日志是无法用文本查看的，日志以紧凑的二进制格式存储，以事件组合，可以使用工具mysqlbinlog来进行查看：

```mysql
mysqlbinlog -v --base64-output=decode-rows ecs-mysql-bin.000013 | less
```

其中mysqlbinlog有几个比较重要的参数，比如：

- --start-position
- --stop-position
- --start-datetime=name
- --stop-datetime-name
- --stop-never

**二进制日志维护：**

基于时间删除二进制日志

```mysql
set global expire_logs_days=7;

purge binary logs before now() -interval 3 days;
PURGE BINARY LOGS BEFORE '2008-04-02 22:46:26';
# 如果忘了purge的使用方法，可以在mysql命令行中直接help purge;
```

根据文件名删除：

```mysql
# 把mysql-bin.000010之前的日志都干掉。
purge binary logs to 'mysql-bin.000010';
```

那么使用purge删除的话会保证主从复制所有数据都传递到从库？当然，这个是不能保证的。因此purge之前要确保日志都传递到从库了（确认方法可以在主库flush logs然后去从库看看有没有传递过去）。还有就是使用purge删除的话会把mysqlbin.index中的也删掉，这个是rm做不到的，因此不建议使用rm进行删除binlog，不过一定要使用rm删除的话，记得在数据库里使用purge调用一下。

### 审计日志

审计日志是官方的一个收费组件，需要购买企业版。

- 基于策略的日志记录：
  - 通过audit_log_policy选项设置
  - 提供日志记录选项ALL、NONE、LOGINS或QUERIES，默认为ALL

在日志文件中生成一个服务器活动审计的记录：

- 内容取决于策略，可能包括：
  - 在系统上发生的错误的记录
  - 客户机链接和断开的链接的时间
  - 客户机在连接期间执行的操作
  - 客户机访问的数据库和表

![](http://omk1n04i8.bkt.clouddn.com/17-11-18/45961731.jpg)

## DBA运维常用命令总览

### 认识information_schema数据库

> 学习利用information_schema的字典信息生成语句，information_schema相当于Mysql的中央信息库。

**模式和模式对象**

服务器的统计信息（状态变量，设置，链接），该库不持久化，属于“虚拟数据库”，不可更改，即使是root也干不掉。我们在物理的datadir下是找不到这个数据库的，可以通过select访问。

#### Information_schema重要对象

比如当我们想统计哪些库中有哪些表的时候，我们就可以这样去访问：

```mysql
mysql> select table_name from information_schema.tables where table_schema='information_schema' order by table_name;
```

查看库中的表和表引擎：

```mysql
mysql> select table_name,engine from information_schema.tables where table_schema='wordpress';
+----------------------------+--------+
| table_name                 | engine |
+----------------------------+--------+
| mxyblog_commentmeta        | MyISAM |
| mxyblog_comments           | MyISAM |
| mxyblog_hermit             | MyISAM |
| mxyblog_hermit_cat         | MyISAM |
| mxyblog_links              | MyISAM |
| mxyblog_ngg_album          | MyISAM |
| mxyblog_ngg_gallery        | MyISAM |
| mxyblog_ngg_pictures       | MyISAM |
| mxyblog_options            | MyISAM |
| mxyblog_postmeta           | MyISAM |
| mxyblog_posts              | MyISAM |
| mxyblog_term_relationships | MyISAM |
| mxyblog_term_taxonomy      | MyISAM |
| mxyblog_termmeta           | MyISAM |
| mxyblog_terms              | MyISAM |
| mxyblog_usermeta           | MyISAM |
| mxyblog_users              | MyISAM |
+----------------------------+--------+
17 rows in set (0.00 sec)
```

查看mysql系统默认的字符集和校对集：

```mysql
mysql> select character_set_name,collation_name from information_schema.collations where is_default='Yes';
```

查看每个库的表统计

```mysql
mysql> select table_schema,count(*) from information_schema.tables group by table_schema;
+--------------------+----------+
| table_schema       | count(*) |
+--------------------+----------+
| carbon             |       23 |
| emlog              |       15 |
| gogs               |       36 |
| information_schema |       61 |
| mysql              |       31 |
| performance_schema |       87 |
| sys                |      101 |
| wordpress          |       17 |
| zabbix             |      127 |
+--------------------+----------+
9 rows in set (0.00 sec)
```

常见用法-语句拼合生成(可以结合into outfile使用)：

```mysql
mysql> select concat("mysqldump -uroot -pxxxx"," ",table_schema," ",table_name,">",table_schema,".",table_name,".bak.sql") from information_schema.tables where table_name like "mxyblog_%"; 
```

### show核心语句(help show)

- show databases
- show tables;/show tables from db_name;
- show columns from db_name.tb_name;
- show full columns from db_name.tb_name;
- show processlist
- show create table table_name
- show index from table_name
- show open tables;
- show table status;

####  show还支持like和where使用

- show databases like 'mxyblog_%';
- show columns from zst where 'Default' is null
- show character set;
- show collation;

## Mysql的目录结构

首先先来看一下data目录下都有什么内容：

```shell
[root@maxiaoyu 11:57:18 /data/mysql]
#ls -lh
total 186M
-rw-r----- 1 mysql mysql    56 Jun 16 12:08 auto.cnf
-rw------- 1 root  root   1.7K Jun 16 12:10 ca-key.pem
-rw-r--r-- 1 root  root   1.1K Jun 16 12:10 ca.pem
-rw-r--r-- 1 root  root   1.1K Jun 16 12:10 client-cert.pem
-rw------- 1 root  root   1.7K Jun 16 12:10 client-key.pem
-rw-r----- 1 mysql mysql 1005K Nov 19 11:22 ecs-mysql-bin.000013
-rw-r----- 1 mysql mysql    23 Nov 18 21:36 ecs-mysql-bin.index
-rw-r----- 1 mysql mysql   830 Nov  6 15:22 ib_buffer_pool
-rw-r----- 1 mysql mysql   76M Nov 19 10:52 ibdata1
-rw-r----- 1 mysql mysql   48M Nov 19 10:52 ib_logfile0
-rw-r----- 1 mysql mysql   48M Aug 28 15:42 ib_logfile1
-rw-r----- 1 mysql mysql   12M Nov 19 11:26 ibtmp1
-rw-r----- 1 mysql mysql  113K Nov  6 14:41 maxiaoyu.err
-rw-r----- 1 mysql mysql     6 Nov  6 15:23 maxiaoyu.pid
-rw-r----- 1 mysql mysql  4.3K Nov  6 15:23 maxiaoyu-slow.log
drwxr-x--- 2 mysql mysql  4.0K Jun 16 12:08 mysql
drwxr-x--- 2 mysql mysql  4.0K Jun 16 12:08 performance_schema
-rw------- 1 root  root   1.7K Jun 16 12:10 private_key.pem
-rw-r--r-- 1 root  root    451 Jun 16 12:10 public_key.pem
-rw-r--r-- 1 root  root   1.1K Jun 16 12:10 server-cert.pem
-rw------- 1 root  root   1.7K Jun 16 12:10 server-key.pem
drwxr-x--- 2 mysql mysql   12K Jun 16 12:08 sys
```

- auto_cnf下存放的是server的uuid

  ```mysql
  [root@maxiaoyu 11:57:21 /data/mysql]
  #cat auto.cnf 
  [auto]
  server-uuid=7e40a68a-5249-11e7-94f1-00163e06bd3d
  ```

- ib_buffer_pool：insert buffer pool

- ibdata1：整体的一个数据字典文件，Innodb表的元数据；变更缓冲区；双写缓冲区；撤销日志。ibdata1存储的内容可以参考[为什么mysql里的ibdata1文件不断的增长](https://linux.cn/article-5829-1.html)

- ib_logfile0：redo文件，建议最少设置成3~5个。

- ibtemp1：临时表文件

**使用mysql_config查找对应的库位置：**

```shell
$sudo /usr/local/mysql/bin/mysql_config
Usage: /usr/local/mysql/bin/mysql_config [OPTIONS]
Compiler: GNU 4.4.4
Options:
        --cflags         [-I/usr/local/mysql/include ]
        --cxxflags       [-I/usr/local/mysql/include ]
        --include        [-I/usr/local/mysql/include]
        --libs           [-L/usr/local/mysql/lib -lmysqlclient -lpthread -lm -lrt -ldl]
        --libs_r         [-L/usr/local/mysql/lib -lmysqlclient -lpthread -lm -lrt -ldl]
        --plugindir      [/usr/local/mysql/lib/plugin]
        --socket         [/tmp/mysql.sock]
        --port           [0]
        --version        [5.7.18]
        --libmysqld-libs [-L/usr/local/mysql/lib -lmysqld -lpthread -lm -lrt -lcrypt -ldl -laio]
        --variable=VAR   VAR is one of:
                pkgincludedir [/usr/local/mysql/include]
                pkglibdir     [/usr/local/mysql/lib]
                plugindir     [/usr/local/mysql/lib/plugin]
```

**mysql对应的插件目录（比如半同步）**：

```shell
/usr/local/mysql/lib/plugin
```

**帮助手册：**

如果说系统的帮助手册man不到mysql的话我们可以手动拷贝一下mysql安装目录中的man手册到系统下，这样就可以实现使用系统man查看帮助手册了：

```shell
cp /usr/local/mysql/man/man* /usr/local/share/man -r
```

**share目录**

share目录保存的是一些字符集，以及一些初始化用的sql。 

**bin目录：**

- mysqld
- mysql
- mysqldump
- mysqlbinlog
- mysqladmin
- mysql_config_editor：配合--login-path使用
- perror：展示错误代码
- mysqlslap：做mysql的性能测试

**性能测试工具：**

- sysbench1.1
- mysql-tpcc：使用percona版本
- YCSB：雅虎的，可以适配多种数据库 & NOSQL
- fio：磁盘性能监测

***

如果说遇到数据库整库打包迁移后域名解析错误该怎么办？

```shell
# 这种问题可以借助sql自带的resolveip来反解析一下看看对不对

[lamber@maxiaoyu 12:59:52 /usr/local/mysql/bin]
$./resolveip 47.94.132.15
Host name of 47.94.132.15 is maxiaoyu, blog.dcgamer.top

# 如果说不对的话可以使用strace来看一下
$strace ./resolveip 47.94.132.15 
```

***

安装percona-tools



mysqlbinlog统计：

https://github.com/wubx/mysql-binlog-statistic

### Mysql的5.7的SYS库

