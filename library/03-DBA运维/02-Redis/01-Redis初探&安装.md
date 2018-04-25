# redis

>- 支持数据结构类型丰富，比如string字符串，散列hashes，列表lists，集合sets，有序集合sorted sets于范围查询，bitmaps，hyperlogslogs和地理空间（geospatial）索引半径查询。
>- 丰富的支持主流语言的客户端，c，c++，python，erlang，R，c#，java，php，obc，perl，ruby，scala，go，js
>- 基于内存并且支持持久化，高性能的kv键值对的nosql数据库
>- 用途：缓存，数据库，消息中间件，队列
>- 官方网站：http://www.redis.io

## NoSQL的分类

| 类型      | 主要产品               | 简介                                                         |
| --------- | ---------------------- | ------------------------------------------------------------ |
| KV存储    | redis，memcached       | 使用键快速的找到value，memcached支持string类型的value，redis除了支持string之外还支持set，hash，sort set，list等 |
| 文档存储  | MongoDB，CouchDB       | 使用JSON或者类json的数据结构，存储内容为文档型，能实现部分关系数据库的功能 |
| 列存储    | Hbase，Cassandra       | 按照列进行数据存储，便于存储结构化和半结构化数据（比如输出日志这类的，属于一种半结构化的数据，这种逗号分隔的，我们也知道每一个字段都是什么内容），方便做数据压缩和针对某一列和某几列的数据查询 |
| 图存储    | Neo4J，FlockDB         | 图形相关的存储，能够很好地弥补关系型数据库在图形存储的不足   |
| 对象存储  | Db4o，Versant          | 通过类似面向对象语言的方式操作数据库，通过对象的方式存取数据 |
| XML数据库 | Berkeley DB XML，BaseX | 高效存储XML数据，支持XML的内部查询语法，比如XQuery和XPath    |

## Redis安装

> Redis版本：2.8
>
> 操作系统：Centos7.3
>
> 可视化客户端：RedisDesktopManager
>

### Redis功能特性：

- 持久化功能，将存储在内存的数据保存到硬盘里面去，保证数据的安全，方便备份和恢复
- 发布与订阅，生产者和消费者，相当于与消息中间件。
- 过期键功能，为key设置一个过期时间，让它在指定的时间之后自动被删除
- 事物功能：原子的执行多个操作，并提供乐观锁的功能，保证处理数据时的安全性
- Lua脚本功能：在服务器端原子的执行多个功能，完成复杂的功能，并减少客户端与服务器之间的通信往返次数，
- 复制：为指定的redis服务器创建一个或者多个复制品，用于提升数据的安全性。并分担读请求负载。
- Sentinel（哨兵）：监控redis服务器状态，并在服务器发生故障的时候，进行自动的故障转移
- 集群：创建分布式的数据库，每个服务器分别执行一部分写操作和读操作。

### 安装过程

```shell
# redis安装包下载地址
http://download.redis.io/releases/

# 我要安装在tools下面
cd /tools
wget http://download.redis.io/releases/redis-2.8.18.tar.gz
tar xf redis-2.8.18.tar.gz
yum install gcc tcl -y   # 准备编译安装的环境
make
mkdir /usr/local/redis2.8
make PREFIX=/usr/local/redis2.9 install

# 拷贝对应的执行程序，设置环境变量
cd /tools/redis-2.8.18
cp redis.conf /usr/local/redis2.8/
cd /tools/redis-2.8.18/src
cp redis-sentinel /usr/local/redis2.8/bin/
echo -e 'export REDIS_HOME=/usr/local/redis2.8\nexport PATH=$PATH:$REDIS_HOME/bin' >> ~/.bash_profile
. ~/.bash_profile

# 查看redis-server的使用帮助信息
[root@maxiaoyu 15:03:53 /root]
#redis-server --help
Usage: ./redis-server [/path/to/redis.conf] [options]
       ./redis-server - (read config from stdin)
       ./redis-server -v or --version
       ./redis-server -h or --help
       ./redis-server --test-memory <megabytes>

Examples:
       ./redis-server (run the server with default conf)
       ./redis-server /etc/redis/6379.conf
       ./redis-server --port 7777
       ./redis-server --port 7777 --slaveof 127.0.0.1 8888
       ./redis-server /etc/myredis.conf --loglevel verbose

Sentinel mode:
       ./redis-server /etc/sentinel.conf --sentinel
       
# 可选：把redis做成后台daemon模式
cd /tools/redis-2.8.18/utils
./install_server.sh 
# 把编译好的redis作为一个服务器，把6379.conf放到了/etc/init.d/redis_6379
cd /etc/init.d
mv redis_6379 redisd
chkconfig --add redisd
service redisd start
ss -tanl
```

现在就可以启用redis了：

```shell
redis-server /usr/local/redis2.8/redis.conf
```

使用redis-cli进行连接

- -h：指定要连接的机器
- -p：指定要连接的port，新浪一台开了四个redis，对应四个端口
- -a：传password
- -n：一个redis里面可以由多个database，默认是16个，不同的db是隔离的。database number。默认的db是db0号，我们可以选择不同的号码切换到不同的数据库，数据库的数量可以在配置文件中去配置。

